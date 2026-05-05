# -*- coding: utf-8 -*-
"""GitHub Actions preflight check.

Verifies that the workflow file exists, the dispatching token has
sufficient scope, and the repository secrets the workflow expects are
present. Does NOT actually trigger a run.

Usage:
    GITHUB_TOKEN=ghp_xxx GITHUB_REPO=owner/repo \
      python -X utf8 scripts/preflight/check_github.py
"""
from __future__ import annotations

import os
import sys
from pathlib import Path
from urllib import error, request
import json


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

REQUIRED_SECRETS = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "ANTHROPIC_API_KEY",
    "OPENAI_API_KEY",
    "NOTE_SESSION_TOKEN",
    "NOTE_USERNAME",
]
OPTIONAL_SECRETS = ["SUPABASE_STORAGE_BUCKET"]
WORKFLOW_FILE = "gachijin-pipeline.yml"


def _gh(method: str, path: str, token: str):
    req = request.Request(
        f"https://api.github.com{path}",
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "gachijin-preflight",
        },
    )
    try:
        with request.urlopen(req, timeout=15) as res:
            return res.status, json.loads(res.read().decode("utf-8"))
    except error.HTTPError as exc:
        return exc.code, exc.read().decode("utf-8", errors="replace")


def main() -> int:
    token = os.environ.get("GITHUB_ACTIONS_TOKEN") or os.environ.get("GITHUB_TOKEN")
    repo = os.environ.get("GITHUB_REPO") or os.environ.get("GITHUB_REPOSITORY")
    if not token or not repo:
        raise SystemExit("FAIL  set GITHUB_ACTIONS_TOKEN (or GITHUB_TOKEN) and GITHUB_REPO=owner/repo")
    print(f"     repo: {repo}")

    # 1. Token scope (best-effort) — check via /user (must succeed) and presence
    #    of `x-oauth-scopes` header on the response.
    req = request.Request(
        "https://api.github.com/user",
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "User-Agent": "gachijin-preflight",
        },
    )
    try:
        with request.urlopen(req, timeout=15) as res:
            scopes = res.headers.get("x-oauth-scopes", "")
            print(f"OK    token authenticated; scopes: {scopes or '(unspecified)'}")
            if "workflow" not in scopes and "repo" not in scopes:
                print("WARN  token may lack `workflow` scope; dispatch may 403")
    except error.HTTPError as exc:
        raise SystemExit(f"FAIL  token rejected: {exc.code} {exc.read().decode('utf-8', errors='replace')}")

    # 2. Workflow file present
    status, body = _gh("GET", f"/repos/{repo}/actions/workflows/{WORKFLOW_FILE}", token)
    if status == 200:
        print(f"OK    workflow {WORKFLOW_FILE} found (id={body.get('id')})")
    elif status == 404:
        raise SystemExit(f"FAIL  workflow {WORKFLOW_FILE} not found in {repo}")
    else:
        raise SystemExit(f"FAIL  workflow lookup returned {status}: {body}")

    # 3. Repo secrets — list names (we cannot read values via API)
    status, body = _gh("GET", f"/repos/{repo}/actions/secrets", token)
    if status != 200:
        raise SystemExit(f"FAIL  cannot list secrets ({status}): {body}")
    have = {s["name"] for s in body.get("secrets", [])}
    missing = [s for s in REQUIRED_SECRETS if s not in have]
    print()
    for name in REQUIRED_SECRETS:
        if name in have:
            print(f"OK    secret {name}")
        else:
            print(f"FAIL  secret {name} missing")
    for name in OPTIONAL_SECRETS:
        if name in have:
            print(f"OK    secret {name}")
        else:
            print(f"INFO  secret {name} unset (optional)")

    print()
    if missing:
        print(f"FAIL  {len(missing)} required secret(s) missing.")
        return 1
    print("PASS  GitHub Actions is ready to run the Gachijin workflow.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
