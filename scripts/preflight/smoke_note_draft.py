# -*- coding: utf-8 -*-
"""note.com draft smoke test.

Posts ONE harmless draft to note.com (not published, not scheduled) and
confirms the eyecatch upload path works. By default deletes the draft
afterwards so the account stays clean.

This is the safest single-step verification of the note API integration —
run it before triggering the full pipeline with `schedule_publish`.

Usage:
    NOTE_SESSION_TOKEN=xxx NOTE_USERNAME=lifeoraclejp \
      python -X utf8 scripts/preflight/smoke_note_draft.py

    # keep the draft for manual inspection in note dashboard
    python -X utf8 scripts/preflight/smoke_note_draft.py --keep

    # supply an existing thumbnail to test eyecatch upload too
    python -X utf8 scripts/preflight/smoke_note_draft.py \
      --thumbnail var/gachijin/jobs/sample-bandwagon/final_day1.png
"""
from __future__ import annotations

import argparse
import logging
import os
import sys
from pathlib import Path


def _load_dotenv() -> None:
    env_file = Path(__file__).resolve().parents[2] / ".env"
    if not env_file.exists():
        return
    for line in env_file.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        k = k.strip()
        if k and not os.environ.get(k):
            os.environ[k] = v.strip()


_load_dotenv()

ROOT = Path(__file__).resolve().parents[2]
SCRIPTS = ROOT / "scripts"
if str(SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SCRIPTS))

from gachijin import note_client  # type: ignore  # noqa: E402

import requests

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("note.smoke")

DRAFT_TITLE = "[preflight] ガチ人 自動投稿 接続テスト"
DRAFT_BODY = (
    "<p>これはガチ人パイプラインのnote API疎通テストで作成された下書きです。</p>"
    "<p>このまま削除して問題ありません。</p>"
)


def delete_draft(note_id: str) -> bool:
    """Best-effort delete: try PUT status=trash, then DELETE."""
    token = os.environ.get("NOTE_SESSION_TOKEN")
    if not token:
        return False
    s = requests.Session()
    s.headers.update(note_client.HEADERS_BASE)
    s.cookies.set("_note_session_v5", token, domain="note.com")

    # Try PUT with status=trash (preferred note.com soft-delete)
    res = s.put(
        f"{note_client.NOTE_API_BASE}/api/v1/text_notes/{note_id}",
        json={"status": "trash"},
        timeout=30,
    )
    if res.status_code in (200, 201, 204):
        return True

    # Fallback: DELETE
    res = s.delete(f"{note_client.NOTE_API_BASE}/api/v1/text_notes/{note_id}", timeout=30)
    return res.status_code in (200, 204)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--thumbnail", type=Path, help="Optional path to a 1280x670 PNG to test eyecatch upload")
    parser.add_argument("--keep", action="store_true", help="Do not delete the draft after success")
    args = parser.parse_args()

    if not os.environ.get("NOTE_SESSION_TOKEN"):
        raise SystemExit("FAIL  NOTE_SESSION_TOKEN is not set in the environment")

    image_bytes: bytes | None = None
    if args.thumbnail:
        if not args.thumbnail.exists():
            raise SystemExit(f"FAIL  thumbnail not found: {args.thumbnail}")
        image_bytes = args.thumbnail.read_bytes()
        print(f"     thumbnail: {args.thumbnail} ({len(image_bytes)} bytes)")

    payload = {
        "name": DRAFT_TITLE,
        "free_body": DRAFT_BODY,
        "hashtags": ["#ガチ人", "#接続テスト"],
        "price": 0,
        "separator": None,
        "disable_comment": False,
    }

    print("---- step 1: create draft ----")
    note = note_client.create_draft(payload)
    note_id = str(note.get("id") or note.get("key") or "")
    note_key = note.get("key") or note_id
    if not note_id:
        raise SystemExit(f"FAIL  draft response missing id/key: {note}")
    note_url = f"https://note.com/{note_client.NOTE_USERNAME}/n/{note_key}"
    print(f"OK   draft id={note_id} key={note_key}")
    print(f"     dashboard: https://editor.note.com/notes/{note_key}/edit")
    print(f"     public URL (when published): {note_url}")

    if image_bytes:
        print("\n---- step 2: upload eyecatch ----")
        eye_catch_key = note_client.upload_eyecatch(image_bytes, note_id)
        print(f"OK   eye_catch_key={eye_catch_key}")
    else:
        print("\nSKIP step 2: no thumbnail provided (use --thumbnail to test)")

    if args.keep:
        print(f"\nKEEP  draft retained at https://editor.note.com/notes/{note_key}/edit")
        print("PASS  note API smoke test succeeded.")
        return 0

    print("\n---- step 3: cleanup (delete draft) ----")
    if delete_draft(note_id):
        print("OK   draft deleted")
    else:
        print(f"WARN draft delete failed — manually remove note_id={note_id} from note dashboard")
    print("\nPASS  note API smoke test succeeded.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
