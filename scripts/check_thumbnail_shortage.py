# -*- coding: utf-8 -*-
"""
check_thumbnail_shortage.py — 予約/投稿待ち記事の「サムネ未添付」本数をシリーズ別に集計する。

今週の律速＝サムネ追加（docs/WEEKLY_SPRINT.md）の「可視化」。委員会 2026-06-09 決定1の実装。
真実源：ローカル記事ファイル（note.com の list系APIは予約を隠すため）。runway_check.py と同じ思想。

判定：posted/<series>/articles/*.md の各 stem について、サムネが「在る」とみなす条件は
  (a) posted/<series>/thumbnails/<同名>.png がローカルに在る、または
  (b) posted/<series>/manually_uploaded.txt にその stem が載っている
      （= note.com に直接アップ済みでローカルPNGを持たない運用。jin が該当）。
  上記いずれでもない .md を「未添付」として数える。

対象外：
  - gachi … 記事MDが無い（Supabase運用）。runway_check.py と同じ扱い。
  - note.com 側の「デタラメサムネ/ゾンビ予約」… ローカルでは判定不能（DOM監査の別タスク）。

使い方：
  python -X utf8 scripts/check_thumbnail_shortage.py          # シリーズ別サマリ
  python -X utf8 scripts/check_thumbnail_shortage.py --list   # 未添付ファイル名も列挙
  python -X utf8 scripts/check_thumbnail_shortage.py --json   # JSON出力（機械処理用）
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent      # ライフオラクル/
WORK_ROOT = REPO_ROOT.parent                            # Claude_work/
NOTE = WORK_ROOT / "ライフオラクルnoteネタ"
ARTICLES = NOTE / "articles"

# posted は series別 articles/thumbnails 分離。gachi は記事MD無し(Supabase)で対象外。
POSTED_SERIES = ["yoru", "wata", "post", "jin"]
SERIES_LABEL = {"yoru": "夜のトリセツ", "wata": "私のトリセツ",
                "post": "汎用post", "jin": "職場の隣人図鑑"}


def _stems(d: Path, pattern: str) -> set[str]:
    """ディレクトリ直下（再帰しない）の該当ファイルの拡張子なし名の集合。"""
    if not d.exists():
        return set()
    return {f.stem for f in d.glob(pattern) if f.is_file()}


def _manual_uploaded(series_dir: Path) -> set[str]:
    """manually_uploaded.txt の stem 一覧（# コメント・空行は無視）。note直アップ済みの記録。"""
    f = series_dir / "manually_uploaded.txt"
    if not f.exists():
        return set()
    out: set[str] = set()
    for line in f.read_text(encoding="utf-8", errors="replace").splitlines():
        s = line.strip()
        if s and not s.startswith("#"):
            out.add(s)
    return out


def scan_posted() -> dict[str, dict]:
    """posted/<series>/ の .md を、ローカルPNG または manually_uploaded.txt と突き合わせる。"""
    out: dict[str, dict] = {}
    for s in POSTED_SERIES:
        sd = ARTICLES / "posted" / s
        md = _stems(sd / "articles", "*.md")
        png = _stems(sd / "thumbnails", "*.png")
        manual = _manual_uploaded(sd)
        covered = png | manual
        missing = sorted(md - covered)
        out[s] = {
            "total": len(md),
            "local_png": len(md & png),
            "manual_uploaded": len(md & manual),
            "missing_count": len(missing),
            "missing": missing,
        }
    return out


def scan_stage(stage: str) -> dict:
    """inbox/ ready/ は全シリーズ混在で、同フォルダに .md と同名 .png を置く運用。"""
    d = ARTICLES / stage
    md = _stems(d, "*.md")
    png = _stems(d, "*.png")
    missing = sorted(md - png)
    return {"total": len(md), "local_png": len(md & png),
            "missing_count": len(missing), "missing": missing}


def build_report() -> dict:
    return {"posted": scan_posted(),
            "ready": scan_stage("ready"),
            "inbox": scan_stage("inbox")}


def main() -> int:
    ap = argparse.ArgumentParser(
        description="予約/投稿待ち記事のサムネ未添付本数を集計（律速=サムネの可視化）")
    ap.add_argument("--list", action="store_true", help="未添付ファイル名を列挙")
    ap.add_argument("--json", action="store_true", help="JSON出力（機械処理用）")
    args = ap.parse_args()

    rep = build_report()

    if args.json:
        print(json.dumps(rep, ensure_ascii=False, indent=2))
        return 0

    print("=== サムネ未添付 計測（真実源=ローカル記事ファイル） ===")
    print("※ サムネ在り = ローカルPNG または manually_uploaded.txt 記載。")
    print("※ gachiは記事MD無し(Supabase)で対象外。note側のデタラメ/ゾンビは別監査。\n")

    total_missing = 0
    print("[予約済み posted/]")
    print(f"  {'シリーズ':<10}{'記事':>6}{'PNG':>6}{'手動up':>7}{'未添付':>7}")
    for s in POSTED_SERIES:
        r = rep["posted"][s]
        total_missing += r["missing_count"]
        flag = "🚨" if r["missing_count"] else "✅"
        print(f"  {flag} {SERIES_LABEL[s]:<8}{r['total']:>6}{r['local_png']:>6}"
              f"{r['manual_uploaded']:>7}{r['missing_count']:>7}")

    for stage in ("ready", "inbox"):
        r = rep[stage]
        if r["total"]:
            flag = "🚨" if r["missing_count"] else "✅"
            print(f"\n[{stage}/] {flag} 記事{r['total']} / PNG{r['local_png']} / 未添付{r['missing_count']}")
            total_missing += r["missing_count"]
        else:
            print(f"\n[{stage}/] 空")

    print(f"\n▶ 未添付 合計: {total_missing} 本（今週の律速＝サムネ追加の残量）")

    if args.list:
        print("\n--- 未添付ファイル一覧 ---")
        any_missing = False
        for s in POSTED_SERIES:
            miss = rep["posted"][s]["missing"]
            if miss:
                any_missing = True
                print(f"\n[posted/{s}] {len(miss)}本:")
                for m in miss:
                    print(f"  - {m}")
        for stage in ("ready", "inbox"):
            miss = rep[stage]["missing"]
            if miss:
                any_missing = True
                print(f"\n[{stage}] {len(miss)}本:")
                for m in miss:
                    print(f"  - {m}")
        if not any_missing:
            print("（未添付なし）")

    return 0


if __name__ == "__main__":
    sys.exit(main())
