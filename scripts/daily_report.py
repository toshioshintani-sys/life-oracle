# -*- coding: utf-8 -*-
"""
ライフオラクル 日次監視レポート。

収集データ:
  note 記事スキ数          — 認証不要（非公式 API）
  Google Analytics 4       — 任意 (GOOGLE_CREDENTIALS_JSON + GA4_PROPERTY_ID)
  X / Twitter              — 任意 (TWITTER_BEARER_TOKEN + TWITTER_USERNAME)
  X 投稿傾向分析（Claude）  — 任意 (ANTHROPIC_API_KEY)
  GitHub Actions 状態      — GITHUB_TOKEN（Actions 実行時は自動利用可）
  Netlify デプロイ状態     — 任意 (NETLIFY_TOKEN + NETLIFY_SITE_ID)

自動修復:
  失敗した GitHub Actions を再実行（最大3件）
  tasks/jin_articles/ に公開期限切れファイルがあれば notePublished を更新してコミット

出力: SLACK_WEBHOOK_URL 宛に Slack Block Kit メッセージを送信
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import time
import urllib.request
import urllib.error
import urllib.parse
from datetime import datetime, timezone, timedelta
from pathlib import Path

# x_analytics.py と同じディレクトリにあるため直接インポート
sys.path.insert(0, str(Path(__file__).parent))
try:
    from x_analytics import get_x_analysis as _get_x_analysis
    _HAS_X_ANALYTICS = True
except ImportError:
    _HAS_X_ANALYTICS = False

JST = timezone(timedelta(hours=9))
UTC = timezone.utc

REPO_ROOT = Path(__file__).resolve().parent.parent
JIN_TYPES_PATH = REPO_ROOT / "life-oracle-v2" / "src" / "data_v2" / "jin" / "jin_types.json"
BIAS_INFO_PATH = REPO_ROOT / "life-oracle-v2" / "src" / "data_v2" / "meta" / "biasInfo.js"
ARTICLES_DIR   = REPO_ROOT / "tasks" / "jin_articles"
GITHUB_REPO    = os.environ.get("GITHUB_REPOSITORY", "toshioshintani-sys/life-oracle")

# 役目を終えた（予約完了で停止した）ワークフロー。失敗を報告も再実行もしない。
# gachi は2026-11月まで予約完了済み＝gachijin パイプラインは引退（docs/NOT_DOING.md #8 と同期）。
RETIRED_WORKFLOW_KEYWORDS = ("gachijin",)


# ─── HTTP helpers ────────────────────────────────────────────────────────────

def http_get(url: str, headers: dict | None = None, timeout: int = 15) -> dict | list | None:
    req = urllib.request.Request(url, headers=headers or {})
    req.add_header("User-Agent", "life-oracle-monitor/1.0")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read())
    except Exception as exc:
        print(f"  GET {url[:80]} → {exc}", file=sys.stderr)
        return None


def http_post_json(url: str, data: dict, headers: dict | None = None, timeout: int = 15) -> bool:
    body = json.dumps(data).encode()
    req = urllib.request.Request(url, data=body, method="POST", headers=headers or {})
    req.add_header("Content-Type", "application/json")
    req.add_header("User-Agent", "life-oracle-monitor/1.0")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            resp.read()
        return True
    except Exception as exc:
        print(f"  POST {url[:80]} → {exc}", file=sys.stderr)
        return False


# ─── note スキ数 ─────────────────────────────────────────────────────────────

def _extract_note_key(note_url: str) -> str | None:
    m = re.search(r'/n/([a-zA-Z0-9]+)$', note_url)
    return m.group(1) if m else None


def _fetch_note_likes(note_key: str) -> int | None:
    data = http_get(f"https://note.com/api/v2/notes/{note_key}", timeout=10)
    if isinstance(data, dict):
        return data.get("data", {}).get("like_count")
    return None


def get_note_stats() -> dict:
    """公開済みjin記事 + バイアス記事のスキ数を取得。"""
    now = datetime.now(UTC)
    articles: list[dict] = []
    errors: list[str] = []

    # jin_types.json から公開済み記事
    try:
        jin = json.loads(JIN_TYPES_PATH.read_text(encoding="utf-8"))
        for t in jin["types"]:
            if not t.get("notePublished") or not t.get("noteUrl"):
                continue
            key = _extract_note_key(t["noteUrl"])
            if not key:
                continue
            likes = _fetch_note_likes(key)
            articles.append({
                "id":    t["id"],
                "label": t.get("noteUrlSlug") or t.get("internalLabel", t["id"]),
                "url":   t["noteUrl"],
                "likes": likes,
            })
    except Exception as exc:
        errors.append(f"jin_types.json 読み込みエラー: {exc}")

    # biasInfo.js からスケジュール済み公開記事
    try:
        content = BIAS_INFO_PATH.read_text(encoding="utf-8")
        # 各バイアスブロック: B1: { name, noteUrl, noteScheduledAt, ... }
        for m in re.finditer(
            r'(B\d+)\s*:\s*\{[^}]*?name:\s*[\'"]([^\'"]+)[\'"][^}]*?'
            r'noteUrl:\s*[\'"]([^\'"]+)[\'"][^}]*?'
            r'noteScheduledAt:\s*[\'"]([^\'"]+)[\'"]',
            content, re.DOTALL
        ):
            bias_id, name, note_url, scheduled_at = m.groups()
            try:
                pub_dt = datetime.fromisoformat(scheduled_at.replace("Z", "+00:00"))
                if now < pub_dt:
                    continue  # まだ非公開
            except ValueError:
                pass
            key = _extract_note_key(note_url)
            if not key:
                continue
            likes = _fetch_note_likes(key)
            articles.append({
                "id":    bias_id,
                "label": f"{name}（バイアス）",
                "url":   note_url,
                "likes": likes,
            })
    except Exception as exc:
        errors.append(f"biasInfo.js 読み込みエラー: {exc}")

    total = sum(a["likes"] for a in articles if a["likes"] is not None)
    return {"articles": articles, "total_likes": total, "errors": errors}


# ─── Google Analytics 4 ──────────────────────────────────────────────────────

def get_ga4_stats() -> dict | None:
    prop_id = os.environ.get("GA4_PROPERTY_ID")
    creds_json = os.environ.get("GOOGLE_CREDENTIALS_JSON")
    if not prop_id or not creds_json:
        return None  # 未設定
    try:
        from google.analytics.data_v1beta import BetaAnalyticsDataClient
        from google.analytics.data_v1beta.types import DateRange, Dimension, Metric, RunReportRequest
        from google.oauth2 import service_account

        creds = service_account.Credentials.from_service_account_info(
            json.loads(creds_json),
            scopes=["https://www.googleapis.com/auth/analytics.readonly"],
        )
        client = BetaAnalyticsDataClient(credentials=creds)
        resp = client.run_report(RunReportRequest(
            property=f"properties/{prop_id}",
            date_ranges=[DateRange(start_date="yesterday", end_date="yesterday")],
            metrics=[
                Metric(name="sessions"),
                Metric(name="activeUsers"),
                Metric(name="screenPageViews"),
                Metric(name="averageSessionDuration"),
                Metric(name="bounceRate"),
            ],
        ))
        if resp.rows:
            v = resp.rows[0].metric_values
            return {
                "sessions":      int(v[0].value),
                "users":         int(v[1].value),
                "pageviews":     int(v[2].value),
                "avg_duration":  float(v[3].value),
                "bounce_rate":   float(v[4].value),
            }
        return {"sessions": 0, "users": 0, "pageviews": 0, "avg_duration": 0, "bounce_rate": 0}
    except ImportError:
        return {"error": "google-analytics-data 未インストール"}
    except Exception as exc:
        return {"error": str(exc)}


# ─── Google Search Console ───────────────────────────────────────────────────

GSC_SITE = "https://life-oracle.jp/"


def _gsc_credentials():
    """GA4と共通のサービスアカウント認証（webmasters.readonly）。
    cloud=GOOGLE_CREDENTIALS_JSON / local=monitoring/config/ga4-sa.json。"""
    from google.oauth2 import service_account
    scopes = ["https://www.googleapis.com/auth/webmasters.readonly"]
    creds_json = os.environ.get("GOOGLE_CREDENTIALS_JSON")
    if creds_json:
        return service_account.Credentials.from_service_account_info(
            json.loads(creds_json), scopes=scopes)
    sa = REPO_ROOT.parent / "monitoring" / "config" / "ga4-sa.json"  # ローカルSA鍵
    if sa.exists():
        return service_account.Credentials.from_service_account_file(str(sa), scopes=scopes)
    return None


def get_gsc_stats() -> dict | None:
    """Search Console の直近28日のクリック/表示 + 上位クエリ。認証情報が無ければ None。"""
    try:
        creds = _gsc_credentials()
        if creds is None:
            return None
        import google.auth.transport.requests as gtr
        creds.refresh(gtr.Request())
        token = creds.token
        end = (datetime.now(UTC) - timedelta(days=3)).date()   # GSC は2-3日遅延
        start = end - timedelta(days=27)
        site = urllib.parse.quote(GSC_SITE, safe="")
        url = f"https://searchconsole.googleapis.com/webmasters/v3/sites/{site}/searchAnalytics/query"
        body = json.dumps({"startDate": str(start), "endDate": str(end),
                           "dimensions": ["query"], "rowLimit": 10}).encode()
        req = urllib.request.Request(url, data=body, method="POST",
                                     headers={"Authorization": f"Bearer {token}",
                                              "Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read())
        rows = data.get("rows", [])
        return {
            "period": f"{start}〜{end}",
            "clicks": sum(r["clicks"] for r in rows),
            "impressions": sum(r["impressions"] for r in rows),
            "query_count": len(rows),
            "top": [{"query": r["keys"][0], "clicks": r["clicks"],
                     "impressions": r["impressions"], "position": round(r["position"], 1)}
                    for r in rows[:8]],
        }
    except ImportError:
        return {"error": "google-auth 未インストール"}
    except Exception as exc:
        return {"error": str(exc)}


# ─── X / Twitter ─────────────────────────────────────────────────────────────

def get_x_stats() -> dict | None:
    """x_analytics.get_x_analysis() を呼び出す。未インストール時は None を返す。"""
    if not os.environ.get("TWITTER_BEARER_TOKEN"):
        return None
    if _HAS_X_ANALYTICS:
        return _get_x_analysis()
    return {"error": "x_analytics.py が見つかりません"}


# ─── GitHub Actions ───────────────────────────────────────────────────────────

def _github(path: str, method: str = "GET", body: dict | None = None) -> dict | list | None:
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GITHUB_ACTIONS_TOKEN")
    if not token:
        return None
    url = f"https://api.github.com/repos/{GITHUB_REPO}/{path}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept":        "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent":    "life-oracle-monitor/1.0",
    }
    if method == "GET":
        return http_get(url, headers=headers)
    data = json.dumps(body or {}).encode()
    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = resp.read()
            return json.loads(raw) if raw else {}
    except Exception as exc:
        print(f"  {method} {url[:80]} → {exc}", file=sys.stderr)
        return None


def get_github_status() -> dict:
    result: dict = {"runs": [], "failed": [], "errors": []}
    data = _github("actions/runs?per_page=30&branch=main")
    if not isinstance(data, dict):
        result["errors"].append("GitHub Actions API 取得失敗")
        return result
    for run in data.get("workflow_runs", []):
        blob = f"{run.get('path', '')} {run.get('name', '')}".lower()
        if any(k in blob for k in RETIRED_WORKFLOW_KEYWORDS):
            continue  # 引退ワークフロー（gachijin等）の失敗は報告も再実行もしない
        entry = {
            "id":         run["id"],
            "name":       run["name"],
            "status":     run["status"],
            "conclusion": run["conclusion"],
            "url":        run["html_url"],
            "created_at": run["created_at"],
        }
        result["runs"].append(entry)
        if run["conclusion"] in ("failure", "timed_out") and run["status"] == "completed":
            result["failed"].append(entry)
    return result


def rerun_failed_workflows(failed: list[dict]) -> list[str]:
    done = []
    for run in failed[:3]:
        resp = _github(f"actions/runs/{run['id']}/rerun", method="POST")
        if resp is not None:
            done.append(run["name"])
        time.sleep(1)
    return done


# ─── Netlify ─────────────────────────────────────────────────────────────────

def get_netlify_status() -> dict | None:
    token   = os.environ.get("NETLIFY_TOKEN")
    site_id = os.environ.get("NETLIFY_SITE_ID")
    if not token or not site_id:
        return None
    data = http_get(
        f"https://api.netlify.com/api/v1/sites/{site_id}/deploys?per_page=5",
        headers={"Authorization": f"Bearer {token}"},
    )
    if not isinstance(data, list) or not data:
        return {"error": "Netlify API 取得失敗"}
    latest = data[0]
    return {
        "state":         latest.get("state"),   # ready / building / error
        "error_message": latest.get("error_message"),
        "deploy_url":    latest.get("deploy_url") or latest.get("url"),
        "created_at":    latest.get("created_at"),
    }


# ─── Auto-fix: jin 公開チェック ───────────────────────────────────────────────

def autofix_jin_publish() -> str | None:
    """tasks/jin_articles/ に公開日超過ファイルがあれば update_jin_published.py を実行してコミット。"""
    if not ARTICLES_DIR.exists() or not any(ARTICLES_DIR.iterdir()):
        return None  # 記事ファイルなし

    script = REPO_ROOT / "scripts" / "update_jin_published.py"
    result = subprocess.run(
        [sys.executable, str(script)],
        capture_output=True, text=True, cwd=REPO_ROOT
    )
    if "type(s) updated" not in result.stdout or "0 type(s)" in result.stdout:
        return None  # 更新なし

    # git commit & push
    subprocess.run(["git", "config", "user.name",  "github-actions[bot]"], cwd=REPO_ROOT)
    subprocess.run(["git", "config", "user.email", "github-actions[bot]@users.noreply.github.com"], cwd=REPO_ROOT)
    subprocess.run(["git", "add", str(JIN_TYPES_PATH)], cwd=REPO_ROOT)
    commit = subprocess.run(
        ["git", "commit", "-m", "chore: auto-publish jin articles based on schedule"],
        capture_output=True, text=True, cwd=REPO_ROOT
    )
    if commit.returncode == 0:
        subprocess.run(["git", "push", "origin", "main"], cwd=REPO_ROOT)
        # 更新されたタイプ名を抽出
        ids = re.findall(r'SET notePublished=true: (jin_\d+)', result.stdout)
        return f"jin 記事を公開済みに更新: {', '.join(ids)}"
    return None


# ─── Slack メッセージ ─────────────────────────────────────────────────────────

def _section(text: str) -> dict:
    return {"type": "section", "text": {"type": "mrkdwn", "text": text}}


def build_slack_message(
    note:           dict,
    ga4:            dict | None,
    x:              dict | None,
    github:         dict,
    netlify:        dict | None,
    autofix_log:    list[str],
    manual_actions: list[str],
) -> dict:
    today = datetime.now(JST).strftime("%m/%d (%a)")
    blocks: list[dict] = [
        {"type": "header", "text": {"type": "plain_text", "text": f"🔮 ライフオラクル 日次レポート {today}"}},
        {"type": "divider"},
    ]

    # GA4
    if ga4 is None:
        ga4_text = "_未設定 — `GOOGLE_CREDENTIALS_JSON` / `GA4_PROPERTY_ID` を GitHub Secrets に追加してください_"
    elif "error" in ga4:
        ga4_text = f"❌ {ga4['error']}"
    else:
        dur = int(ga4["avg_duration"])
        br  = int(ga4["bounce_rate"] * 100)
        ga4_text = (
            f"セッション *{ga4['sessions']:,}* ｜ ユーザー *{ga4['users']:,}* ｜ "
            f"PV *{ga4['pageviews']:,}* ｜ 滞在 {dur//60}分{dur%60}秒 ｜ 直帰率 {br}%"
        )
    blocks.append(_section(f"📊 *GA4（昨日）*\n{ga4_text}"))

    # note スキ
    if note["articles"]:
        lines = []
        for a in note["articles"]:
            lk = f"❤️ {a['likes']}" if a["likes"] is not None else "❤️ —"
            lines.append(f"• <{a['url']}|{a['label']}> {lk}")
        note_text = "\n".join(lines) + f"\n*合計スキ: {note['total_likes']}*"
    else:
        note_text = "_公開済み記事なし（今後は自動で追加されます）_"
    blocks.append(_section(f"📝 *note スキ数*\n{note_text}"))

    # X
    if x is None:
        x_text = "_未設定 — `TWITTER_BEARER_TOKEN` を GitHub Secrets に追加してください_"
        blocks.append(_section(f"🐦 *X 投稿状況*\n{x_text}"))
    elif "error" in x:
        x_text = f"❌ {x['error']}"
        blocks.append(_section(f"🐦 *X 投稿状況*\n{x_text}"))
    else:
        latest = f"\n最新: 「{x['latest_text']}」" if x.get("latest_text") else ""
        summary = f"直近{x['post_count']}件 ｜ ❤️ {x['total_likes']} ｜ 🔁 {x['total_rt']}{latest}"
        blocks.append(_section(f"🐦 *X 投稿状況*\n{summary}"))
        # Claude 傾向分析（取得できた場合のみ追加）
        if x.get("analysis"):
            blocks.append({"type": "divider"})
            blocks.append(_section(f"🤖 *X 投稿傾向分析（Claude）*\n{x['analysis']}"))

    # システム
    failed = github.get("failed", [])
    if not github.get("runs"):
        gh_text = "⚠️ 取得失敗（GITHUB_TOKEN 確認）"
    elif failed:
        names = "、".join(f["name"] for f in failed[:3])
        gh_text = f"❌ 失敗: {names}"
    else:
        gh_text = "✅ 正常"

    if netlify is None:
        net_text = "_未設定 — `NETLIFY_TOKEN` / `NETLIFY_SITE_ID` を追加してください_"
    elif "error" in netlify:
        net_text = f"❌ {netlify['error']}"
    elif netlify.get("state") == "ready":
        net_text = "✅ デプロイ正常"
    elif netlify.get("state") == "error":
        net_text = f"❌ 失敗: {netlify.get('error_message', '詳細不明')}"
    else:
        net_text = f"🔄 {netlify.get('state', '不明')}"

    blocks.append(_section(f"⚙️ *システム状態*\nGitHub Actions: {gh_text}\nNetlify: {net_text}"))

    # 自動修復ログ
    if autofix_log:
        items = "\n".join(f"• ✅ {x}" for x in autofix_log)
        blocks.append(_section(f"🔧 *自動修復済み*\n{items}"))

    # 手動対応が必要なもの
    all_manual = list(manual_actions)
    for err in note.get("errors", []):
        all_manual.append(f"note データエラー: {err}")
    if ga4 and "error" in ga4 and ga4["error"] != "google-analytics-data 未インストール":
        all_manual.append(f"GA4 エラー → GA4 設定を確認: {ga4['error']}")
    if x and "error" in x:
        all_manual.append(f"X API エラー → Twitter Developer Portal を確認: {x['error']}")
    if netlify and netlify.get("state") == "error":
        all_manual.append(
            f"Netlify デプロイ失敗 → https://app.netlify.com/ でログ確認\n"
            f"  エラー: `{netlify.get('error_message', '詳細不明')}`"
        )

    if all_manual:
        items = "\n".join(f"• 🚨 {x}" for x in all_manual)
        blocks.append(_section(f"*要対応（手動）*\n{items}"))

    blocks.append({
        "type": "context",
        "elements": [{"type": "mrkdwn", "text": f"生成: {datetime.now(JST).strftime('%Y-%m-%d %H:%M JST')}"}],
    })

    return {"blocks": blocks}


# ─── メイン ──────────────────────────────────────────────────────────────────

def main() -> int:
    print(f"Daily report start: {datetime.now(JST).isoformat()}")

    slack_url = os.environ.get("SLACK_WEBHOOK_URL")
    if not slack_url:
        print("ERROR: SLACK_WEBHOOK_URL が未設定です", file=sys.stderr)
        return 1

    autofix_log:    list[str] = []
    manual_actions: list[str] = []

    print("[1/5] note スキ数を取得中...")
    note = get_note_stats()
    print(f"  → {len(note['articles'])} 記事, 合計スキ {note['total_likes']}")

    print("[2/5] GA4 を取得中...")
    ga4 = get_ga4_stats()
    print(f"  → {'取得成功' if ga4 and 'error' not in ga4 else ga4}")

    print("[3/5] X 投稿を取得中...")
    x = get_x_stats()
    print(f"  → {x}")

    print("[4/5] GitHub Actions 状態を取得中...")
    github = get_github_status()
    print(f"  → {len(github['runs'])} runs, {len(github['failed'])} 失敗")

    print("[5/5] Netlify 状態を取得中...")
    netlify = get_netlify_status()
    print(f"  → {netlify}")

    # 自動修復: GitHub Actions 再実行
    if github.get("failed"):
        print(f"自動修復: {len(github['failed'])} 件の失敗を再実行...")
        rerun_names = rerun_failed_workflows(github["failed"])
        if rerun_names:
            autofix_log.append(f"GitHub Actions 再実行: {', '.join(rerun_names)}")
            print(f"  → 再実行: {rerun_names}")

    # 自動修復: jin 記事公開チェック
    print("自動修復: jin 記事公開チェック...")
    jin_fix = autofix_jin_publish()
    if jin_fix:
        autofix_log.append(jin_fix)
        print(f"  → {jin_fix}")

    # Slack 送信
    print("Slack にメッセージを送信中...")
    msg = build_slack_message(note, ga4, x, github, netlify, autofix_log, manual_actions)
    ok  = http_post_json(slack_url, msg)

    if ok:
        print("送信完了。")
        return 0
    else:
        print("Slack 送信失敗。", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
