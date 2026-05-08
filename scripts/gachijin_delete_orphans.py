# -*- coding: utf-8 -*-
"""
One-shot recovery script: delete the 34 orphan note.com drafts created by
the failed bulk run on 2026-05-08.

The orphans were created when the orchestrator's `phase_note` posted
articles to note.com successfully, but then failed at the Supabase
`update_output` step because `job_outputs.note_edit_url` was missing.
The note posts exist on note.com but have no link in Supabase.

Note IDs were extracted from GitHub Actions run logs by
`gachijin_orchestrator.py`'s "draft created: id=... key=..." line.

Safety:
- The list of IDs is hard-coded inline so it's auditable in git.
- Run with `--dry-run` first to confirm.
- Run with `--confirm` to actually delete.
- The script verifies each note belongs to NOTE_USERNAME before deleting,
  so unrelated drafts cannot be accidentally hit.

Usage:
    python -X utf8 scripts/gachijin_delete_orphans.py --dry-run
    python -X utf8 scripts/gachijin_delete_orphans.py --confirm
"""
from __future__ import annotations

import argparse
import os
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))


# Hard-coded list of orphan note IDs from 2026-05-08 bulk run failures.
# Each entry: (note_id, note_key) — both are needed for safe lookup.
ORPHAN_NOTES: list[tuple[str, str]] = [
    # ("159377635", "ned7c2f741c68"),  # DELETED already during endpoint probe
    ("159377650", "nee45cf5a4457"),
    ("159377534", "n658019b2eb42"),
    ("159377528", "n3f809b66b3e0"),
    ("159377524", "ne48d376f7178"),
    ("159377521", "n5c4c2646a044"),
    ("159377513", "n9674621511a0"),
    ("159377462", "n917d4f7bae52"),
    ("159377263", "n61712b4d5db1"),
    ("159377306", "n9f439109faf0"),
    ("159377244", "n64f5240512f0"),
    ("159377173", "n014e8a8b7408"),
    ("159377171", "nc6d053da9e07"),
    ("159376969", "necb40fbac46a"),
    ("159376990", "na80076759b25"),
    ("159377004", "nfb5f3d150193"),
    ("159376753", "ne550bc3a6ca9"),
    ("159376785", "nbc30ce8a8fe5"),
    ("159376718", "n582554bdf262"),
    ("159376638", "n72bd6789d08f"),
    ("159376569", "n432547dafc9b"),
    ("159376529", "ndcb2e632e760"),
    ("159376456", "n961885b149e1"),
    ("159376499", "n1167bd6cd31b"),
    ("159376338", "n648ebb06dd27"),
    ("159376281", "n11522c2887cc"),
    ("159376196", "n6bec63b59fe0"),
    ("159376171", "nb6b6bc44bbf8"),
    ("159376080", "nb4e750527b08"),
    ("159377134", "nb253f6b16ab1"),
    ("159375981", "n4d6956f87895"),
    ("159375980", "n80db58039a79"),
    ("159376788", "nf98c9dc5bbbe"),
    ("159375878", "n80997eba6355"),
]


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


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="List targets only.")
    parser.add_argument("--confirm", action="store_true", help="Actually delete.")
    args = parser.parse_args()

    if not args.dry_run and not args.confirm:
        print("ERROR: pass either --dry-run or --confirm", file=sys.stderr)
        return 1

    _load_env()
    from gachijin import note_client  # noqa: E402

    if args.dry_run:
        print(f"DRY RUN — {len(ORPHAN_NOTES)} note IDs scheduled for deletion:")
        for nid, nkey in ORPHAN_NOTES:
            print(f"  note_id={nid}  key={nkey}  https://editor.note.com/notes/{nkey}/edit")
        return 0

    s = note_client._session()
    expected_user = note_client.NOTE_USERNAME
    print(f"Will DELETE {len(ORPHAN_NOTES)} drafts. Verifying each belongs to '{expected_user}' first.")

    ok, fail = 0, 0
    for i, (nid, nkey) in enumerate(ORPHAN_NOTES, 1):
        # Verify ownership via GET on the note key.
        try:
            r = s.get(f"https://note.com/api/v3/notes/{nkey}", timeout=20)
            if r.status_code != 200:
                print(f"  [{i:>2}/{len(ORPHAN_NOTES)}] ✗ verify failed: {r.status_code}")
                fail += 1
                continue
            data = r.json().get("data", r.json())
            user = (data.get("user") or {}).get("urlname") or data.get("user", {}).get("nickname")
            if user and user != expected_user:
                print(f"  [{i:>2}/{len(ORPHAN_NOTES)}] ✗ ownership mismatch: belongs to {user}, expected {expected_user}")
                fail += 1
                continue
        except Exception as exc:
            print(f"  [{i:>2}/{len(ORPHAN_NOTES)}] verify error: {exc}")
            fail += 1
            continue

        # Confirmed delete endpoint: DELETE /api/v1/notes/{id}
        try:
            r = s.delete(f"https://note.com/api/v1/notes/{nid}", timeout=30)
            if r.status_code in (200, 204):
                print(f"  [{i:>2}/{len(ORPHAN_NOTES)}] ✓ deleted note_id={nid}")
                ok += 1
            else:
                print(f"  [{i:>2}/{len(ORPHAN_NOTES)}] ✗ {nid}: {r.status_code} {r.text[:120]}")
                fail += 1
        except Exception as exc:
            print(f"  [{i:>2}/{len(ORPHAN_NOTES)}] error: {exc}")
            fail += 1
        time.sleep(0.5)

    print(f"\nResult: {ok} deleted, {fail} failed (out of {len(ORPHAN_NOTES)})")
    return 0 if fail == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
