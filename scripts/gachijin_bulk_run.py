# -*- coding: utf-8 -*-
"""
Gachijin bulk runner.

Reads gachijin_schedule.json and dispatches the gachijin-pipeline workflow
for ALL themes in one shot. Each pipeline run is configured for:

- mode = schedule_publish (note posts are reserved at start_date day1..day3)
- no_thumbnail = true (OpenAI image API is skipped; user uploads thumbnails
  manually via the note editor before each scheduled publish time)

Designed to run on the local machine, reading credentials from .env.

Usage:
    python -X utf8 scripts/gachijin_bulk_run.py
    python -X utf8 scripts/gachijin_bulk_run.py --skip-themes "サンクコスト・バイアス"
    python -X utf8 scripts/gachijin_bulk_run.py --start-from "損失回避バイアス"
    python -X utf8 scripts/gachijin_bulk_run.py --dry-run
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def _load_env() -> None:
    env_path = ROOT / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def _supabase_post(path: str, data: dict | list) -> list | dict:
    url = f"{os.environ['SUPABASE_URL'].rstrip('/')}/rest/v1/{path}"
    key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    body = json.dumps(data, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(url, data=body, method="POST")
    req.add_header("apikey", key)
    req.add_header("Authorization", f"Bearer {key}")
    req.add_header("Content-Type", "application/json; charset=utf-8")
    req.add_header("Prefer", "return=representation")
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())


def _dispatch_pipeline(job_id: str, no_thumbnail: bool) -> bool:
    token = os.environ.get("GITHUB_ACTIONS_TOKEN")
    repo = os.environ.get("GITHUB_REPO") or "toshioshintani-sys/life-oracle"
    if not token:
        print("  ERROR: GITHUB_ACTIONS_TOKEN not set in .env", file=sys.stderr)
        return False

    url = f"https://api.github.com/repos/{repo}/actions/workflows/gachijin-pipeline.yml/dispatches"
    payload = json.dumps({
        "ref": "main",
        "inputs": {
            "job_id": job_id,
            "no_thumbnail": "true" if no_thumbnail else "false",
        },
    }).encode()
    req = urllib.request.Request(url, data=payload, method="POST")
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("X-GitHub-Api-Version", "2022-11-28")
    req.add_header("Content-Type", "application/json")
    req.add_header("User-Agent", "life-oracle-gachijin-bulk-run")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            resp.read()
        return True
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        print(f"  ERROR: dispatch failed {exc.code}: {body}", file=sys.stderr)
        return False


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--skip-themes", nargs="*", default=[],
                        help="Theme names to skip (already processed).")
    parser.add_argument("--start-from", default=None,
                        help="Start dispatching from this theme (inclusive).")
    parser.add_argument("--throttle-seconds", type=int, default=15,
                        help="Wait between dispatches to avoid rate-limit spikes.")
    parser.add_argument("--dry-run", action="store_true",
                        help="Print what would be dispatched without actually doing it.")
    parser.add_argument("--mode", default="schedule_publish",
                        choices=["schedule_publish", "draft_only"])
    args = parser.parse_args()

    _load_env()

    schedule_path = ROOT / "scripts" / "gachijin_schedule.json"
    schedule = json.loads(schedule_path.read_text(encoding="utf-8"))
    post_time = schedule.get("post_time", "07:00")

    themes = list(schedule["themes"])
    if args.start_from:
        idx = next((i for i, t in enumerate(themes) if t["theme"] == args.start_from), None)
        if idx is None:
            print(f"ERROR: --start-from theme not found: {args.start_from}", file=sys.stderr)
            return 1
        themes = themes[idx:]
    if args.skip_themes:
        themes = [t for t in themes if t["theme"] not in args.skip_themes]

    print(f"Plan: {len(themes)} themes, mode={args.mode}, no_thumbnail=True")
    print(f"Throttle: {args.throttle_seconds}s between dispatches")
    print("-" * 70)

    if args.dry_run:
        for entry in themes:
            print(f"  [dry-run] {entry['theme']:30}  start_date={entry['day1']}")
        return 0

    ok_count, fail_count = 0, 0
    for idx, entry in enumerate(themes, start=1):
        theme = entry["theme"]
        start_date = entry["day1"]
        print(f"[{idx}/{len(themes)}] {theme}  start_date={start_date}")

        try:
            job_data = {
                "series": "gachijin",
                "theme": theme,
                "start_date": start_date,
                "post_time": post_time,
                "mode": args.mode,
                "style_preset": "gachijin_default",
                "status": "queued",
            }
            created = _supabase_post("jobs", job_data)
            job = created[0] if isinstance(created, list) else created
            job_id = job["id"]
            print(f"  job: {job_id}")

            outputs = [{"job_id": job_id, "day_no": d, "status": "queued"} for d in [1, 2, 3]]
            _supabase_post("job_outputs", outputs)

            ok = _dispatch_pipeline(job_id, no_thumbnail=True)
            if ok:
                print(f"  dispatched ✓")
                ok_count += 1
            else:
                fail_count += 1
        except Exception as exc:
            print(f"  ERROR: {exc}", file=sys.stderr)
            fail_count += 1

        if idx < len(themes):
            time.sleep(args.throttle_seconds)

    print("-" * 70)
    print(f"Result: {ok_count} OK, {fail_count} failed (out of {len(themes)})")
    return 0 if fail_count == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
