"""
X（Twitter）アナリティクス取得スクリプト

使い方:
  python3 scripts/x_analytics.py

必要な環境変数:
  TWITTER_BEARER_TOKEN   — Bearer Token（公開メトリクス取得）
  TWITTER_USERNAME       — X ユーザー名（@なし, デフォルト: lifeoraclejp）

インプレッション数を取得するには追加で（OAuth 1.0a）:
  TWITTER_API_KEY
  TWITTER_API_SECRET
  TWITTER_ACCESS_TOKEN
  TWITTER_ACCESS_SECRET

取得方法:
  1. https://developer.twitter.com/ でアプリを作成
  2. 「Free」プランでも Bearer Token は取得可能
  3. インプレッション数は「Read & Write」権限のある OAuth 1.0a キーが必要
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

JST = timezone(timedelta(hours=9))

USERNAME = os.environ.get("TWITTER_USERNAME", "lifeoraclejp")
BEARER   = os.environ.get("TWITTER_BEARER_TOKEN", "")
API_KEY       = os.environ.get("TWITTER_API_KEY", "")
API_SECRET    = os.environ.get("TWITTER_API_SECRET", "")
ACCESS_TOKEN  = os.environ.get("TWITTER_ACCESS_TOKEN", "")
ACCESS_SECRET = os.environ.get("TWITTER_ACCESS_SECRET", "")

HAS_BEARER = bool(BEARER)
HAS_OAUTH  = all([API_KEY, API_SECRET, ACCESS_TOKEN, ACCESS_SECRET])


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


# ─── OAuth 1.0a signature ─────────────────────────────────────────────────────

def _oauth_header(method: str, url: str, params: dict) -> str:
    """RFC 5849 OAuth 1.0a 署名ヘッダーを生成"""
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
    header = "OAuth " + ", ".join(
        f'{urllib.parse.quote(k, safe="")}="{urllib.parse.quote(str(v), safe="")}"'
        for k, v in sorted(oauth.items())
    )
    return header


def oauth_get(url: str, params: dict | None = None) -> dict | None:
    params = params or {}
    full_url = url + ("?" + urllib.parse.urlencode(params) if params else "")
    auth_header = _oauth_header("GET", url, params)
    return http_get(full_url, {"Authorization": auth_header})


# ─── Bearer Token ─────────────────────────────────────────────────────────────

def bearer_get(url: str) -> dict | None:
    return http_get(url, {"Authorization": f"Bearer {BEARER}"})


# ─── Fetch tweets ─────────────────────────────────────────────────────────────

def get_user_id() -> str | None:
    data = bearer_get(
        f"https://api.twitter.com/2/users/by/username/{USERNAME}"
    )
    return data["data"]["id"] if data and "data" in data else None


def get_tweets_bearer(uid: str, count: int = 20) -> list[dict]:
    """公開メトリクス（いいね・RT・返信）を取得"""
    data = bearer_get(
        f"https://api.twitter.com/2/users/{uid}/tweets"
        f"?max_results={count}"
        f"&tweet.fields=created_at,public_metrics,text"
        f"&exclude=retweets,replies"
    )
    return data.get("data", []) if data else []


def get_tweet_impressions_oauth(tweet_id: str) -> int | None:
    """インプレッション数（non_public_metrics）を OAuth 1.0a で取得"""
    params = {
        "tweet.fields": "non_public_metrics,public_metrics",
    }
    data = oauth_get(
        f"https://api.twitter.com/2/tweets/{tweet_id}",
        params,
    )
    if not data or "data" not in data:
        return None
    npm = data["data"].get("non_public_metrics", {})
    return npm.get("impression_count")


# ─── Format ──────────────────────────────────────────────────────────────────

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


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
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
        print()
        print("または GitHub Secrets に TWITTER_BEARER_TOKEN を追加すると")
        print("Slack 日次レポートにも自動で含まれます。")
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

    # OAuthでインプレッション取得（設定があれば）
    impression_map: dict[str, int | None] = {}
    if HAS_OAUTH:
        print()
        print("📊 インプレッション数取得中（OAuth 1.0a）...")
        for t in tweets[:10]:  # 最新10件だけ（レート制限対策）
            imp = get_tweet_impressions_oauth(t["id"])
            impression_map[t["id"]] = imp
            time.sleep(0.5)
        print("   完了")
    else:
        print()
        print("ℹ️  インプレッション数: OAuth 1.0a キーが未設定（下記参照）")

    # ─── 集計 ─────────────────────────────────────────────────────────────────
    total_likes    = sum(t.get("public_metrics", {}).get("like_count", 0) for t in tweets)
    total_rt       = sum(t.get("public_metrics", {}).get("retweet_count", 0) for t in tweets)
    total_replies  = sum(t.get("public_metrics", {}).get("reply_count", 0) for t in tweets)
    total_imp      = sum(v for v in impression_map.values() if v is not None) if impression_map else None

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

    # ─── 個別ツイート ─────────────────────────────────────────────────────────
    print("─" * 62)
    print("  📝 個別ツイート")
    print("─" * 62)
    for i, t in enumerate(tweets, 1):
        pm = t.get("public_metrics", {})
        imp = impression_map.get(t["id"])
        created = jst_str(t.get("created_at", ""))
        text_preview = t["text"][:60].replace("\n", " ")
        print()
        print(f"  [{i:02d}] {created}")
        print(f"       {text_preview}...")
        print(f"       ❤️ {fmt_num(pm.get('like_count'))}  "
              f"🔁 {fmt_num(pm.get('retweet_count'))}  "
              f"💬 {fmt_num(pm.get('reply_count'))}  "
              + (f"👁️ {fmt_num(imp)}" if imp is not None else ""))
        print(f"       https://x.com/{USERNAME}/status/{t['id']}")

    # ─── インプレッション取得の設定方法 ──────────────────────────────────────
    if not HAS_OAUTH:
        print()
        print("─" * 62)
        print("  👁️ インプレッション数を取得するには")
        print("─" * 62)
        print()
        print("  1. https://developer.twitter.com/en/portal/dashboard")
        print("     でアプリの「Keys and tokens」を開く")
        print()
        print("  2. 以下の4つを環境変数に設定:")
        print("       export TWITTER_API_KEY='...'")
        print("       export TWITTER_API_SECRET='...'")
        print("       export TWITTER_ACCESS_TOKEN='...'      ← あなたのアカウント")
        print("       export TWITTER_ACCESS_SECRET='...'")
        print()
        print("  3. アプリの「User authentication settings」で")
        print("     「Read and write」以上の権限を設定")
        print()
        print("  注意: インプレッションは自分のツイートのみ取得可能（他者は不可）")
        print()
        print("  ※ X Analytics（analytics.twitter.com）でも確認可能:")
        print(f"    https://analytics.twitter.com/user/{USERNAME}/tweets")

    print()
    print("=" * 62)


if __name__ == "__main__":
    main()
