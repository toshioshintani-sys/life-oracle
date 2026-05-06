# -*- coding: utf-8 -*-
"""
Gachijin daily scheduler trigger.

Run at 18:30 JST every day via GitHub Actions cron.
Reads gachijin_schedule.json, finds themes whose pipeline_run_date matches
today (JST), creates Supabase jobs for each, and dispatches
gachijin-pipeline.yml with start_date = day1 from the schedule.

If a theme has no pipeline_run_date, falls back to the legacy behaviour:
trigger when day1 == tomorrow (one day before publication).
"""
from __future__ import annotations

import json
import os
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone, timedelta
from pathlib import Path

JST = timezone(timedelta(hours=9))


def today_jst() -> str:
    return datetime.now(JST).strftime("%Y-%m-%d")


def tomorrow_jst() -> str:
    return (datetime.now(JST) + timedelta(days=1)).strftime("%Y-%m-%d")


def supabase_post(path: str, data: dict | list) -> list | dict:
    url = f"{os.environ['SUPABASE_URL'].rstrip('/')}/rest/v1/{path}"
    key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    body = json.dumps(data).encode()
    req = urllib.request.Request(url, data=body, method="POST")
    req.add_header("apikey", key)
    req.add_header("Authorization", f"Bearer {key}")
    req.add_header("Content-Type", "application/json")
    req.add_header("Prefer", "return=representation")
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())


def dispatch_pipeline(job_id: str) -> bool:
    token = os.environ.get("GITHUB_ACTIONS_TOKEN")
    repo = os.environ.get("GITHUB_REPO") or os.environ.get("GITHUB_REPOSITORY")
    if not token or not repo:
        print("  WARN: GITHUB_ACTIONS_TOKEN or repo not configured; skipping dispatch", file=sys.stderr)
        return False

    url = f"https://api.github.com/repos/{repo}/actions/workflows/gachijin-pipeline.yml/dispatches"
    payload = json.dumps({"ref": "main", "inputs": {"job_id": job_id}}).encode()
    req = urllib.request.Request(url, data=payload, method="POST")
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("X-GitHub-Api-Version", "2022-11-28")
    req.add_header("Content-Type", "application/json")
    req.add_header("User-Agent", "life-oracle-gachijin-scheduler")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            resp.read()
        print(f"  Dispatched gachijin-pipeline.yml for job {job_id}")
        return True
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        print(f"  ERROR: dispatch failed {exc.code}: {body}", file=sys.stderr)
        return False


def find_todays_themes(schedule: dict) -> list[dict]:
    today = today_jst()
    tomorrow = tomorrow_jst()
    matched = []
    for t in schedule["themes"]:
        run_date = t.get("pipeline_run_date")
        if run_date:
            if run_date == today:
                matched.append(t)
        else:
            # Legacy fallback: trigger day before publication
            if t["day1"] == tomorrow:
                matched.append(t)
    return matched


def main() -> int:
    schedule_path = Path(__file__).resolve().parent / "gachijin_schedule.json"
    schedule = json.loads(schedule_path.read_text(encoding="utf-8"))

    post_time = schedule.get("post_time", "07:00")
    mode = schedule.get("mode", "schedule_publish")

    today = today_jst()
    print(f"Gachijin scheduler: today (JST)={today}, post_time={post_time}, mode={mode}")

    matched = find_todays_themes(schedule)
    if not matched:
        print("No themes scheduled for today. Nothing to do.")
        return 0

    exit_code = 0
    for entry in matched:
        theme = entry["theme"]
        start_date = entry["day1"]
        print(f"\nCreating job: theme={theme!r} start_date={start_date}")

        job_data = {
            "series": "gachijin",
            "theme": theme,
            "start_date": start_date,
            "post_time": post_time,
            "mode": mode,
            "style_preset": "gachijin_default",
            "status": "queued",
        }
        try:
            created = supabase_post("jobs", job_data)
            job = created[0] if isinstance(created, list) else created
            job_id = job["id"]
            print(f"  Job created: {job_id}")

            outputs = [{"job_id": job_id, "day_no": d, "status": "queued"} for d in [1, 2, 3]]
            supabase_post("job_outputs", outputs)
            print(f"  job_outputs created (day 1-3)")

            ok = dispatch_pipeline(job_id)
            if not ok:
                exit_code = 1
        except Exception as exc:
            print(f"  ERROR processing theme {theme!r}: {exc}", file=sys.stderr)
            exit_code = 1

    return exit_code


if __name__ == "__main__":
    sys.exit(main())
