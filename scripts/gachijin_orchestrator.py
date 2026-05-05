# -*- coding: utf-8 -*-
"""Gachijin pipeline orchestrator.

Phases:
  1. queued                → article_generating  → article_ready
  2. thumbnail_spec_ready  → thumbnail_generating → thumbnail_generated → thumbnail_composited
  3. note_payload_ready    → note_scheduling      → scheduled / verified

Each phase writes artifacts to ``var/gachijin/jobs/{job_id}/`` and, when
Supabase is configured, also uploads to Storage and updates the
``jobs`` / ``job_outputs`` / ``job_logs`` tables.

External APIs (Anthropic, OpenAI, note.com) are only called when their
respective env vars are set AND ``--dry-run`` is not passed. Missing keys
gracefully fall back to deterministic dry-run artifacts so local validation
works without secrets.
"""
from __future__ import annotations

import argparse
import json
import logging
import os
import sys
import uuid
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any
from urllib import error, request

logger = logging.getLogger("gachijin.orchestrator")

JST = timezone(timedelta(hours=9))
ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUT = ROOT / "var" / "gachijin" / "jobs"

if str(Path(__file__).resolve().parent) not in sys.path:
    sys.path.insert(0, str(Path(__file__).resolve().parent))

from gachijin.article import generate_article_bundle, _short_theme  # noqa: E402
from gachijin.markdown import markdown_to_note_html  # noqa: E402
from gachijin.thumbnails import IMAGE_SIZE, render_thumbnail  # noqa: E402

DEFAULT_HASHTAGS = ["#行動経済学", "#心理学", "#職場", "#ガチ人", "#ライフオラクル"]


def _write_json(path: Path, data: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def _scheduled_at(start_date: str, post_time: str, offset: int) -> str:
    target = datetime.strptime(start_date, "%Y-%m-%d").date() + timedelta(days=offset)
    hour, minute = [int(part) for part in post_time.split(":")]
    return datetime(target.year, target.month, target.day, hour, minute, tzinfo=JST).isoformat()


@dataclass
class SupabaseClient:
    url: str
    key: str
    bucket: str | None = None

    @classmethod
    def from_env(cls) -> "SupabaseClient | None":
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        if not url or not key:
            return None
        return cls(url.rstrip("/"), key, os.environ.get("SUPABASE_STORAGE_BUCKET"))

    def _request(self, method: str, path: str, payload: Any | None = None, content_type: str = "application/json") -> Any:
        if payload is None:
            data = None
        elif content_type == "application/json":
            data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        else:
            data = payload
        req = request.Request(
            f"{self.url}{path}",
            data=data,
            method=method,
            headers={
                "apikey": self.key,
                "Authorization": f"Bearer {self.key}",
                "Content-Type": content_type,
                "Prefer": "return=representation",
            },
        )
        try:
            with request.urlopen(req, timeout=30) as res:
                body = res.read().decode("utf-8")
                return json.loads(body) if body else None
        except error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"Supabase {method} {path} failed: {exc.code} {detail}") from exc

    def get_job(self, job_id: str) -> dict[str, Any]:
        data = self._request("GET", f"/rest/v1/jobs?id=eq.{job_id}&select=*")
        if not data:
            raise RuntimeError(f"Job not found: {job_id}")
        return data[0]

    def update_job(self, job_id: str, **fields: Any) -> None:
        self._request("PATCH", f"/rest/v1/jobs?id=eq.{job_id}", fields)

    def log(self, job_id: str, stage: str, message: str, payload: dict[str, Any] | None = None) -> None:
        try:
            self._request(
                "POST",
                "/rest/v1/job_logs",
                {"job_id": job_id, "stage": stage, "message": message, "payload": payload or {}},
            )
        except Exception:
            logger.exception("Supabase log write failed (stage=%s)", stage)

    def update_output(self, job_id: str, day_no: int, **fields: Any) -> None:
        self._request("PATCH", f"/rest/v1/job_outputs?job_id=eq.{job_id}&day_no=eq.{day_no}", fields)

    def upload_file(self, object_path: str, local_path: Path, content_type: str) -> str | None:
        if not self.bucket:
            return None
        data = local_path.read_bytes()
        storage_path = f"/storage/v1/object/{self.bucket}/{object_path}"
        # POST creates new objects; PUT overwrites. We use PUT via x-upsert header.
        req = request.Request(
            f"{self.url}{storage_path}",
            data=data,
            method="POST",
            headers={
                "apikey": self.key,
                "Authorization": f"Bearer {self.key}",
                "Content-Type": content_type,
                "x-upsert": "true",
            },
        )
        try:
            with request.urlopen(req, timeout=120) as res:
                res.read()
        except error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"Storage upload failed: {exc.code} {detail}") from exc
        return object_path


# ---- phase 1: article ------------------------------------------------------

def phase_article(job: dict[str, Any], job_dir: Path, supabase: SupabaseClient | None, dry_run: bool) -> dict[str, Any]:
    if supabase:
        supabase.update_job(job["id"], status="article_generating", last_error=None)
        supabase.log(job["id"], "article_generating", "Article generation started", {"dry_run": dry_run})

    bundle, source = generate_article_bundle(
        theme=job["theme"],
        start_date=job["start_date"],
        post_time=job["post_time"],
        dry_run=dry_run,
    )
    bundle_path = job_dir / "article_bundle.json"
    _write_json(bundle_path, bundle)

    for index, day_key in enumerate(("day1", "day2", "day3"), start=1):
        article = bundle["articles"][day_key]
        md_path = job_dir / f"day{index}.md"
        md_path.write_text(f"# {article['title']}\n\n{article['body_md']}", encoding="utf-8")

    if supabase:
        supabase.upload_file(f"gachijin/jobs/{job['id']}/article_bundle.json", bundle_path, "application/json")
        for index in range(1, 4):
            supabase.upload_file(
                f"gachijin/jobs/{job['id']}/day{index}.md",
                job_dir / f"day{index}.md",
                "text/markdown",
            )
            supabase.update_output(
                job["id"],
                index,
                article_path=f"gachijin/jobs/{job['id']}/day{index}.md",
                scheduled_at=_scheduled_at(job["start_date"], job["post_time"], index - 1),
                status="article_ready",
            )
        supabase.update_job(job["id"], status="article_ready")
        supabase.log(job["id"], "article_ready", "Article bundle generated", {"source": source})

    return bundle


# ---- phase 2: thumbnails ---------------------------------------------------

def _build_thumbnail_spec(job_id: str, bundle: dict[str, Any]) -> dict[str, Any]:
    days = {}
    design = bundle["thumbnail_design"]
    # Safety: sub_text must always be the short theme name (never a poetic phrase).
    # This overrides whatever Claude generated to guarantee consistent labelling.
    short = _short_theme(bundle.get("theme_name", ""))
    for day_key, day_design in design["days"].items():
        days[day_key] = {
            "moment": day_design["moment"],
            "main_text": day_design["main_text"],
            "sub_text": short or day_design["sub_text"],
        }
    return {
        "job_id": job_id,
        "image_size": f"{IMAGE_SIZE[0]}x{IMAGE_SIZE[1]}",
        "color_preset": design.get("thumbnail_color", "gold_black"),
        "action_type": design["action_type"],
        "scene_type": design["scene_type"],
        "scene_policy": design["scene_policy"],
        "reason": design["reason"],
        "days": days,
    }


def phase_thumbnails(
    job: dict[str, Any],
    job_dir: Path,
    bundle: dict[str, Any],
    supabase: SupabaseClient | None,
    dry_run: bool,
) -> dict[str, Path]:
    spec = _build_thumbnail_spec(job["id"], bundle)
    spec_path = job_dir / "thumbnail_spec.json"
    _write_json(spec_path, spec)

    if supabase:
        supabase.update_job(job["id"], status="thumbnail_spec_ready")
        supabase.upload_file(f"gachijin/jobs/{job['id']}/thumbnail_spec.json", spec_path, "application/json")
        supabase.log(job["id"], "thumbnail_spec_ready", "Thumbnail spec generated")
        supabase.update_job(job["id"], status="thumbnail_generating")

    color_preset = spec["color_preset"]
    action_type = spec["action_type"]
    final_paths: dict[str, Path] = {}

    for index, day_key in enumerate(("day1", "day2", "day3"), start=1):
        day_design = bundle["thumbnail_design"]["days"][day_key]
        raw_path = job_dir / f"raw_day{index}.png"
        final_path = job_dir / f"final_day{index}.png"
        try:
            artifacts = render_thumbnail(
                moment=day_design["moment"],
                main_text=day_design["main_text"],
                sub_text=day_design["sub_text"],
                action_type=action_type,
                color_preset=color_preset,
                raw_path=raw_path,
                final_path=final_path,
                dry_run=dry_run,
                day_no=index,
            )
        except ValueError as exc:
            # Composite quality validator rejected the render — block note posting.
            if supabase:
                supabase.update_output(job["id"], index, status="failed_composite")
                supabase.log(
                    job["id"],
                    "failed_composite",
                    f"Day {index} composite rejected by validator",
                    {"error": str(exc)},
                )
                supabase.update_job(job["id"], status="failed_composite", last_error=str(exc))
            raise
        final_paths[day_key] = final_path
        if supabase:
            supabase.upload_file(
                f"gachijin/jobs/{job['id']}/raw_day{index}.png",
                artifacts.raw_path,
                "image/png",
            )
            supabase.upload_file(
                f"gachijin/jobs/{job['id']}/final_day{index}.png",
                artifacts.final_path,
                "image/png",
            )
            supabase.update_output(
                job["id"],
                index,
                raw_thumb_path=f"gachijin/jobs/{job['id']}/raw_day{index}.png",
                final_thumb_path=f"gachijin/jobs/{job['id']}/final_day{index}.png",
                status="thumbnail_composited",
            )
            supabase.log(
                job["id"],
                "thumbnail_composited",
                f"Day {index} thumbnail rendered",
                {"source": artifacts.source},
            )

    if supabase:
        supabase.update_job(job["id"], status="thumbnail_composited")

    return final_paths


# ---- phase 3: note ---------------------------------------------------------

def _build_note_payload(bundle: dict[str, Any], day_key: str) -> dict[str, Any]:
    article = bundle["articles"][day_key]
    free_body_html = markdown_to_note_html(article["body_md"])
    return {
        "name": article["title"],
        "free_body": free_body_html,
        "hashtags": list(DEFAULT_HASHTAGS),
        "price": 0,
        "separator": None,
        "disable_comment": False,
    }


def phase_note(
    job: dict[str, Any],
    job_dir: Path,
    bundle: dict[str, Any],
    final_paths: dict[str, Path],
    supabase: SupabaseClient | None,
    dry_run: bool,
) -> dict[str, dict[str, Any]]:
    if supabase:
        supabase.update_job(job["id"], status="note_payload_ready")
        supabase.log(job["id"], "note_payload_ready", "Building note payloads")

    payloads: dict[str, dict[str, Any]] = {}
    for index, day_key in enumerate(("day1", "day2", "day3"), start=1):
        payload = _build_note_payload(bundle, day_key)
        publish_at = _scheduled_at(job["start_date"], job["post_time"], index - 1)
        payload_path = job_dir / f"note_payload_day{index}.json"
        _write_json(
            payload_path,
            {
                **payload,
                "publish_at": publish_at,
                "thumbnail_path": str(final_paths.get(day_key, "")),
            },
        )
        payloads[day_key] = {"payload": payload, "publish_at": publish_at, "path": payload_path}

        if supabase:
            supabase.upload_file(
                f"gachijin/jobs/{job['id']}/note_payload_day{index}.json",
                payload_path,
                "application/json",
            )
            supabase.update_output(
                job["id"],
                index,
                note_payload_path=f"gachijin/jobs/{job['id']}/note_payload_day{index}.json",
                status="note_payload_ready",
            )

    mode = job.get("mode", "draft_only")

    # --dry-run: skip note.com entirely
    if dry_run:
        if supabase:
            supabase.update_job(job["id"], status="note_payload_ready")
            supabase.log(job["id"], "note_payload_ready", "Skipped note posting (dry-run)", {"dry_run": True})
        return {day: {"posted": False, "publish_at": payloads[day]["publish_at"]} for day in ("day1", "day2", "day3")}

    # Real posting path (draft_only = no publish_at, schedule_publish = with publish_at)
    try:
        from gachijin import note_client  # type: ignore
    except ImportError:
        raise RuntimeError("gachijin.note_client unavailable; cannot post to note")

    if supabase:
        supabase.update_job(job["id"], status="note_scheduling")
        supabase.log(job["id"], "note_scheduling", "Submitting to note.com", {"mode": mode})

    posted: dict[str, dict[str, Any]] = {}
    for index, day_key in enumerate(("day1", "day2", "day3"), start=1):
        meta = payloads[day_key]
        image_path = final_paths.get(day_key)
        image_bytes = image_path.read_bytes() if image_path and image_path.exists() else None
        # draft_only: create draft without scheduling; schedule_publish: include publish_at
        publish_at = None if mode == "draft_only" else meta["publish_at"]
        result = note_client.post(meta["payload"], image_bytes, publish_at)
        posted[day_key] = {"posted": True, **result}

        output_status = "draft" if mode == "draft_only" else "scheduled"
        if supabase:
            supabase.update_output(
                job["id"],
                index,
                note_url=result["url"],
                scheduled_at=meta["publish_at"],
                status=output_status,
            )
            supabase.log(
                job["id"],
                output_status,
                f"Day {index} {'saved as draft' if mode == 'draft_only' else 'scheduled'} on note.com",
                {"url": result["url"], "publish_at": publish_at},
            )

    final_status = "draft" if mode == "draft_only" else "scheduled"
    if supabase:
        supabase.update_job(job["id"], status=final_status)

    return posted


# ---- driver ----------------------------------------------------------------

def _verification_payload(
    job: dict[str, Any],
    job_dir: Path,
    bundle: dict[str, Any],
    final_paths: dict[str, Path],
    note_results: dict[str, dict[str, Any]],
    dry_run: bool,
) -> dict[str, Any]:
    return {
        "job_id": job["id"],
        "theme": job["theme"],
        "start_date": job["start_date"],
        "post_time": job["post_time"],
        "mode": job.get("mode"),
        "dry_run": dry_run,
        "generated_at": datetime.now(JST).isoformat(),
        "artifacts": {
            "article_bundle": "article_bundle.json",
            "thumbnail_spec": "thumbnail_spec.json",
            "articles": [f"day{i}.md" for i in range(1, 4)],
            "raw_thumbnails": [f"raw_day{i}.png" for i in range(1, 4)],
            "final_thumbnails": [f"final_day{i}.png" for i in range(1, 4)],
            "note_payloads": [f"note_payload_day{i}.json" for i in range(1, 4)],
        },
        "note_results": note_results,
        "titles": {day: bundle["articles"][day]["title"] for day in ("day1", "day2", "day3")},
    }


def load_local_job(input_json: Path | None) -> dict[str, Any]:
    if input_json:
        return json.loads(input_json.read_text(encoding="utf-8"))
    return {
        "id": "local-" + uuid.uuid4().hex[:8],
        "series": "gachijin",
        "theme": "サンクコスト・バイアス",
        "start_date": date.today().isoformat(),
        "post_time": "07:00",
        "mode": "draft_only",
        "style_preset": "gachijin_default",
    }


def run(job: dict[str, Any], out_root: Path, supabase: SupabaseClient | None, dry_run: bool) -> Path:
    job_id = job["id"]
    job_dir = out_root / job_id
    job_dir.mkdir(parents=True, exist_ok=True)

    bundle = phase_article(job, job_dir, supabase, dry_run)
    final_paths = phase_thumbnails(job, job_dir, bundle, supabase, dry_run)
    note_results = phase_note(job, job_dir, bundle, final_paths, supabase, dry_run)

    verification = _verification_payload(job, job_dir, bundle, final_paths, note_results, dry_run)
    verification_path = job_dir / "verification.json"
    _write_json(verification_path, verification)

    if supabase:
        supabase.upload_file(
            f"gachijin/jobs/{job_id}/verification.json",
            verification_path,
            "application/json",
        )
        if dry_run:
            terminal = "verified"
        elif any(r.get("posted") for r in note_results.values()):
            mode = job.get("mode", "draft_only")
            terminal = "draft" if mode == "draft_only" else "scheduled"
        else:
            terminal = "note_payload_ready"
        supabase.update_job(job_id, status=terminal)
        supabase.log(job_id, terminal, "Pipeline run completed", {"dry_run": dry_run})

    return job_dir


def _failure_status(stage: str) -> str:
    if "article" in stage:
        return "failed_article"
    if "composite" in stage:
        return "failed_composite"
    if "thumbnail" in stage:
        return "failed_thumbnail"
    if "note" in stage:
        return "failed_note"
    return "failed_verification"


def main() -> int:
    parser = argparse.ArgumentParser(description="Run Gachijin pipeline orchestrator")
    parser.add_argument("--job-id", help="Supabase jobs.id")
    parser.add_argument("--input-json", type=Path, help="Local job JSON for dry-run")
    parser.add_argument("--out-dir", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--dry-run", action="store_true", help="Skip external paid/posting steps")
    parser.add_argument("--log-level", default="INFO")
    args = parser.parse_args()

    logging.basicConfig(
        level=getattr(logging, args.log_level.upper(), logging.INFO),
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

    supabase = SupabaseClient.from_env()
    if args.job_id and supabase:
        job = supabase.get_job(args.job_id)
    elif args.job_id and not supabase:
        logger.warning("SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY not set; using local fallback job")
        job = load_local_job(args.input_json)
        job["id"] = args.job_id
    else:
        job = load_local_job(args.input_json)

    sb = supabase if args.job_id else None
    try:
        job_dir = run(job, args.out_dir, sb, args.dry_run)
        logger.info("Gachijin pipeline finished: %s", job_dir)
        return 0
    except Exception as exc:
        logger.exception("Pipeline run failed")
        if sb:
            try:
                stage = "article"
                if (args.out_dir / job["id"] / "thumbnail_spec.json").exists():
                    stage = "thumbnail"
                if (args.out_dir / job["id"] / "note_payload_day1.json").exists():
                    stage = "note"
                sb.update_job(job["id"], status=_failure_status(stage), last_error=str(exc))
                sb.log(job["id"], _failure_status(stage), "Pipeline failed", {"error": str(exc)})
            except Exception:
                logger.exception("Failed to record failure to Supabase")
        raise


if __name__ == "__main__":
    raise SystemExit(main())
