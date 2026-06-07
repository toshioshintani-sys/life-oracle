# -*- coding: utf-8 -*-
"""
runway_check.py — 予約記事の「残りランウェイ」を監視し、3週間(21日)を切ったら Slack で俊雄さんに通知する。

自律運用ルール（~/.claude/AUTONOMY_OPERATING_RULES.md）原則6（枯渇の定量検知→人間へ通知）
＋原則1（agentが監視・人間が決定）の実装。**通知のみ。記事生成も公開も一切しない**（NOT_DOING #1 を厳守）。

真実源：ローカルの予約記事ファイル名の日付（yoru/wata/post/jin）＋ docs/state/ガチ人_進捗管理.json（gachi）。
  ※ note.com の list系API は予約記事を隠す（憲法に明記）ため、ローカルファイルが唯一信頼できる在庫源。
  ※ ∴ これはクラウド(GitHub Actions)では動かない＝ローカル専用スクリプト（週次タスク想定）。

使い方：
  python -X utf8 scripts/runway_check.py            # 21日未満のシリーズがあれば Slack通知
  python -X utf8 scripts/runway_check.py --dry-run  # Slack送信せず標準出力のみ
  python -X utf8 scripts/runway_check.py --always    # 閾値に関わらず週次サマリを Slack送信

環境変数：SLACK_WEBHOOK_URL（無ければ SLACK_WEBHOOK_LIFE_ORACLE_MORNING を代用）
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.request
from datetime import date, datetime, timezone, timedelta
from pathlib import Path

JST = timezone(timedelta(hours=9))
THRESHOLD_DAYS = 21  # 3週間

REPO_ROOT = Path(__file__).resolve().parent.parent      # ライフオラクル/
WORK_ROOT = REPO_ROOT.parent                            # Claude_work/
NOTE = WORK_ROOT / "ライフオラクルnoteネタ"

# .env から SLACK_WEBHOOK_URL を読む（複数候補を順に・既存値は上書きしない）
for _envp in (REPO_ROOT / ".env", WORK_ROOT / ".env", WORK_ROOT / "world-oracle-staging" / ".env"):
    if _envp.exists():
        for _line in _envp.read_text(encoding="utf-8", errors="replace").splitlines():
            _s = _line.strip()
            if _s and not _s.startswith("#") and "=" in _s:
                _k, _, _v = _s.partition("=")
                os.environ.setdefault(_k.strip(), _v.strip())

ARTICLE_DIRS = [NOTE / "articles" / "posted", NOTE / "articles" / "ready", NOTE / "articles" / "inbox"]
GACHI_STATE = NOTE / "docs" / "state" / "ガチ人_進捗管理.json"

# wata は完結シリーズ（予約終了＝在庫切れではない）ので警告対象外
ACTIVE = ["yoru", "post", "jin", "gachi"]
ALL_PREFIXES = ["yoru", "wata", "post", "jin", "gachi"]
SERIES_LABEL = {"yoru": "夜のトリセツ", "wata": "私のトリセツ(完結)",
                "post": "汎用post", "jin": "職場の隣人図鑑", "gachi": "ガチ人"}
EXCLUDE_DIRS = ("_deleted_on_note", "_never_posted")

DATE_RE = re.compile(r"(20\d{2})-(\d{2})-(\d{2})")
PREF_RE = re.compile(r"^(yoru|wata|post|jin|gachi)_", re.I)


def _today_jst() -> date:
    return datetime.now(JST).date()


def runway_from_files() -> dict[str, date]:
    """記事ファイル名の日付からシリーズ別の予約最終日（最大日付）を集計。"""
    res: dict[str, date] = {}
    for d in ARTICLE_DIRS:
        if not d.exists():
            continue
        for f in d.rglob("*.md"):
            if any(ex in f.parts for ex in EXCLUDE_DIRS):
                continue  # 削除済み・ボツは在庫に数えない
            mp = PREF_RE.match(f.name)
            dm = DATE_RE.search(f.name)
            if not mp or not dm:
                continue
            pref = mp.group(1).lower()
            y, m, dd = map(int, dm.groups())
            try:
                dt = date(y, m, dd)
            except ValueError:
                continue
            if pref not in res or dt > res[pref]:
                res[pref] = dt
    return res


def runway_from_gachi_state() -> date | None:
    """gachi は記事MDが無い（Supabase運用）ので進捗JSONの投稿予定日から最終日を取る。"""
    if not GACHI_STATE.exists():
        return None
    try:
        data = json.loads(GACHI_STATE.read_text(encoding="utf-8", errors="replace"))
    except Exception:
        return None
    mx: date | None = None
    for a in data.get("articles", []):
        dm = DATE_RE.search(str(a.get("投稿予定日", "")))
        if not dm:
            continue
        y, m, dd = map(int, dm.groups())
        try:
            dt = date(y, m, dd)
        except ValueError:
            continue
        if mx is None or dt > mx:
            mx = dt
    return mx


def post_slack(text: str) -> bool:
    url = os.environ.get("SLACK_WEBHOOK_URL") or os.environ.get("SLACK_WEBHOOK_LIFE_ORACLE_MORNING")
    if not url:
        print("SLACK_WEBHOOK_URL 未設定 — 通知スキップ", file=sys.stderr)
        return False
    body = json.dumps({"blocks": [{"type": "section",
                                   "text": {"type": "mrkdwn", "text": text}}]}).encode()
    req = urllib.request.Request(url, data=body, method="POST",
                                 headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            resp.read()
        return True
    except Exception as exc:
        print(f"Slack送信失敗: {exc}", file=sys.stderr)
        return False


def main() -> int:
    ap = argparse.ArgumentParser(description="予約ランウェイ監視（21日未満でSlack通知・通知のみ）")
    ap.add_argument("--dry-run", action="store_true", help="Slack送信せず標準出力のみ")
    ap.add_argument("--always", action="store_true", help="閾値に関わらず週次サマリを送信")
    args = ap.parse_args()

    today = _today_jst()
    runways = runway_from_files()
    g = runway_from_gachi_state()
    if g is not None:
        cur = runways.get("gachi")
        runways["gachi"] = max(d for d in (cur, g) if d is not None)

    rows: list[tuple[str, date, int]] = []
    alerts: list[tuple[str, date, int]] = []
    for pref in ALL_PREFIXES:
        mx = runways.get(pref)
        if mx is None:
            continue
        days = (mx - today).days
        rows.append((pref, mx, days))
        if pref in ACTIVE and days < THRESHOLD_DAYS:
            alerts.append((pref, mx, days))

    print(f"=== 予約ランウェイ {today} (閾値 {THRESHOLD_DAYS}日) ===")
    for pref, mx, days in sorted(rows, key=lambda r: r[2]):
        if pref not in ACTIVE:
            flag = "—(完結)"
        elif days < THRESHOLD_DAYS:
            flag = "🚨"
        else:
            flag = "✅"
        print(f"  {flag} {pref:6} 予約最終={mx} 残り{days}日")

    if alerts:
        def _line(p, mx, days):
            if days < 0:
                return f"• 🚨 *{SERIES_LABEL.get(p, p)}({p})* — *予約切れ*（{abs(days)}日前に終了・至急）"
            return f"• 🚨 *{SERIES_LABEL.get(p, p)}({p})* 予約最終 {mx}（残り *{days}日*）"
        text = ("🗓️ *予約ランウェイ警告（3週間を切りました）*\n"
                + "\n".join(_line(p, mx, days) for p, mx, days in sorted(alerts, key=lambda r: r[2]))
                + "\n\n→ 該当シリーズを「まとめ書き→バルク予約」で補充してください（俊雄さんの対処事項）。"
                + "\n_※この通知は監視のみ。記事の生成・公開は自動では行いません。_")
        if args.dry_run:
            print("\n[DRY-RUN] 通知内容:\n" + text)
        elif post_slack(text):
            print("Slack通知 送信完了。")
        return 0

    if args.always and not args.dry_run:
        summary = "\n".join(
            f"• {SERIES_LABEL.get(p, p)}({p}) 予約最終 {mx}（残り{days}日）"
            for p, mx, days in sorted(rows, key=lambda r: r[2]) if p in ACTIVE
        )
        post_slack("🗓️ *予約ランウェイ 週次サマリ*（全アクティブシリーズ21日以上・正常）\n" + summary)
        print("Slack（週次サマリ）送信完了。")
    else:
        print("21日未満のアクティブシリーズなし。通知不要。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
