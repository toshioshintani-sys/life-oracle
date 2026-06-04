"""
X（Twitter）アナリティクス + Claude 傾向分析スクリプト

使い方:
  python3 scripts/x_analytics.py              # 数値のみ表示
  python3 scripts/x_analytics.py --analyze    # Claude で傾向分析も実行

必要な環境変数:
  TWITTER_BEARER_TOKEN   — Bearer Token（公開メトリクス取得）
  TWITTER_USERNAME       — X ユーザー名（@なし, デフォルト: lifeoraclejp）
  ANTHROPIC_API_KEY      — Claude 傾向分析に必要（--analyze 時）

インプレッション数を取得するには追加で（OAuth 1.0a）:
  TWITTER_API_KEY / TWITTER_API_SECRET / TWITTER_ACCESS_TOKEN / TWITTER_ACCESS_SECRET

分析指示書: tasks/x_analysis_prompt.md
"""

from __future__ import annotations
import hashlib
import hmac
import json
import os
import sys
import time
import urllib.parse
import urllib.request
import urllib.error
import base64
import secrets
from datetime import datetime, timezone, timedelta
from pathlib import Path

JST      = timezone(timedelta(hours=9))
REPO_ROOT = Path(__file__).resolve().parent.parent

USERNAME      = os.environ.get("TWITTER_USERNAME", "lifeoraclejp")
BEARER        = os.environ.get("TWITTER_BEARER_TOKEN", "")
API_KEY       = os.environ.get("TWITTER_API_KEY", "")
API_SECRET    = os.environ.get("TWITTER_API_SECRET", "")
ACCESS_TOKEN  = os.environ.get("TWITTER_ACCESS_TOKEN", "")
ACCESS_SECRET = os.environ.get("TWITTER_ACCESS_SECRET", "")
ANTHROPIC_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

HAS_BEARER = bool(BEARER)
HAS_OAUTH  = all([API_KEY, API_SECRET, ACCESS_TOKEN, ACCESS_SECRET])
HAS_CLAUDE = bool(ANTHROPIC_KEY)


# ─── HTTP ─────────────────────────────────────────────────────────────────────

def http_get(url: str, headers: dict | None = None) -> dict | None:
    req = urllib.request.Request(url, headers=headers or {})
    req.add_header("User-Agent", "life-oracle-analytics/1.0")
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")
        print(f"  HTTP {e.code}: {body[:200]}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"  ERROR: {e}", file=sys.stderr)
        return None


def http_post(url: str, payload: dict, headers: dict) -> dict | None:
    data = json.dumps(payload).encode()
    req = urllib.request.Request(url, data=data, method="POST", headers=headers)
    req.add_header("Content-Type", "application/json")
    req.add_header("User-Agent", "life-oracle-analytics/1.0")
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")
        print(f"  Claude API HTTP {e.code}: {body[:300]}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"  Claude API ERROR: {e}", file=sys.stderr)
        return None


# ─── OAuth 1.0a signature ─────────────────────────────────────────────────────

def _oauth_header(method: str, url: str, params: dict) -> str:
    oauth = {
        "oauth_consumer_key":     API_KEY,
        "oauth_nonce":            secrets.token_hex(16),
        "oauth_signature_method": "HMAC-SHA1",
        "oauth_timestamp":        str(int(time.time())),
        "oauth_token":            ACCESS_TOKEN,
        "oauth_version":          "1.0",
    }
    all_params = {**params, **oauth}
    param_str = "&".join(
        f"{urllib.parse.quote(k, safe='')}"
        f"={urllib.parse.quote(str(v), safe='')}"
        for k, v in sorted(all_params.items())
    )
    base = (
        method.upper() + "&"
        + urllib.parse.quote(url, safe="") + "&"
        + urllib.parse.quote(param_str, safe="")
    )
    signing_key = (
        urllib.parse.quote(API_SECRET, safe="") + "&"
        + urllib.parse.quote(ACCESS_SECRET, safe="")
    )
    sig = base64.b64encode(
        hmac.new(signing_key.encode(), base.encode(), hashlib.sha1).digest()
    ).decode()
    oauth["oauth_signature"] = sig
    return "OAuth " + ", ".join(
        f'{urllib.parse.quote(k, safe="")}="{urllib.parse.quote(str(v), safe="")}"'
        for k, v in sorted(oauth.items())
    )


def oauth_get(url: str, params: dict | None = None) -> dict | None:
    params = params or {}
    full_url = url + ("?" + urllib.parse.urlencode(params) if params else "")
    return http_get(full_url, {"Authorization": _oauth_header("GET", url, params)})


# ─── Bearer Token ─────────────────────────────────────────────────────────────

def bearer_get(url: str) -> dict | None:
    return http_get(url, {"Authorization": f"Bearer {BEARER}"})


# ─── Fetch tweets ─────────────────────────────────────────────────────────────

def get_user_id() -> str | None:
    data = bearer_get(f"https://api.twitter.com/2/users/by/username/{USERNAME}")
    return data["data"]["id"] if data and "data" in data else None


def get_tweets_bearer(uid: str, count: int = 20) -> list[dict]:
    data = bearer_get(
        f"https://api.twitter.com/2/users/{uid}/tweets"
        f"?max_results={count}"
        f"&tweet.fields=created_at,public_metrics,text"
        f"&exclude=retweets,replies"
    )
    return data.get("data", []) if data else []


def get_tweet_impressions_oauth(tweet_id: str) -> int | None:
    data = oauth_get(
        f"https://api.twitter.com/2/tweets/{tweet_id}",
        {"tweet.fields": "non_public_metrics,public_metrics"},
    )
    if not data or "data" not in data:
        return None
    return data["data"].get("non_public_metrics", {}).get("impression_count")


# ─── Claude API 分析 ──────────────────────────────────────────────────────────

CLAUDE_SYSTEM_PROMPT = """あなたはライフオラクル（@lifeoraclejp）のコンテンツ戦略アナリストです。
提供されたXの投稿データを分析し、以下の形式で日本語の短いレポートを返してください。

【アカウント概要】
- ライフオラクルはMBTI・ユング認知機能・行動経済学バイアスを使った心理診断アプリ
- note連携：「対人攻略」シリーズ（上司/同僚/家族/恋人 112タイプ）を週1本公開中
- ターゲット：職場や人間関係に悩む20〜40代

【分析してほしいこと】

1. **トピック傾向**（3行以内）
   - 今週どんなテーマで発信しているか
   - MBTI/バイアス/note紹介/日常 など大まかな分類と割合

2. **エンゲージメント傾向**（3行以内）
   - いいね・RT が多い投稿の共通点
   - 反応が薄い投稿の共通点
   - 「バズりやすいパターン」があれば一言で

3. **今週の注目ツイート**（1件）
   - 最もエンゲージメントが高かった投稿テキストと数値
   - なぜ刺さったか一言コメント

4. **来週への示唆**（箇条書き2〜3点）
   - 「こういうツイートをもっと増やすと良い」
   - 「このトピックは今旬」
   - note記事との連携でやると良いこと など

【出力形式のルール】
- Slackに貼り付けるので絵文字を使い読みやすくする
- 全体で300字以内に収める（箇条書き・短文を優先）
- 「投稿がありません」「データ不足」の場合は「今週は投稿なし or データ取得不可」と一言だけ返す
- 占い・予言のような表現は避け、データに基づいた観察と提案にする"""


def build_tweet_payload(tweets: list[dict], impression_map: dict) -> dict:
    now = datetime.now(JST)
    week_ago = now - timedelta(days=7)
    tweet_list = []
    for t in tweets:
        created_raw = t.get("created_at", "")
        try:
            dt = datetime.fromisoformat(created_raw.replace("Z", "+00:00"))
        except Exception:
            dt = now
        pm = t.get("public_metrics", {})
        imp = impression_map.get(t["id"])
        tweet_list.append({
            "id":         t["id"],
            "created_at": dt.astimezone(JST).strftime("%m/%d %H:%M"),
            "text":       t.get("text", ""),
            "metrics": {
                "like_count":        pm.get("like_count", 0),
                "retweet_count":     pm.get("retweet_count", 0),
                "reply_count":       pm.get("reply_count", 0),
                "impression_count":  imp,
            },
        })
    return {
        "period":        f"{week_ago.strftime('%Y-%m-%d')} 〜 {now.strftime('%Y-%m-%d')}",
        "total_tweets":  len(tweets),
        "tweets":        tweet_list,
    }


def analyze_with_claude(payload: dict) -> str | None:
    """Claude API を呼び出してX投稿の傾向分析テキストを返す"""
    if not HAS_CLAUDE:
        return None
    body = {
        "model":      "claude-haiku-4-5-20251001",
        "max_tokens": 600,
        "system":     CLAUDE_SYSTEM_PROMPT,
        "messages":   [
            {
                "role":    "user",
                "content": f"以下のX投稿データを分析してください：\n\n{json.dumps(payload, ensure_ascii=False, indent=2)}",
            }
        ],
    }
    headers = {
        "x-api-key":         ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
    }
    resp = http_post("https://api.anthropic.com/v1/messages", body, headers)
    if not resp:
        return None
    try:
        return resp["content"][0]["text"].strip()
    except (KeyError, IndexError, TypeError):
        return None


# ─── Public API（daily_report.py から呼ぶ） ───────────────────────────────────

def get_x_analysis() -> dict:
    """
    Xデータ取得 + Claude 分析を行い結果 dict を返す。
    daily_report.py の Slack メッセージ構築に使う。
    返却キー:
      post_count, total_likes, total_rt, total_replies,
      latest_text, latest_at, analysis (str | None), error (str | None)
    """
    if not HAS_BEARER:
        return {"error": "TWITTER_BEARER_TOKEN 未設定"}

    uid = get_user_id()
    if not uid:
        return {"error": "X ユーザーID取得失敗"}

    tweets = get_tweets_bearer(uid, count=20)
    if not tweets:
        return {"post_count": 0, "total_likes": 0, "total_rt": 0,
                "total_replies": 0, "latest_text": None, "latest_at": None,
                "analysis": None}

    impression_map: dict[str, int | None] = {}
    if HAS_OAUTH:
        for t in tweets[:10]:
            impression_map[t["id"]] = get_tweet_impressions_oauth(t["id"])
            time.sleep(0.3)

    payload  = build_tweet_payload(tweets, impression_map)
    analysis = analyze_with_claude(payload) if HAS_CLAUDE else None

    pm_all = [t.get("public_metrics", {}) for t in tweets]
    return {
        "post_count":   len(tweets),
        "total_likes":  sum(p.get("like_count", 0) for p in pm_all),
        "total_rt":     sum(p.get("retweet_count", 0) for p in pm_all),
        "total_replies":sum(p.get("reply_count", 0) for p in pm_all),
        "latest_text":  tweets[0]["text"][:90] if tweets else None,
        "latest_at":    tweets[0].get("created_at") if tweets else None,
        "analysis":     analysis,
    }


# ─── Format helpers ──────────────────────────────────────────────────────────

def jst_str(iso: str) -> str:
    try:
        dt = datetime.fromisoformat(iso.replace("Z", "+00:00")).astimezone(JST)
        return dt.strftime("%m/%d %H:%M")
    except Exception:
        return iso[:16]


def fmt_num(n: int | None) -> str:
    if n is None:
        return "—"
    return f"{n:,}"


# ─── CLI main ─────────────────────────────────────────────────────────────────

def main():
    do_analyze = "--analyze" in sys.argv or HAS_CLAUDE

    print("=" * 62)
    print(f"  @{USERNAME} X アナリティクス   {datetime.now(JST).strftime('%Y-%m-%d %H:%M JST')}")
    print("=" * 62)

    if not HAS_BEARER:
        print()
        print("❌ TWITTER_BEARER_TOKEN が設定されていません。")
        print()
        print("設定方法:")
        print("  1. https://developer.twitter.com/ でアプリを作成")
        print("  2. 「Keys and tokens」→「Bearer Token」をコピー")
        print("  3. 環境変数に設定:")
        print("       export TWITTER_BEARER_TOKEN='your_token_here'")
        print("       python3 scripts/x_analytics.py")
        sys.exit(0)

    print()
    print("🔍 ユーザーID取得中...")
    uid = get_user_id()
    if not uid:
        print(f"❌ @{USERNAME} のユーザーID取得失敗。Bearer Token を確認してください。")
        sys.exit(1)

    print(f"   User ID: {uid}")
    print()
    print("📥 最新20件のツイートを取得中...")
    tweets = get_tweets_bearer(uid, count=20)
    if not tweets:
        print("   ツイートが見つかりません。")
        sys.exit(0)
    print(f"   {len(tweets)} 件取得")

    impression_map: dict[str, int | None] = {}
    if HAS_OAUTH:
        print()
        print("📊 インプレッション数取得中（OAuth 1.0a）...")
        for t in tweets[:10]:
            impression_map[t["id"]] = get_tweet_impressions_oauth(t["id"])
            time.sleep(0.5)
        print("   完了")
    else:
        print()
        print("ℹ️  インプレッション数: OAuth 1.0a キー未設定（analytics.twitter.com で確認可）")

    # ─── 集計 ──────────────────────────────────────────────────────────────
    total_likes   = sum(t.get("public_metrics", {}).get("like_count", 0) for t in tweets)
    total_rt      = sum(t.get("public_metrics", {}).get("retweet_count", 0) for t in tweets)
    total_replies = sum(t.get("public_metrics", {}).get("reply_count", 0) for t in tweets)
    total_imp     = sum(v for v in impression_map.values() if v is not None) if impression_map else None

    print()
    print("─" * 62)
    print("  📊 集計（直近20件）")
    print("─" * 62)
    print(f"  ❤️  いいね合計   : {fmt_num(total_likes)}")
    print(f"  🔁  RT 合計      : {fmt_num(total_rt)}")
    print(f"  💬  返信合計     : {fmt_num(total_replies)}")
    if total_imp is not None:
        print(f"  👁️  インプレッション合計: {fmt_num(total_imp)}（最新10件）")
    print()

    # ─── 個別ツイート ──────────────────────────────────────────────────────
    print("─" * 62)
    print("  📝 個別ツイート")
    print("─" * 62)
    for i, t in enumerate(tweets, 1):
        pm  = t.get("public_metrics", {})
        imp = impression_map.get(t["id"])
        print()
        print(f"  [{i:02d}] {jst_str(t.get('created_at', ''))}")
        print(f"       {t['text'][:60].replace(chr(10),' ')}...")
        print(f"       ❤️ {fmt_num(pm.get('like_count'))}  "
              f"🔁 {fmt_num(pm.get('retweet_count'))}  "
              f"💬 {fmt_num(pm.get('reply_count'))}"
              + (f"  👁️ {fmt_num(imp)}" if imp is not None else ""))
        print(f"       https://x.com/{USERNAME}/status/{t['id']}")

    # ─── Claude 傾向分析 ────────────────────────────────────────────────────
    if do_analyze:
        if not HAS_CLAUDE:
            print()
            print("─" * 62)
            print("  🤖 Claude 傾向分析（ANTHROPIC_API_KEY が必要）")
            print("─" * 62)
            print()
            print("  export ANTHROPIC_API_KEY='sk-ant-...'")
            print("  python3 scripts/x_analytics.py --analyze")
        else:
            print()
            print("─" * 62)
            print("  🤖 Claude 傾向分析中...")
            print("─" * 62)
            payload  = build_tweet_payload(tweets, impression_map)
            analysis = analyze_with_claude(payload)
            print()
            if analysis:
                print(analysis)
            else:
                print("  分析取得失敗（API キーまたは接続を確認）")
    elif not HAS_OAUTH:
        print()
        print("  ヒント: ANTHROPIC_API_KEY を設定して --analyze を付けると")
        print("          Claude が投稿傾向を分析します。")

    print()
    print("=" * 62)


if __name__ == "__main__":
    main()
