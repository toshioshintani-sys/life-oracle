# -*- coding: utf-8 -*-
"""
Generate a master thumbnail prompt list for the Gachijin series.

For every gachijin job that has reached `scheduled` (or `draft`) state in
Supabase, downloads its article_bundle.json from Storage and builds the
integrated thumbnail prompt for Day1 / Day2 / Day3. Writes a single
markdown file that the user can read while creating thumbnails manually
in ChatGPT or another image generator.

Output columns (per entry):
  1. 投稿予定日  (scheduled publish date and time)
  2. 題名      (article title)
  3. ファイル名 (target filename to save the thumbnail as)
  4. プロンプト  (full integrated prompt, ready to paste to ChatGPT)

Usage:
    python -X utf8 scripts/gachijin_make_prompt_list.py
    python -X utf8 scripts/gachijin_make_prompt_list.py --include-failed
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.request
import urllib.error
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

JST = timezone(timedelta(hours=9))


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


def _storage_download(object_path: str) -> bytes:
    bucket = os.environ.get("SUPABASE_STORAGE_BUCKET", "gachijin")
    base = os.environ["SUPABASE_URL"].rstrip("/")
    key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    url = f"{base}/storage/v1/object/{bucket}/{object_path}"
    req = urllib.request.Request(url, method="GET")
    req.add_header("apikey", key)
    req.add_header("Authorization", f"Bearer {key}")
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read()


def _theme_filename(theme_no: int, day_no: int, publish_date: str) -> str:
    return f"gachi_{theme_no:03d}-{day_no}_{publish_date}.png"


def _publish_date(start_date: str, day_offset: int) -> str:
    d = datetime.strptime(start_date, "%Y-%m-%d").date() + timedelta(days=day_offset)
    return d.isoformat()


def _scheduled_at_str(start_date: str, post_time: str, day_offset: int) -> str:
    d = datetime.strptime(start_date, "%Y-%m-%d").date() + timedelta(days=day_offset)
    return f"{d.isoformat()} {post_time} JST"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--include-failed", action="store_true",
                        help="Include themes whose pipeline failed (no article bundle).")
    parser.add_argument("--out", default="docs/gachijin_thumbnail_prompts.md")
    args = parser.parse_args()

    _load_env()

    # Lazy import to avoid pulling Pillow when not strictly needed,
    # but we do need the prompt builder.
    from gachijin.thumbnails import (  # noqa: E402
        _build_integrated_prompt,
        _theme_number,
        SERIES_LABEL,
        DAY_LABELS,
    )

    schedule_path = ROOT / "scripts" / "gachijin_schedule.json"
    schedule = json.loads(schedule_path.read_text(encoding="utf-8"))
    post_time = schedule.get("post_time", "07:00")
    schedule_themes = {t["theme"]: t for t in schedule["themes"]}

    # Pull all gachijin jobs ordered by theme position in schedule.
    jobs = _supabase_get(
        "jobs?series=eq.gachijin&select=*&order=created_at.desc"
    )
    # Deduplicate: keep the most recent successful job per theme.
    success_states = {"scheduled", "draft", "verified", "thumbnail_skipped"}
    by_theme: dict[str, dict] = {}
    for job in jobs:
        if job["theme"] not in by_theme:
            if args.include_failed or job["status"] in success_states or job["status"] in {"article_ready", "note_payload_ready"}:
                by_theme[job["theme"]] = job

    # Build entries in schedule order.
    lines: list[str] = []
    lines.append("# ガチ人 サムネイルプロンプト一覧")
    lines.append("")
    lines.append(f"生成日時: {datetime.now(JST).strftime('%Y-%m-%d %H:%M JST')}")
    lines.append("")
    lines.append("ChatGPTやGemini等の画像生成AIに各プロンプトをそのまま渡してサムネを生成し、")
    lines.append("指定のファイル名で保存して `var/gachijin/manual_thumbnails/` に配置してください。")
    lines.append("")
    lines.append("配置後、Claude Codeに「サムネをアップロードして」と伝えれば、")
    lines.append("そのフォルダ内にあるすべての画像をnoteの該当下書きにアップロードします。")
    lines.append("")
    lines.append("---")
    lines.append("")

    total_entries = 0
    missing_themes: list[str] = []
    for entry in schedule["themes"]:
        theme = entry["theme"]
        start_date = entry["day1"]
        job = by_theme.get(theme)
        if not job:
            missing_themes.append(theme)
            continue

        theme_no = _theme_number(theme)
        # Try to download the article bundle for full title + thumbnail_design.
        try:
            bundle_bytes = _storage_download(f"gachijin/jobs/{job['id']}/article_bundle.json")
            bundle = json.loads(bundle_bytes)
        except Exception as exc:
            print(f"WARN: cannot fetch bundle for {theme}: {exc}", file=sys.stderr)
            continue

        thumb_design = bundle.get("thumbnail_design", {})
        action_type = thumb_design.get("action_type", "停滞系")

        for day_no in (1, 2, 3):
            day_key = f"day{day_no}"
            article = bundle.get("articles", {}).get(day_key, {})
            day_design = thumb_design.get("days", {}).get(day_key, {})
            title = article.get("title", "(タイトル未生成)")
            moment = day_design.get("moment", "")
            main_text = day_design.get("main_text", "")
            sub_text = day_design.get("sub_text", "")

            publish_date = _publish_date(start_date, day_no - 1)
            scheduled_at = _scheduled_at_str(start_date, post_time, day_no - 1)
            filename = _theme_filename(theme_no, day_no, publish_date)

            prompt = _build_integrated_prompt(
                moment=moment,
                main_text=main_text,
                sub_text=sub_text,
                action_type=action_type,
                day_no=day_no,
            )

            lines.append(f"## #{theme_no:03d}-{day_no}  {theme}  Day{day_no}")
            lines.append("")
            lines.append(f"- 投稿予定日: **{scheduled_at}**")
            lines.append(f"- 題名: {title}")
            lines.append(f"- ファイル名: `{filename}`")
            lines.append("- プロンプト:")
            lines.append("")
            lines.append("```")
            lines.append(prompt.strip())
            lines.append("```")
            lines.append("")
            lines.append("---")
            lines.append("")
            total_entries += 1

    if missing_themes:
        lines.append("## 未生成テーマ（パイプライン未完了 or 失敗）")
        lines.append("")
        for t in missing_themes:
            lines.append(f"- {t}")
        lines.append("")

    out_path = ROOT / args.out
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {total_entries} entries to {out_path}")
    if missing_themes:
        print(f"  ({len(missing_themes)} themes still missing)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
