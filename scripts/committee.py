# -*- coding: utf-8 -*-
"""
ライフオラクル制作委員会エンジン。

5人（+将来1人）の担当 AI が毎日リサーチし、14時に会議で議論する仕組み。
daily_report.py（08:00 監視）とは別物。棲み分け:
  08:00  daily_report.py … システム/数値の監視レポート
  10:00  committee.py --phase research … 各担当が調査して reports/ にコミット
  14:00  committee.py --phase meeting  … 会議で議事録を生成し Slack に報告

設計方針:
  - 既存 daily_report.py のヘルパ（Slack送信・GA4取得）を再利用
  - Anthropic API は urllib のみ（追加依存なし）
  - 「調べるだけでなく理由と改善提案を必ず付ける」を全担当に課す
  - 最大目的: 心の奥から誰かに『このアプリ凄い』と言いたくなる内容・構成・見た目
  - ベンチマーク: SNS で「ライフオラクル」が俊雄さん以外の X/note で自然言及されるまで

必要な環境変数:
  ANTHROPIC_API_KEY   必須（各担当の思考エンジン）
  SLACK_WEBHOOK_URL   必須（会議サマリの送信先 = daily-report と同じ webhook）
  GITHUB_TOKEN        任意（engine 担当が CI 状態を読む / reports 自動コミット）
  COMMITTEE_MODEL     任意（既定 claude-opus-4-8。コスト優先なら claude-sonnet-4-6）
  WEB_SEARCH_TOOL     任意（既定 web_search_20250305）
  GA4_PROPERTY_ID / GOOGLE_CREDENTIALS_JSON  任意（data 担当の実データ）
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time
import urllib.request
import urllib.error
from datetime import datetime, timezone, timedelta
from pathlib import Path

JST = timezone(timedelta(hours=9))

REPO_ROOT = Path(__file__).resolve().parent.parent
SCRIPTS_DIR = Path(__file__).resolve().parent
ROLES_DIR = REPO_ROOT / "tasks" / "committee" / "roles"
REPORTS_DIR = REPO_ROOT / "tasks" / "committee" / "reports"
LEDGER_PATH = REPO_ROOT / "tasks" / "committee" / "LEDGER.md"

MODEL = os.environ.get("COMMITTEE_MODEL", "claude-opus-4-8")
WEB_SEARCH_TOOL = os.environ.get("WEB_SEARCH_TOOL", "web_search_20250305")

# 既存 daily_report.py のヘルパを再利用（Slack 送信・GA4・note・GitHub 状態）
sys.path.insert(0, str(SCRIPTS_DIR))
try:
    from daily_report import (
        http_post_json,
        _section,
        get_ga4_stats,
        get_note_stats,
        get_github_status,
    )
    _HAS_DAILY = True
except Exception as exc:  # pragma: no cover - インポート失敗時も会議自体は回す
    print(f"daily_report ヘルパのインポート失敗（縮退運転）: {exc}", file=sys.stderr)
    _HAS_DAILY = False

    def http_post_json(url, data, headers=None, timeout=15):
        body = json.dumps(data).encode()
        req = urllib.request.Request(url, data=body, method="POST", headers=headers or {})
        req.add_header("Content-Type", "application/json")
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                resp.read()
            return True
        except Exception as e:
            print(f"  POST {url[:80]} → {e}", file=sys.stderr)
            return False

    def _section(text):
        return {"type": "section", "text": {"type": "mrkdwn", "text": text}}

    def get_ga4_stats():
        return None

    def get_note_stats():
        return {"articles": [], "total_likes": 0, "errors": []}

    def get_github_status():
        return {"runs": [], "failed": [], "errors": []}


# ─── 担当（委員）の定義 ─────────────────────────────────────────────────────────
# prose（システムプロンプト）は roles/<id>.md に分離。ここでは挙動フラグのみ。
#   cadence:    "daily" 毎日 / "alternate" 隔日（content 担当は思考中心なので隔日）
#   web_search: Web 検索を許可するか
#   context:    リサーチ前に渡す素材の種類
#   enabled:    False の担当は当面スキップ（sales は将来枠）
ROLES = {
    "ux": {
        "name": "UX担当",
        "emoji": "🧭",
        "cadence": "daily",
        "web_search": True,
        "context": "market",
        "enabled": True,
    },
    "content": {
        "name": "コンテンツ担当",
        "emoji": "✍️",
        "cadence": "alternate",
        "web_search": True,
        "context": "questions",
        "enabled": True,
    },
    "engine": {
        "name": "エンジン担当",
        "emoji": "⚙️",
        "cadence": "daily",
        "web_search": False,
        "context": "ci",
        "enabled": True,
    },
    "data": {
        "name": "データ担当",
        "emoji": "📊",
        "cadence": "daily",
        "web_search": False,
        "context": "ga4",
        "enabled": True,
    },
    "seo": {
        "name": "SEO担当",
        "emoji": "🔍",
        "cadence": "daily",
        "web_search": True,
        "context": "seo",
        "enabled": True,
    },
    "sales": {
        "name": "営業担当（将来枠）",
        "emoji": "💼",
        "cadence": "daily",
        "web_search": True,
        "context": "market",
        "enabled": False,  # 転職アフィリエイト導入時に True へ
    },
}

ROLE_ORDER = ["ux", "content", "engine", "data", "seo", "sales"]

BENCHMARK = (
    "ベンチマーク（北極星）: SNS で「ライフオラクル」が俊雄さん本人の X / note 以外から、"
    "自然発生的に噂・言及されるようになるまで。最大目的は『心の奥から誰かにこのアプリ凄いと"
    "言いたくなる内容・構成・見た目』。"
)

OUTPUT_RULE = (
    "出力は必ず日本語の Markdown。次の4見出しを厳守:\n"
    "## 調査サマリ（今日わかったこと・3〜6点、箇条書き）\n"
    "## なぜ重要か（理由）（各サマリが結果にどう効くか）\n"
    "## 改善提案（具体・実装可能・優先度つき。『調べただけ』で終わらせない）\n"
    "## 確信度と次の一手（高/中/低 と、明日深掘りすること）\n"
    "禁止: 占い的な断定、根拠のない決めつけ、絶対に触らないデータ"
    "（処方箋2016件・偉人16名・cognitiveFunctionMap・光と影の名前）への変更提案。"
)


# ─── Anthropic API（urllib のみ） ───────────────────────────────────────────────

def anthropic_call(system: str, user: str, web_search: bool = False,
                   max_tokens: int = 3000) -> str | None:
    """1 メッセージを送り、最終テキストを返す。server tool 使用時の pause_turn も処理。"""
    key = os.environ.get("ANTHROPIC_API_KEY")
    if not key:
        print("  ANTHROPIC_API_KEY 未設定 — 担当はスキップ", file=sys.stderr)
        return None

    messages = [{"role": "user", "content": user}]
    tools = None
    if web_search:
        tools = [{"type": WEB_SEARCH_TOOL, "name": "web_search", "max_uses": 4}]

    headers = {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }

    for _ in range(5):  # pause_turn の継続上限
        body = {
            "model": MODEL,
            "max_tokens": max_tokens,
            "system": system,
            "messages": messages,
        }
        if tools:
            body["tools"] = tools

        req = urllib.request.Request(
            "https://api.anthropic.com/v1/messages",
            data=json.dumps(body).encode(),
            method="POST",
            headers=headers,
        )
        try:
            with urllib.request.urlopen(req, timeout=180) as resp:
                data = json.loads(resp.read())
        except urllib.error.HTTPError as e:  # type: ignore[attr-defined]
            detail = e.read().decode(errors="ignore")[:300]
            print(f"  Anthropic HTTP {e.code}: {detail}", file=sys.stderr)
            return None
        except Exception as e:
            print(f"  Anthropic 呼び出し失敗: {e}", file=sys.stderr)
            return None

        text = "".join(
            b.get("text", "") for b in data.get("content", []) if b.get("type") == "text"
        ).strip()

        if data.get("stop_reason") == "pause_turn":
            # server tool が継続を要求 → assistant の content を積んで再送
            messages.append({"role": "assistant", "content": data.get("content", [])})
            continue
        return text or None

    return None


# ─── リサーチ前に各担当へ渡す素材 ─────────────────────────────────────────────────

def _truncate(s: str, n: int) -> str:
    return s if len(s) <= n else s[:n] + "\n…（以下省略）"


def gather_context(kind: str) -> str:
    """担当の種類に応じた素材を集める。失敗しても会議は止めない。"""
    try:
        if kind == "questions":
            return _gather_questions()
        if kind == "ci":
            return _gather_ci()
        if kind == "ga4":
            return _gather_ga4()
        if kind == "seo":
            return _gather_seo()
        if kind == "market":
            return "（外部素材なし。Web 検索で最新の競合・トレンドを自分で集めること。）"
    except Exception as exc:
        return f"（素材収集でエラー: {exc}。手元情報の範囲で考察すること。）"
    return ""


def _gather_questions() -> str:
    """質問・選択肢ファイルを集めて抜粋（答えやすさ評価の素材）。"""
    patterns = [
        "life-oracle-v2/src/data_v2/questions",
        "life-oracle-v2/src/engine_v2",
    ]
    chunks: list[str] = []
    for rel in patterns:
        d = REPO_ROOT / rel
        if not d.exists():
            continue
        for p in sorted(d.glob("*.js"))[:8]:
            try:
                chunks.append(f"--- {p.relative_to(REPO_ROOT)} ---\n"
                              + _truncate(p.read_text(encoding="utf-8"), 1200))
            except Exception:
                continue
    if not chunks:
        return "（質問ファイルが見つからない。リポジトリ構成の前提を会議で確認すること。）"
    return _truncate("\n\n".join(chunks), 9000)


def _gather_ci() -> str:
    """GitHub Actions の最近の実行状態（挙動エラーの一次情報）。"""
    gh = get_github_status()
    runs = gh.get("runs", [])[:10]
    failed = gh.get("failed", [])
    lines = [f"- {r['name']}: {r.get('conclusion') or r.get('status')}" for r in runs]
    head = f"直近 {len(runs)} 実行 / 失敗 {len(failed)} 件\n" + "\n".join(lines)
    head += (
        "\n\n備考: 速度・ビルド時間の実測は別途 life-oracle-v2/scripts/stress_test.mjs で"
        "計測する。ここでは CI シグナルから挙動異常・回帰の兆候を読むこと。"
    )
    return head or "（CI 情報を取得できず。GITHUB_TOKEN を確認。）"


def _gather_ga4() -> str:
    """GA4 昨日の指標。未設定なら『見るべき指標の仮説』に切り替えるよう指示。"""
    ga4 = get_ga4_stats()
    if ga4 is None:
        return (
            "GA4 未設定（GOOGLE_CREDENTIALS_JSON / GA4_PROPERTY_ID が GitHub Secrets に無い）。\n"
            "→ 実データが無いので、『完走率・離脱ポイント・結果タイプ分布のうち"
            "今いちばん見るべき指標は何か、それはなぜか』を仮説として提示し、"
            "計測を有効化するための具体手順も改善提案に含めること。"
        )
    if "error" in ga4:
        return f"GA4 取得エラー: {ga4['error']}。原因切り分けと、暫定で見るべき代替指標を提案すること。"
    dur = int(ga4.get("avg_duration", 0))
    return (
        "GA4（昨日）実データ:\n"
        f"- セッション {ga4['sessions']:,} / ユーザー {ga4['users']:,} / PV {ga4['pageviews']:,}\n"
        f"- 平均滞在 {dur // 60}分{dur % 60}秒 / 直帰率 {int(ga4['bounce_rate'] * 100)}%\n"
        "→ 完走率・離脱ポイント・結果タイプ分布の観点で、この数字が何を物語るか"
        "（理由）と、次に打つ手（改善提案）を述べること。"
    )


def _gather_seo() -> str:
    """SEO 担当向け: note スキ数など手元の流入素材 + Web 検索指示。"""
    note = get_note_stats()
    arts = note.get("articles", [])
    lines = [f"- {a['label']}: ❤️{a.get('likes')}" for a in arts[:10]]
    base = f"公開 note 記事 {len(arts)} 本 / 合計スキ {note.get('total_likes', 0)}\n" + "\n".join(lines)
    base += (
        "\n\nSearch Console は未連携（将来 GSC 認証で実データ化）。"
        "Web 検索で『MBTI 診断 / 性格診断 / 自己分析』周辺の検索トレンド・上位競合を調べ、"
        "ライフオラクルが獲りに行くべきキーワードと、その理由・改善提案を出すこと。"
    )
    return base


# ─── 担当を1人ぶん走らせる ─────────────────────────────────────────────────────

def load_role_brief(role_id: str) -> str | None:
    p = ROLES_DIR / f"{role_id}.md"
    if not p.exists():
        print(f"  役割定義が無い: {p}", file=sys.stderr)
        return None
    return p.read_text(encoding="utf-8")


def due_today(role_id: str, now: datetime) -> bool:
    cfg = ROLES[role_id]
    if not cfg["enabled"]:
        return False
    if cfg["cadence"] == "alternate":
        # 隔日: 年内通算日が偶数の日のみ
        return now.timetuple().tm_yday % 2 == 0
    return True


def run_role(role_id: str, now: datetime) -> str | None:
    cfg = ROLES[role_id]
    brief = load_role_brief(role_id)
    if not brief:
        return None

    system = f"{brief}\n\n{BENCHMARK}\n\n{OUTPUT_RULE}"
    context = gather_context(cfg["context"])
    user = (
        f"今日は {now.strftime('%Y-%m-%d (%a)')} です。あなたは「{cfg['name']}」として、"
        f"本日の調査・考察を上記フォーマットでまとめてください。\n\n"
        f"=== 本日の素材 ===\n{context}"
    )

    print(f"  {cfg['emoji']} {cfg['name']} がリサーチ中…")
    out = anthropic_call(system, user, web_search=cfg["web_search"], max_tokens=3000)
    if not out:
        return None

    # reports/DATE/<role>.md に保存
    day_dir = REPORTS_DIR / now.strftime("%Y-%m-%d")
    day_dir.mkdir(parents=True, exist_ok=True)
    report_path = day_dir / f"{role_id}.md"
    header = f"# {cfg['emoji']} {cfg['name']} 日次レポート — {now.strftime('%Y-%m-%d')}\n\n"
    report_path.write_text(header + out + "\n", encoding="utf-8")
    print(f"     → {report_path.relative_to(REPO_ROOT)}")
    return out


# ─── git ───────────────────────────────────────────────────────────────────────

def git_commit_push(paths: list[Path], message: str) -> bool:
    """tasks/committee/ 配下を main にコミット&プッシュ。CI ループ防止に [skip ci]。"""
    try:
        subprocess.run(["git", "config", "user.name", "github-actions[bot]"], cwd=REPO_ROOT)
        subprocess.run(
            ["git", "config", "user.email", "github-actions[bot]@users.noreply.github.com"],
            cwd=REPO_ROOT,
        )
        subprocess.run(["git", "add", *[str(p) for p in paths]], cwd=REPO_ROOT)
        commit = subprocess.run(
            ["git", "commit", "-m", f"{message} [skip ci]"],
            capture_output=True, text=True, cwd=REPO_ROOT,
        )
        if commit.returncode != 0:
            print(f"  コミット対象なし: {commit.stdout.strip()} {commit.stderr.strip()}")
            return False
        push = subprocess.run(
            ["git", "push", "origin", "main"], capture_output=True, text=True, cwd=REPO_ROOT
        )
        if push.returncode != 0:
            print(f"  push 失敗: {push.stderr.strip()}", file=sys.stderr)
            return False
        return True
    except Exception as exc:
        print(f"  git 操作失敗: {exc}", file=sys.stderr)
        return False


# ─── フェーズ1: 10:00 リサーチ ───────────────────────────────────────────────────

def phase_research() -> int:
    now = datetime.now(JST)
    print(f"=== 委員会リサーチ {now.isoformat()} / model={MODEL} ===")

    done: list[str] = []
    for role_id in ROLE_ORDER:
        if not due_today(role_id, now):
            print(f"  {ROLES[role_id]['name']}: 本日は対象外（隔日 or 無効）")
            continue
        if run_role(role_id, now):
            done.append(role_id)
        time.sleep(1)

    if not done:
        print("リサーチ成果なし。終了。")
        return 0

    day_dir = REPORTS_DIR / now.strftime("%Y-%m-%d")
    git_commit_push([day_dir], f"docs(committee): {now.strftime('%m/%d')} 各担当の調査メモ")

    # 10:00 は軽い予告のみ Slack へ（本会議は 14:00）
    slack = os.environ.get("SLACK_WEBHOOK_URL")
    if slack:
        names = "、".join(ROLES[r]["emoji"] + ROLES[r]["name"] for r in done)
        http_post_json(slack, {"blocks": [
            _section(f"🗂 *委員会リサーチ完了（{now.strftime('%m/%d %H:%M JST')}）*\n"
                     f"本日調査した担当: {names}\n14:00 の会議で持ち寄り議論します。")
        ]})
    print(f"リサーチ完了: {done}")
    return 0


# ─── フェーズ2: 14:00 会議 ──────────────────────────────────────────────────────

def phase_meeting() -> int:
    now = datetime.now(JST)
    print(f"=== 委員会 14:00 会議 {now.isoformat()} / model={MODEL} ===")

    day_dir = REPORTS_DIR / now.strftime("%Y-%m-%d")
    reports: dict[str, str] = {}
    if day_dir.exists():
        for role_id in ROLE_ORDER:
            p = day_dir / f"{role_id}.md"
            if p.exists():
                reports[role_id] = p.read_text(encoding="utf-8")

    slack = os.environ.get("SLACK_WEBHOOK_URL")

    if not reports:
        msg = "本日の担当レポートが見つかりませんでした（リサーチ未実行の可能性）。"
        print(msg)
        if slack:
            http_post_json(slack, {"blocks": [_section(f"📋 *委員会 14:00*\n{msg}")]})
        return 0

    # 前回までの継続審議を会議に持ち込む
    carryover = ""
    if LEDGER_PATH.exists():
        carryover = _truncate(LEDGER_PATH.read_text(encoding="utf-8"), 4000)

    bundle = "\n\n".join(f"### {ROLES[r]['name']}\n{txt}" for r, txt in reports.items())
    system = (
        "あなたはライフオラクル制作委員会の進行役（議長）兼、俊雄さん（代表）付きの秘書です。"
        "各担当の本日レポートを統合し、会議の議事録を作ります。\n" + BENCHMARK + "\n"
        "議事録は日本語 Markdown で、次の見出しを厳守:\n"
        "## 本日の決定事項（合意・即実行できるもの。担当と一文の根拠つき）\n"
        "## 継続審議（今日決まらず明日へ持ち越す論点と、その理由）\n"
        "## 俊雄さんへの依頼（理由つき）（俊雄さん自身の実行が必要なもの。"
        "なぜ必要かを必ず添える。無ければ『なし』）\n"
        "## 担当ハイライト（各担当の最重要ポイントを1行ずつ）\n"
        "原則: 提案は具体的・優先度つき。絶対に触らないデータへの変更提案は禁止。"
        "決定はするが、最終判断は俊雄さんに委ねる姿勢を保つ。"
    )
    user = (
        f"日付: {now.strftime('%Y-%m-%d (%a)')}\n\n"
        f"=== 前回までの継続審議（LEDGER 抜粋）===\n{carryover or '（なし）'}\n\n"
        f"=== 本日の各担当レポート ===\n{bundle}"
    )

    print("  議長が議事録を作成中…")
    minutes = anthropic_call(system, user, web_search=False, max_tokens=4000)
    if not minutes:
        print("議事録生成に失敗。", file=sys.stderr)
        if slack:
            http_post_json(slack, {"blocks": [
                _section("📋 *委員会 14:00*\n議事録生成に失敗しました（ANTHROPIC_API_KEY を確認）。")
            ]})
        return 1

    # LEDGER に追記
    entry = (
        f"\n\n---\n\n## {now.strftime('%Y-%m-%d (%a)')} 会議議事録\n\n"
        f"参加担当: {'、'.join(ROLES[r]['name'] for r in reports)}\n\n{minutes}\n"
    )
    if not LEDGER_PATH.exists():
        LEDGER_PATH.write_text(
            "# ライフオラクル制作委員会 議事録台帳（LEDGER）\n\n"
            "毎日 14:00 の会議で自動追記。継続審議はここで翌日へ引き継ぐ。\n",
            encoding="utf-8",
        )
    with LEDGER_PATH.open("a", encoding="utf-8") as f:
        f.write(entry)
    git_commit_push([LEDGER_PATH], f"docs(committee): {now.strftime('%m/%d')} 会議議事録")

    # Slack へ会議サマリ（俊雄さんへの報告 = 秘書の役割）
    if slack:
        blocks = [
            {"type": "header", "text": {"type": "plain_text",
             "text": f"📋 委員会 議事録 {now.strftime('%m/%d (%a) %H:%M JST')}"}},
            {"type": "divider"},
        ]
        # Slack section は 3000 字上限。安全に分割。
        body = minutes
        for i in range(0, len(body), 2800):
            blocks.append(_section(body[i:i + 2800]))
        blocks.append({"type": "context", "elements": [{"type": "mrkdwn",
            "text": "秘書（Claude）より。実行が必要な項目は『俊雄さんへの依頼』を参照。"}]})
        http_post_json(slack, {"blocks": blocks})

    print("会議完了・Slack 送信済み。")
    return 0


# ─── main ────────────────────────────────────────────────────────────────────

def main() -> int:
    ap = argparse.ArgumentParser(description="ライフオラクル制作委員会エンジン")
    ap.add_argument("--phase", choices=["research", "meeting"], required=True)
    args = ap.parse_args()
    if args.phase == "research":
        return phase_research()
    return phase_meeting()


if __name__ == "__main__":
    sys.exit(main())
