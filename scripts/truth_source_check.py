# -*- coding: utf-8 -*-
"""
truth_source_check.py — 委員会の真実源(RESOLVED_FACTS/WEEKLY_SPRINT)が古くなっていないか毎日検知し、
古ければ Slack で「次セッションで台帳を点検・更新せよ」と通知する。**通知のみ・Anthropic API不使用**。

背景：委員会はクラウドで RESOLVED_FACTS / WEEKLY_SPRINT / NOT_DOING を毎回読むだけで、Claude Codeでの
会話（＝確定事実・SEO真因・機能実装の発見）は知らない。台帳を更新し忘れると委員会が古い前提でループする
（2026-06「GA4未実装/完走率不能」を3回繰り返した実例）。本スクリプトは「更新し忘れ」を機械的に検知する安全網。
真の解は CLAUDE.md 自律運用ルール「確定事実が出たら聞かず台帳更新+push」（人間＝決定／実行＝agent）。

検知ロジック（すべて決定的・APIを叩かない）：
  - RESOLVED_FACTS.md / WEEKLY_SPRINT.md の最終コミット日時（git）
  - それ以降の「実質コミット数」（docs(committee) 自動コミットは除外）
  - それ以降の Claude Code セッション数（~/.claude/projects/.../*.jsonl の更新数）
  → 最終更新から STALE_DAYS 日以上経過し、かつ実質コミット or セッションが閾値以上なら「古い」と判定して通知。
    更新直後・活動が無ければ沈黙（毎日のノイズにしない）。

使い方：
  python -X utf8 scripts/truth_source_check.py            # 古ければ Slack通知
  python -X utf8 scripts/truth_source_check.py --dry-run  # 送信せず標準出力のみ
  python -X utf8 scripts/truth_source_check.py --always    # 状態に関わらずサマリを送信
環境変数：SLACK_WEBHOOK_URL（無ければ SLACK_WEBHOOK_LIFE_ORACLE_MORNING）
"""
from __future__ import annotations
import argparse, json, os, subprocess, sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

JST = timezone(timedelta(hours=9))
STALE_DAYS = 2            # 真実源がこの日数以上更新されていない
MIN_COMMITS = 2           # かつ実質コミットがこれ以上 …で「点検要」
MIN_SESSIONS = 2          # または セッションがこれ以上
TRACKED = ["docs/RESOLVED_FACTS.md", "docs/WEEKLY_SPRINT.md"]

REPO_ROOT = Path(__file__).resolve().parent.parent          # ライフオラクル/
WORK_ROOT = REPO_ROOT.parent                                # Claude_work/
SESS_DIR = Path.home() / ".claude" / "projects" / "C--Users-user-Desktop-Claude-work"

for _envp in (REPO_ROOT / ".env", WORK_ROOT / ".env", WORK_ROOT / "world-oracle-staging" / ".env"):
    if _envp.exists():
        for _line in _envp.read_text(encoding="utf-8", errors="replace").splitlines():
            _s = _line.strip()
            if _s and not _s.startswith("#") and "=" in _s:
                _k, _, _v = _s.partition("="); os.environ.setdefault(_k.strip(), _v.strip())


def _git(*args: str) -> str:
    try:
        return subprocess.run(["git", "-C", str(REPO_ROOT), *args],
                              capture_output=True, text=True, encoding="utf-8",
                              errors="replace", timeout=30).stdout.strip()
    except Exception:
        return ""


def _ref() -> str:
    """比較基準。fetchできれば origin/main（委員会が読む状態）、ダメならローカルHEAD。"""
    subprocess.run(["git", "-C", str(REPO_ROOT), "fetch", "-q", "origin", "main"],
                   capture_output=True, timeout=40)
    return "origin/main" if _git("rev-parse", "--verify", "-q", "origin/main") else "HEAD"


def last_truthsource_commit(ref: str):
    """TRACKED のうち最も新しい最終更新コミット (hash, datetime) を返す。"""
    newest = None
    for f in TRACKED:
        h = _git("log", "-1", "--format=%H", ref, "--", f)
        iso = _git("log", "-1", "--format=%cI", ref, "--", f)
        if h and iso:
            try:
                dt = datetime.fromisoformat(iso)
            except ValueError:
                continue
            if newest is None or dt > newest[1]:
                newest = (h, dt, f)
    return newest


def main() -> int:
    ap = argparse.ArgumentParser(description="委員会真実源の鮮度チェック（古ければSlack通知・API不使用）")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--always", action="store_true")
    args = ap.parse_args()

    ref = _ref()
    info = last_truthsource_commit(ref)
    now = datetime.now(timezone.utc)
    if not info:
        print("真実源コミットを特定できず（git履歴不足）。スキップ。"); return 0
    ts_hash, ts_dt, ts_file = info
    days = (now - ts_dt.astimezone(timezone.utc)).days

    # 以降の実質コミット（委員会の自動議事録コミットは除外）
    subjects = [s for s in _git("log", "--format=%s", f"{ts_hash}..{ref}").splitlines() if s.strip()]
    substantive = [s for s in subjects if not s.startswith("docs(committee)")]
    # 以降のセッション数（会話＝発見の機会）
    sessions = 0
    if SESS_DIR.exists():
        cut = ts_dt.timestamp()
        sessions = sum(1 for p in SESS_DIR.glob("*.jsonl") if p.stat().st_mtime > cut)

    stale = days >= STALE_DAYS and (len(substantive) >= MIN_COMMITS or sessions >= MIN_SESSIONS)

    print(f"=== 委員会真実源 鮮度チェック {datetime.now(JST):%Y-%m-%d %H:%M} ===")
    print(f"  最終更新: {ts_file} を {ts_dt.astimezone(JST):%Y-%m-%d %H:%M}（{days}日前 / {ts_hash[:8]}）")
    print(f"  以降の実質コミット: {len(substantive)}件（除・委員会自動） / セッション: {sessions}件")
    print(f"  判定: {'🔔 古い（点検要）' if stale else '✅ 鮮度OK（通知不要）'}")

    msg = ("🔔 *委員会の真実源、点検を*\n"
           f"• `RESOLVED_FACTS/WEEKLY_SPRINT` 最終更新: *{days}日前*\n"
           f"• 以降の実質コミット *{len(substantive)}件* / セッション *{sessions}件*\n"
           "→ この間の確定事実・前提崩し（計測実態・SEO・機能実装など）が台帳に反映されているか、"
           "次セッションで点検し、漏れていれば *聞かずに* 更新+push（CLAUDE.md 自律運用ルール）。\n"
           "_※API不使用・通知のみ。委員会はクラウドで台帳を毎回読むだけ＝会話を知らない。_")
    summary = (f"✅ 委員会真実源は鮮度OK（最終更新{days}日前・以降コミット{len(substantive)}/セッション{sessions}）。")

    if stale or (args.always):
        text = msg if stale else summary
        if args.dry_run:
            print("\n[DRY-RUN] 通知内容:\n" + text)
        else:
            url = os.environ.get("SLACK_WEBHOOK_URL") or os.environ.get("SLACK_WEBHOOK_LIFE_ORACLE_MORNING")
            if not url:
                print("SLACK_WEBHOOK_URL 未設定 — 通知スキップ", file=sys.stderr); return 0
            body = json.dumps({"blocks": [{"type": "section", "text": {"type": "mrkdwn", "text": text}}]}).encode()
            import urllib.request
            req = urllib.request.Request(url, data=body, method="POST", headers={"Content-Type": "application/json"})
            try:
                with urllib.request.urlopen(req, timeout=15) as r: r.read()
                print("Slack通知 送信完了。")
            except Exception as e:
                print(f"Slack送信失敗: {e}", file=sys.stderr)
    else:
        print("通知不要（鮮度OK・--always で強制送信可）。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
