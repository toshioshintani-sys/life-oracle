# -*- coding: utf-8 -*-
"""
Upload manually-created thumbnails to existing note.com gachijin drafts.

Workflow:
1. User generates thumbnails with ChatGPT etc., naming each file like:
       gachi_NNN-D_YYYY-MM-DD.png
   where NNN = theme number (001-045), D = day (1-3).
2. User saves them under `var/gachijin/manual_thumbnails/`.
3. User signals: "サムネをアップロードして"
4. This script scans the folder, matches each PNG to its note draft via
   Supabase (theme_no -> theme name -> jobs.id -> job_outputs[day_no].note_url),
   uploads the eyecatch to note.com, updates the post with the new
   eye_catch_key, and moves the file to `var/gachijin/manual_thumbnails/uploaded/`.

Idempotent: safe to re-run. Already-uploaded files (those moved to
`uploaded/`) are skipped.

Usage:
    python -X utf8 scripts/gachijin_upload_manual_thumbs.py
    python -X utf8 scripts/gachijin_upload_manual_thumbs.py --dry-run
"""
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

THUMB_DIR = ROOT / "var" / "gachijin" / "manual_thumbnails"
UPLOADED_DIR = THUMB_DIR / "uploaded"
FILENAME_RE = re.compile(r"^gachi_(\d{3})-([123])_(\d{4}-\d{2}-\d{2})\.png$", re.IGNORECASE)


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


def _supabase_get(path: str) -> list | dict:
    url = f"{os.environ['SUPABASE_URL'].rstrip('/')}/rest/v1/{path}"
    key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    req = urllib.request.Request(url, method="GET")
    req.add_header("apikey", key)
    req.add_header("Authorization", f"Bearer {key}")
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())


def _build_theme_index() -> dict[int, str]:
    """Map theme number → theme name from gachijin_schedule.json."""
    from gachijin.thumbnails import THEME_NUMBERS  # noqa: E402

    schedule = json.loads((ROOT / "scripts" / "gachijin_schedule.json").read_text(encoding="utf-8"))
    out: dict[int, str] = {}
    for entry in schedule["themes"]:
        theme = entry["theme"]
        # Find which THEME_NUMBERS key matches.
        for key, num in THEME_NUMBERS.items():
            if key in theme:
                out[num] = theme
                break
    return out


def _note_key_from_url(url: str) -> str | None:
    m = re.search(r"/n/([a-zA-Z0-9]+)", url or "")
    return m.group(1) if m else None


def _note_id_from_key(note_key: str) -> str:
    """Resolve a note's numeric id from its alphanumeric key via note API."""
    from gachijin import note_client  # noqa: E402

    s = note_client._session()
    resp = s.get(f"{note_client.NOTE_API_BASE}/api/v3/notes/{note_key}", timeout=30)
    if resp.status_code != 200:
        raise RuntimeError(f"GET /api/v3/notes/{note_key} failed: {resp.status_code} {resp.text[:300]}")
    data = resp.json()
    note = data.get("data") or data
    if "id" in note:
        return str(note["id"])
    raise RuntimeError(f"id missing from note response: {note}")


def _update_note_with_eyecatch(note_id: str, eye_catch_key: int, payload_path: str | None) -> None:
    """PUT the existing note draft so the new eyecatch sticks even if the user
    later opens / saves the post in the editor."""
    from gachijin import note_client  # noqa: E402

    s = note_client._session()
    # Read the saved note_payload_*.json from Storage to reconstruct the body.
    if payload_path:
        try:
            bucket = os.environ.get("SUPABASE_STORAGE_BUCKET", "gachijin")
            base = os.environ["SUPABASE_URL"].rstrip("/")
            key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
            url = f"{base}/storage/v1/object/{bucket}/{payload_path}"
            req = urllib.request.Request(url, method="GET")
            req.add_header("apikey", key)
            req.add_header("Authorization", f"Bearer {key}")
            with urllib.request.urlopen(req, timeout=30) as resp:
                stored = json.loads(resp.read())
        except Exception as exc:
            print(f"  WARN: cannot fetch note payload from storage: {exc}", file=sys.stderr)
            stored = {}
    else:
        stored = {}

    body = {
        "author_ids": [],
        "body_length": len(stored.get("free_body", "")),
        "disable_comment": stored.get("disable_comment", False),
        "free_body": stored.get("free_body", ""),
        "hashtags": stored.get("hashtags", []),
        "image_keys": [],
        "name": stored.get("name", ""),
        "price": stored.get("price", 0),
        "send_notifications_flag": False,
        "separator": stored.get("separator"),
        "eye_catch_key": eye_catch_key,
    }
    if stored.get("publish_at"):
        body["status"] = "reserved"
        body["publish_at"] = stored["publish_at"]
    else:
        body["status"] = "draft"

    resp = s.put(f"{note_client.NOTE_API_BASE}/api/v1/text_notes/{note_id}", json=body, timeout=60)
    if resp.status_code not in (200, 201):
        raise RuntimeError(f"PUT note update failed: {resp.status_code} {resp.text[:300]}")


def _process_file(
    path: Path,
    theme_index: dict[int, str],
    dry_run: bool,
) -> tuple[bool, str]:
    m = FILENAME_RE.match(path.name)
    if not m:
        return False, f"filename does not match gachi_NNN-D_YYYY-MM-DD.png: {path.name}"
    theme_no = int(m.group(1))
    day_no = int(m.group(2))

    theme = theme_index.get(theme_no)
    if not theme:
        return False, f"theme #{theme_no} not found in schedule"

    # Find the most recent successful job for this theme.
    safe_theme = theme.replace(",", "")
    jobs = _supabase_get(
        f"jobs?series=eq.gachijin&theme=eq.{urllib.parse.quote(safe_theme)}&order=created_at.desc&limit=10"
    )
    target = None
    for j in jobs:
        if j["status"] in {"scheduled", "draft", "thumbnail_skipped", "verified"}:
            target = j
            break
        if not target:
            target = j  # fallback: most recent regardless of status
    if not target:
        return False, f"no Supabase job for theme {theme!r}"

    outputs = _supabase_get(
        f"job_outputs?job_id=eq.{target['id']}&day_no=eq.{day_no}&select=*"
    )
    if not outputs:
        return False, f"no job_outputs for {target['id']} day{day_no}"
    output = outputs[0]
    note_url = output.get("note_url")
    if not note_url:
        return False, f"note_url missing on output {output['id']}"

    note_key = _note_key_from_url(note_url)
    if not note_key:
        return False, f"cannot parse note key from url {note_url}"

    if dry_run:
        return True, f"[dry-run] would upload to note key={note_key} (theme={theme!r} day{day_no})"

    note_id = _note_id_from_key(note_key)

    from gachijin import note_client  # noqa: E402

    image_bytes = path.read_bytes()
    eye_catch_key = note_client.upload_eyecatch(image_bytes, note_id, filename=path.name)

    _update_note_with_eyecatch(note_id, eye_catch_key, output.get("note_payload_path"))

    UPLOADED_DIR.mkdir(parents=True, exist_ok=True)
    shutil.move(str(path), str(UPLOADED_DIR / path.name))

    return True, f"uploaded {path.name} -> note {note_key} (eye_catch_key={eye_catch_key})"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true",
                        help="Print what would be uploaded without actually uploading.")
    args = parser.parse_args()

    _load_env()
    THUMB_DIR.mkdir(parents=True, exist_ok=True)

    theme_index = _build_theme_index()
    candidates = sorted(p for p in THUMB_DIR.iterdir() if p.is_file() and p.suffix.lower() == ".png")
    if not candidates:
        print(f"No PNG files in {THUMB_DIR}")
        return 0

    print(f"Found {len(candidates)} PNG file(s) in {THUMB_DIR}")
    print("-" * 70)

    ok_count, fail_count = 0, 0
    for path in candidates:
        try:
            ok, msg = _process_file(path, theme_index, args.dry_run)
        except Exception as exc:
            ok, msg = False, f"exception: {exc}"
        prefix = "✓" if ok else "✗"
        print(f"  {prefix} {path.name}: {msg}")
        if ok:
            ok_count += 1
        else:
            fail_count += 1

    print("-" * 70)
    print(f"Result: {ok_count} ok, {fail_count} failed")
    return 0 if fail_count == 0 else 1


if __name__ == "__main__":
    import urllib.parse  # noqa: E402

    sys.exit(main())
