# -*- coding: utf-8 -*-
"""Supabase preflight check.

Verifies that the migration was applied, the storage bucket exists, and
the orchestrator can write to the relevant tables. Safe to run repeatedly:
all writes are inside a temporary `__preflight__` job_id that is rolled back
at the end.

Usage:
    python -X utf8 scripts/preflight/check_supabase.py [--bucket gachijin]
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import uuid
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

REQUIRED_TABLES = ("jobs", "job_outputs", "job_logs")


def _http(method: str, url: str, key: str, payload=None, content_type="application/json", extra_headers=None):
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Prefer": "return=representation",
    }
    if content_type:
        headers["Content-Type"] = content_type
    if extra_headers:
        headers.update(extra_headers)

    if payload is None:
        data = None
    elif content_type == "application/json":
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    else:
        data = payload

    req = request.Request(url, data=data, method=method, headers=headers)
    try:
        with request.urlopen(req, timeout=20) as res:
            body = res.read().decode("utf-8")
            return res.status, json.loads(body) if body and content_type == "application/json" else body
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        return exc.code, detail


def check_env() -> tuple[str, str]:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    missing = [n for n, v in (("SUPABASE_URL", url), ("SUPABASE_SERVICE_ROLE_KEY", key)) if not v]
    if missing:
        raise SystemExit(f"FAIL  missing env vars: {', '.join(missing)}")
    return url.rstrip("/"), key


def check_tables(url: str, key: str) -> None:
    for table in REQUIRED_TABLES:
        status, body = _http("GET", f"{url}/rest/v1/{table}?select=id&limit=1", key)
        if status == 200:
            print(f"OK    table {table} reachable")
        elif status == 404:
            raise SystemExit(f"FAIL  table {table} missing — run supabase/migrations/20260505_gachijin_jobs.sql")
        else:
            raise SystemExit(f"FAIL  table {table} returned {status}: {body}")


def check_bucket(url: str, key: str, bucket: str | None) -> None:
    if not bucket:
        print("SKIP  storage bucket (SUPABASE_STORAGE_BUCKET unset)")
        return
    status, body = _http("GET", f"{url}/storage/v1/bucket/{bucket}", key)
    if status == 200:
        print(f"OK    bucket {bucket} exists")
    elif status == 404:
        raise SystemExit(f"FAIL  bucket {bucket} missing — create it in Supabase Storage dashboard")
    else:
        raise SystemExit(f"FAIL  bucket lookup returned {status}: {body}")


def check_writes(url: str, key: str, bucket: str | None) -> None:
    job_payload = {
        "series": "gachijin",
        "theme": "__preflight__",
        "start_date": "2026-01-01",
        "post_time": "07:00",
        "mode": "draft_only",
        "style_preset": "gachijin_default",
        "status": "queued",
    }
    status, created = _http("POST", f"{url}/rest/v1/jobs", key, payload=job_payload)
    if status not in (200, 201):
        raise SystemExit(f"FAIL  jobs insert returned {status}: {created}")
    job_id = created[0]["id"]
    print(f"OK    jobs insert (id={job_id})")

    try:
        # job_outputs
        outputs_payload = [{"job_id": job_id, "day_no": d, "status": "queued"} for d in (1, 2, 3)]
        status, body = _http("POST", f"{url}/rest/v1/job_outputs", key, payload=outputs_payload)
        if status not in (200, 201):
            raise SystemExit(f"FAIL  job_outputs insert returned {status}: {body}")
        print("OK    job_outputs insert (3 rows)")

        # job_logs
        log_payload = {"job_id": job_id, "stage": "preflight", "message": "preflight check", "payload": {"check": True}}
        status, body = _http("POST", f"{url}/rest/v1/job_logs", key, payload=log_payload)
        if status not in (200, 201):
            raise SystemExit(f"FAIL  job_logs insert returned {status}: {body}")
        print("OK    job_logs insert")

        # storage upload (if bucket configured)
        if bucket:
            object_path = f"__preflight__/{uuid.uuid4().hex}.txt"
            status, body = _http(
                "POST",
                f"{url}/storage/v1/object/{bucket}/{object_path}",
                key,
                payload=b"preflight",
                content_type="text/plain",
                extra_headers={"x-upsert": "true"},
            )
            if status not in (200, 201):
                raise SystemExit(f"FAIL  storage upload returned {status}: {body}")
            print(f"OK    storage upload ({bucket}/{object_path})")

            # cleanup uploaded object
            _http("DELETE", f"{url}/storage/v1/object/{bucket}/{object_path}", key, content_type=None)
    finally:
        # Rollback: delete the preflight job. Cascades to job_outputs/logs.
        status, _ = _http("DELETE", f"{url}/rest/v1/jobs?id=eq.{job_id}", key, content_type=None)
        if status in (200, 204):
            print("OK    cleanup (preflight job deleted)")
        else:
            print(f"WARN  cleanup got status {status} — manually delete jobs.id={job_id} if needed")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--bucket", default=os.environ.get("SUPABASE_STORAGE_BUCKET"))
    args = parser.parse_args()

    url, key = check_env()
    print(f"     project: {url}")
    check_tables(url, key)
    check_bucket(url, key, args.bucket)
    check_writes(url, key, args.bucket)
    print("\nPASS  Supabase is ready for the Gachijin pipeline.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
