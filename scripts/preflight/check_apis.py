# -*- coding: utf-8 -*-
"""Quick reachability test for Anthropic / OpenAI / note.com.

Each call is the cheapest possible request that still exercises auth:
- Anthropic: a 1-token completion
- OpenAI: list models (no image cost)
- note.com: GET /api/v3/notes/contents (auth check only)

Usage:
    python -X utf8 scripts/preflight/check_apis.py
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from urllib import error, request


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


def check_anthropic() -> bool:
    key = os.environ.get("ANTHROPIC_API_KEY")
    if not key:
        print("SKIP  ANTHROPIC_API_KEY unset")
        return True
    body = json.dumps(
        {
            "model": os.environ.get("GACHIJIN_CLAUDE_MODEL", "claude-haiku-4-5-20251001"),
            "max_tokens": 1,
            "messages": [{"role": "user", "content": "ping"}],
        }
    ).encode("utf-8")
    req = request.Request(
        "https://api.anthropic.com/v1/messages",
        data=body,
        method="POST",
        headers={
            "x-api-key": key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        },
    )
    try:
        with request.urlopen(req, timeout=20) as res:
            res.read()
        print("OK    Anthropic API reachable, key valid")
        return True
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        print(f"FAIL  Anthropic returned {exc.code}: {detail[:200]}")
        return False


def check_openai() -> bool:
    key = os.environ.get("OPENAI_API_KEY")
    if not key:
        print("SKIP  OPENAI_API_KEY unset")
        return True
    req = request.Request(
        "https://api.openai.com/v1/models",
        headers={"Authorization": f"Bearer {key}"},
    )
    try:
        with request.urlopen(req, timeout=15) as res:
            data = json.loads(res.read().decode("utf-8"))
        ids = {m.get("id") for m in data.get("data", [])}
        if "gpt-image-1" in ids:
            print("OK    OpenAI API reachable, gpt-image-1 available")
        else:
            print("WARN  OpenAI reachable but gpt-image-1 not in model list — fallback model may be needed")
        return True
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        print(f"FAIL  OpenAI returned {exc.code}: {detail[:200]}")
        return False


def check_note() -> bool:
    token = os.environ.get("NOTE_SESSION_TOKEN")
    username = os.environ.get("NOTE_USERNAME", "lifeoraclejp")
    if not token:
        print("SKIP  NOTE_SESSION_TOKEN unset")
        return True
    req = request.Request(
        f"https://note.com/api/v2/creators/{username}/contents?kind=note&page=1",
        headers={
            "X-Requested-With": "XMLHttpRequest",
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Cookie": f"_note_session_v5={token}",
        },
    )
    try:
        with request.urlopen(req, timeout=15) as res:
            res.read()
        print(f"OK    note.com reachable, _note_session_v5 valid for {username}")
        return True
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        print(f"FAIL  note.com returned {exc.code}: {detail[:200]}")
        if exc.code in (401, 403):
            print("      → cookie may have expired. Re-extract from Chrome DevTools.")
        return False


def main() -> int:
    ok = True
    ok &= check_anthropic()
    ok &= check_openai()
    ok &= check_note()
    print()
    if ok:
        print("PASS  external APIs reachable (or skipped).")
        return 0
    print("FAIL  one or more API checks failed.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
