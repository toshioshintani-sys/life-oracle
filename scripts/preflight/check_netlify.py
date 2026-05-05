# -*- coding: utf-8 -*-
"""Netlify environment-variable check.

Reads `netlify env:list --json` (must be authenticated via `netlify login`)
and verifies that all secrets the Gachijin Functions need are set.

Usage:
    python -X utf8 scripts/preflight/check_netlify.py
    python -X utf8 scripts/preflight/check_netlify.py --site life-oracle
"""
from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys

REQUIRED = [
    ("SUPABASE_URL", "Supabase REST root, e.g. https://xxx.supabase.co"),
    ("SUPABASE_SERVICE_ROLE_KEY", "Supabase service role key (server side only)"),
    ("GITHUB_REPO", "owner/repo, e.g. toshioshintani-sys/life-oracle"),
]
# Set after Step 6 (GitHub PAT creation)
REQUIRED_STEP6 = [
    ("GITHUB_ACTIONS_TOKEN", "GitHub PAT with `workflow` scope (or fall back to GITHUB_TOKEN)"),
]
OPTIONAL = [
    ("GITHUB_BRANCH", "Defaults to `main` if unset"),
    ("GACHIJIN_WORKFLOW_ID", "Defaults to `gachijin-pipeline.yml`"),
    ("SUPABASE_STORAGE_BUCKET", "Optional bucket for artifact uploads"),
]


def _netlify_bin() -> str:
    exe = shutil.which("netlify.cmd") or shutil.which("netlify")
    if not exe:
        raise SystemExit("FAIL  netlify CLI not on PATH — install with `npm i -g netlify-cli`")
    return exe


def run_netlify_env_list(site: str | None) -> dict[str, str]:
    exe = _netlify_bin()
    cmd = [exe, "env:list", "--json"]
    if site:
        cmd += ["--site", site]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise SystemExit(f"FAIL  netlify env:list failed:\n{result.stderr}")
    try:
        data = json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        raise SystemExit(f"FAIL  could not parse netlify CLI output: {exc}")
    return {k: ("***" if v else "") for k, v in data.items()}


def netlify_env_exists(name: str, site: str | None) -> bool:
    """Check a single env var across all contexts — handles secrets not shown in env:list."""
    exe = _netlify_bin()
    for ctx in ("all", "production", "dev"):
        cmd = [exe, "env:get", name, "--context", ctx]
        if site:
            cmd += ["--site", site]
        result = subprocess.run(cmd, capture_output=True, text=True)
        out = result.stdout.strip()
        if result.returncode == 0 and out and "No value set" not in out and out != "undefined":
            return True
    return False


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--site", help="Optional Netlify site name override")
    args = parser.parse_args()

    env = run_netlify_env_list(args.site)
    print(f"     {len(env)} env vars in Netlify project\n")

    has_failure = False
    for name, hint in REQUIRED:
        if env.get(name) or netlify_env_exists(name, args.site):
            print(f"OK    {name} is set")
        else:
            has_failure = True
            print(f"FAIL  {name} not set — {hint}")

    print()
    for name, hint in REQUIRED_STEP6:
        if env.get(name) or env.get("GITHUB_TOKEN") or netlify_env_exists(name, args.site) or netlify_env_exists("GITHUB_TOKEN", args.site):
            print(f"OK    {name} (or GITHUB_TOKEN) is set")
        else:
            print(f"WARN  {name} not set — add after Step 6 (GitHub PAT)")

    print()
    for name, hint in OPTIONAL:
        if env.get(name):
            print(f"OK    {name} is set")
        else:
            print(f"INFO  {name} unset — {hint}")

    print()
    if has_failure:
        print("FAIL  one or more required env vars are missing.")
        return 1
    print("PASS  Netlify is ready to dispatch Gachijin workflows.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
