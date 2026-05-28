# -*- coding: utf-8 -*-
"""
Jin article publish check.

Scans tasks/jin_articles/ for files named YYYY-MM-DD_jin_NN*.md.
If the file's date + 11:30 JST has passed, sets notePublished: true
for the corresponding jin ID in jin_types.json.

Exits with code 0 regardless. Prints a summary of changes made.
"""
from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

JST = timezone(timedelta(hours=9))
PUBLISH_HOUR = 11
PUBLISH_MINUTE = 30

REPO_ROOT = Path(__file__).resolve().parent.parent
ARTICLES_DIR = REPO_ROOT / "tasks" / "jin_articles"
JIN_TYPES_PATH = REPO_ROOT / "life-oracle-v2" / "src" / "data_v2" / "jin" / "jin_types.json"

FILENAME_RE = re.compile(r"^(\d{4}-\d{2}-\d{2})_(jin_\d+)", re.IGNORECASE)


def now_jst() -> datetime:
    return datetime.now(JST)


def publish_datetime(date_str: str) -> datetime:
    """Return the publish datetime (date + 11:30 JST) for a date string YYYY-MM-DD."""
    d = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=JST)
    return d.replace(hour=PUBLISH_HOUR, minute=PUBLISH_MINUTE, second=0, microsecond=0)


def collect_publishable_ids(articles_dir: Path, now: datetime) -> list[str]:
    """Return list of jin IDs whose publish time has passed."""
    ready = []
    if not articles_dir.exists():
        print(f"Articles dir not found: {articles_dir}", file=sys.stderr)
        return ready

    for f in sorted(articles_dir.iterdir()):
        if not f.suffix.lower() == ".md":
            continue
        m = FILENAME_RE.match(f.name)
        if not m:
            print(f"  SKIP (no date/id match): {f.name}")
            continue
        date_str, jin_id = m.group(1), m.group(2).lower()
        try:
            pub_dt = publish_datetime(date_str)
        except ValueError:
            print(f"  SKIP (bad date): {f.name}")
            continue
        if now >= pub_dt:
            ready.append(jin_id)
            print(f"  READY: {jin_id} (published at {pub_dt.isoformat()})")
        else:
            print(f"  NOT YET: {jin_id} (publishes at {pub_dt.isoformat()})")
    return ready


def update_jin_types(json_path: Path, publishable_ids: list[str]) -> int:
    """Set notePublished=True for each id in publishable_ids. Returns count of changes."""
    data = json.loads(json_path.read_text(encoding="utf-8"))
    changed = 0
    id_set = set(publishable_ids)
    for t in data["types"]:
        if t["id"].lower() in id_set and not t.get("notePublished", False):
            t["notePublished"] = True
            print(f"  SET notePublished=true: {t['id']} ({t.get('internalLabel', '')})")
            changed += 1
    if changed:
        json_path.write_text(
            json.dumps(data, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
    return changed


def main() -> int:
    now = now_jst()
    print(f"Jin publish check: now (JST) = {now.isoformat()}")
    print(f"Scanning: {ARTICLES_DIR}")

    publishable = collect_publishable_ids(ARTICLES_DIR, now)
    if not publishable:
        print("No articles ready to publish.")
        return 0

    print(f"\nUpdating jin_types.json for {len(publishable)} id(s)...")
    changed = update_jin_types(JIN_TYPES_PATH, publishable)
    print(f"\nDone. {changed} type(s) updated.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
