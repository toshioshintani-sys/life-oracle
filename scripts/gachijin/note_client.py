# -*- coding: utf-8 -*-
"""note.com API client for the Gachijin pipeline.

Confirmed contract (2026-05-03 lessons.md):
- POST /api/v1/text_notes  → draft (returns id + key)
- POST /api/v1/image_upload/note_eyecatch (1280x670 PNG required)
- PUT  /api/v1/text_notes/{id} with status='reserved' + publish_at

Auth: cookie ``_note_session_v5`` from ``NOTE_SESSION_TOKEN``.

This is a self-contained re-implementation so the orchestrator does not need to
import from the parent ``pipeline/`` workspace (which is not vendored into the
GitHub Actions runner).
"""
from __future__ import annotations

import io
import logging
import os
import re
import time
from pathlib import Path
from typing import Any

import requests

logger = logging.getLogger(__name__)

NOTE_API_BASE = "https://note.com"
NOTE_USERNAME = os.environ.get("NOTE_USERNAME", "lifeoraclejp")

HEADERS_BASE = {
    "X-Requested-With": "XMLHttpRequest",
    "Content-Type": "application/json",
    "Accept": "application/json, text/plain, */*",
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Referer": "https://note.com/notes/new",
    "Origin": "https://note.com",
}

MAX_RETRY = 3
RETRY_WAIT = 5


def _session() -> requests.Session:
    token = os.environ.get("NOTE_SESSION_TOKEN")
    if not token:
        raise RuntimeError("NOTE_SESSION_TOKEN is not set")
    s = requests.Session()
    s.headers.update(HEADERS_BASE)
    s.cookies.set("_note_session_v5", token, domain="note.com")
    return s


def _retry(call):
    last_exc: Exception | None = None
    for attempt in range(1, MAX_RETRY + 1):
        try:
            response = call()
            if response.status_code < 500:
                return response
            logger.warning(
                "note API server error %s (attempt %s/%s)",
                response.status_code,
                attempt,
                MAX_RETRY,
            )
        except requests.RequestException as exc:
            last_exc = exc
            logger.warning("note API request error (attempt %s/%s): %s", attempt, MAX_RETRY, exc)
        if attempt < MAX_RETRY:
            time.sleep(RETRY_WAIT)
    if last_exc:
        raise last_exc
    raise RuntimeError(f"note API failed after {MAX_RETRY} attempts")


def _ensure_size(image_bytes: bytes) -> bytes:
    from PIL import Image  # type: ignore

    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    if img.size != (1280, 670):
        img = img.resize((1280, 670), Image.LANCZOS)
    out = io.BytesIO()
    img.save(out, format="PNG")
    return out.getvalue()


def upload_eyecatch(image_bytes: bytes, note_id: str, filename: str = "thumbnail.png") -> int:
    token = os.environ.get("NOTE_SESSION_TOKEN")
    if not token:
        raise RuntimeError("NOTE_SESSION_TOKEN is not set")

    resized = _ensure_size(image_bytes)
    upload = requests.Session()
    upload.headers.update(
        {
            "X-Requested-With": "XMLHttpRequest",
            "User-Agent": HEADERS_BASE["User-Agent"],
            "Accept": "application/json",
            "Referer": "https://note.com/notes/new",
            "Origin": "https://note.com",
        }
    )
    upload.cookies.set("_note_session_v5", token, domain="note.com")

    def call():
        return upload.post(
            f"{NOTE_API_BASE}/api/v1/image_upload/note_eyecatch",
            data={"note_id": note_id},
            files={"file": (filename, resized, "image/png")},
            timeout=60,
        )

    response = _retry(call)
    if response.status_code not in (200, 201):
        raise RuntimeError(f"eyecatch upload failed: {response.status_code} {response.text[:300]}")
    url = response.json().get("data", {}).get("url", "")
    m = re.search(r"/images/(\d+)/", url)
    if not m:
        raise RuntimeError(f"could not extract eye_catch_key from URL: {url}")
    eye_catch_key = int(m.group(1))
    logger.info("eyecatch uploaded: eye_catch_key=%s", eye_catch_key)
    return eye_catch_key


def _draft_payload(payload: dict[str, Any]) -> dict[str, Any]:
    body = {
        "author_ids": [],
        "body_length": len(payload.get("free_body", "")),
        "disable_comment": payload.get("disable_comment", False),
        "free_body": payload["free_body"],
        "hashtags": payload.get("hashtags", []),
        "image_keys": [],
        "name": payload["name"],
        "price": payload.get("price", 0),
        "send_notifications_flag": False,
        "separator": payload.get("separator"),
        "status": "draft",
    }
    if payload.get("eye_catch_key"):
        body["eye_catch_key"] = payload["eye_catch_key"]
    return body


def create_draft(payload: dict[str, Any]) -> dict[str, Any]:
    s = _session()

    def call():
        return s.post(f"{NOTE_API_BASE}/api/v1/text_notes", json=_draft_payload(payload))

    response = _retry(call)
    if response.status_code not in (200, 201):
        raise RuntimeError(f"draft create failed: {response.status_code} {response.text[:500]}")
    data = response.json()
    note = data.get("data", data)
    logger.info("draft created: id=%s key=%s", note.get("id"), note.get("key"))
    return note


def schedule(note_id: str, payload: dict[str, Any], publish_at: str) -> dict[str, Any]:
    s = _session()
    body = {
        "author_ids": [],
        "body_length": len(payload.get("free_body", "")),
        "disable_comment": payload.get("disable_comment", False),
        "free_body": payload["free_body"],
        "hashtags": payload.get("hashtags", []),
        "image_keys": [],
        "name": payload["name"],
        "price": payload.get("price", 0),
        "send_notifications_flag": False,
        "separator": payload.get("separator"),
        "status": "reserved",
        "publish_at": publish_at,
    }
    if payload.get("eye_catch_key"):
        body["eye_catch_key"] = payload["eye_catch_key"]

    def call():
        return s.put(f"{NOTE_API_BASE}/api/v1/text_notes/{note_id}", json=body)

    response = _retry(call)
    if response.status_code not in (200, 201):
        raise RuntimeError(f"schedule failed: {response.status_code} {response.text[:300]}")
    logger.info("scheduled: note_id=%s publish_at=%s", note_id, publish_at)
    return response.json()


def post(payload: dict[str, Any], image_bytes: bytes | None, publish_at: str | None) -> dict[str, Any]:
    """Full flow: create draft → upload eyecatch → schedule (if publish_at)."""
    note = create_draft(payload)
    note_id = str(note.get("id") or note.get("key") or "")
    note_key = note.get("key") or note_id
    if not note_id:
        raise RuntimeError(f"note_id missing from draft response: {note}")

    thumbnail_uploaded = False
    if image_bytes:
        payload["eye_catch_key"] = upload_eyecatch(image_bytes, note_id)
        thumbnail_uploaded = True
    # When no image is provided, the post is created without an eyecatch.
    # The user is expected to add the thumbnail manually via the note editor.

    if publish_at:
        schedule(note_id, payload, publish_at)

    note_url = f"https://note.com/{NOTE_USERNAME}/n/{note_key}"
    note_edit_url = f"https://editor.note.com/notes/{note_key}/edit"
    return {
        "note_id": note_id,
        "note_key": note_key,
        "url": note_url,
        "edit_url": note_edit_url,
        "publish_at": publish_at,
        "thumbnail_uploaded": thumbnail_uploaded,
    }
