# -*- coding: utf-8 -*-
"""
ライフオラクル X（Twitter）投稿スクリプト

note記事のURLを必ずツイートに含めて投稿する。
使い方:
  python -X utf8 scripts/x_poster.py --note-url https://note.com/lifeoraclejp/n/nXXXXXX --title "記事タイトル"
  python -X utf8 scripts/x_poster.py --note-url ... --title "..." --image path/to/thumbnail.png

必要な環境変数:
  TWITTER_API_KEY
  TWITTER_API_SECRET
  TWITTER_ACCESS_TOKEN
  TWITTER_ACCESS_SECRET
  ANTHROPIC_API_KEY  (ツイート文生成に使用)

【重要】note URL は必ずツイート末尾に付与する（これがバグ原因だった箇所）。
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import hmac
import json
import os
import secrets
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

API_KEY       = os.environ.get("TWITTER_API_KEY", "")
API_SECRET    = os.environ.get("TWITTER_API_SECRET", "")
ACCESS_TOKEN  = os.environ.get("TWITTER_ACCESS_TOKEN", "")
ACCESS_SECRET = os.environ.get("TWITTER_ACCESS_SECRET", "")
ANTHROPIC_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

MAX_TWEET_LEN = 280
# note URL は 23文字分にカウント（Twitter の URL 短縮後）
NOTE_URL_TWEET_LEN = 23

TWEET_PROMPT = """あなたはライフオラクル（@lifeoraclejp）のSNS担当です。
以下の note 記事を X（Twitter）で告知するツイート本文を1件だけ生成してください。

【ルール】
- 本文は **{text_budget}文字以内**（改行含む）で書く
- 末尾に note URL を貼るため、本文には URL を含めない
- ハッシュタグは末尾に最大3個（例: #MBTI #行動経済学 #ライフオラクル）
- 感嘆符・煽り表現・「絶対」などの過剰表現は使わない
- 職場の人間関係・心理学に興味がある20〜40代に刺さる書き方
- 記事の中心テーマ（心理バイアス or 認知機能 or 対人タイプ）を1文で示す
- 本文のみ返す（前置き・説明・引用符は不要）

記事タイトル: {title}
記事の説明: {description}
"""


# ── OAuth 1.0a ────────────────────────────────────────────────────────────────

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
        f"{urllib.parse.quote(str(k), safe='')}"
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


def _http_post(url: str, data: bytes | None, headers: dict, content_type: str = "application/json") -> dict:
    req = urllib.request.Request(url, data=data, method="POST", headers={
        **headers,
        "Content-Type": content_type,
        "User-Agent": "life-oracle-x-poster/1.0",
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8")
            return json.loads(body) if body else {}
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {exc.code}: {detail[:400]}") from exc


# ── Claude でツイート文生成 ───────────────────────────────────────────────────

def generate_tweet_body(title: str, description: str, note_url: str) -> str:
    """Claude でツイート本文（URL 除く）を生成する。失敗時はデフォルト文を返す。"""
    # URL 短縮後 23文字 + 改行 1文字を引いた残りが本文予算
    text_budget = MAX_TWEET_LEN - NOTE_URL_TWEET_LEN - 1

    if not ANTHROPIC_KEY:
        # Claude 未設定時はシンプルなデフォルト文
        return f"📖 {title}\n\n#ライフオラクル #MBTI #行動経済学"

    prompt = TWEET_PROMPT.format(
        text_budget=text_budget,
        title=title,
        description=description or "（説明なし）",
    )
    body = json.dumps({
        "model":      "claude-haiku-4-5-20251001",
        "max_tokens": 300,
        "messages":   [{"role": "user", "content": prompt}],
    }).encode("utf-8")
    headers = {
        "x-api-key":         ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
    }
    try:
        resp = _http_post("https://api.anthropic.com/v1/messages", body, headers)
        text = resp["content"][0]["text"].strip()
        # 生成テキストが予算超過していても URL は後付けで必ず入る
        return text
    except Exception as exc:
        print(f"  WARN: Claude 呼び出し失敗 ({exc})。デフォルト文を使用。", file=sys.stderr)
        return f"📖 {title}\n\n#ライフオラクル #MBTI #行動経済学"


def build_tweet_text(body: str, note_url: str) -> str:
    """ツイート本文 + note URL を結合し 280文字に収める。

    note URL は Twitter で自動短縮されて 23文字になる。
    本文が長すぎる場合は切り詰めてから URL を付与する。
    """
    separator = "\n"
    # URL 付与後の合計文字数を計算
    # （Twitter では URL は 23文字扱い）
    url_part = separator + note_url
    url_tweet_chars = NOTE_URL_TWEET_LEN + len(separator)
    available = MAX_TWEET_LEN - url_tweet_chars

    if len(body) > available:
        body = body[:available - 1] + "…"

    return body + url_part


# ── 画像アップロード（v1.1 media/upload） ────────────────────────────────────

def upload_media(image_path: Path) -> str:
    """画像を Twitter Media Upload API にアップロードして media_id を返す。"""
    image_bytes = image_path.read_bytes()
    b64 = base64.b64encode(image_bytes).decode("ascii")

    upload_url = "https://upload.twitter.com/1.1/media/upload.json"
    params = {}
    auth = _oauth_header("POST", upload_url, params)
    data = urllib.parse.urlencode({"media_data": b64}).encode("ascii")
    resp = _http_post(
        upload_url, data, {"Authorization": auth},
        content_type="application/x-www-form-urlencoded",
    )
    media_id = resp.get("media_id_string")
    if not media_id:
        raise RuntimeError(f"media_id が取得できませんでした: {resp}")
    print(f"  画像アップロード完了: media_id={media_id}")
    return media_id


# ── ツイート投稿（v2 /tweets） ────────────────────────────────────────────────

def post_tweet(text: str, media_id: str | None = None) -> dict:
    """X API v2 でツイートを投稿する。"""
    tweet_url = "https://api.twitter.com/2/tweets"
    payload: dict = {"text": text}
    if media_id:
        payload["media"] = {"media_ids": [media_id]}

    body = json.dumps(payload).encode("utf-8")
    auth = _oauth_header("POST", tweet_url, {})
    resp = _http_post(tweet_url, body, {"Authorization": auth})
    tweet_id = resp.get("data", {}).get("id")
    if not tweet_id:
        raise RuntimeError(f"tweet_id が取得できませんでした: {resp}")
    return {"tweet_id": tweet_id, "text": text}


# ── メイン ────────────────────────────────────────────────────────────────────

def _validate_env() -> list[str]:
    missing = []
    for var in ("TWITTER_API_KEY", "TWITTER_API_SECRET", "TWITTER_ACCESS_TOKEN", "TWITTER_ACCESS_SECRET"):
        if not os.environ.get(var):
            missing.append(var)
    return missing


def main() -> int:
    parser = argparse.ArgumentParser(
        description="ライフオラクル note 記事を X に投稿する（note URL を必ず含める）"
    )
    parser.add_argument("--note-url",    required=True,  help="note 記事の URL（例: https://note.com/lifeoraclejp/n/nXXX）")
    parser.add_argument("--title",       required=True,  help="記事タイトル（ツイート文生成に使用）")
    parser.add_argument("--description", default="",     help="記事の説明（任意・ツイート文生成に使用）")
    parser.add_argument("--image",       default=None,   help="サムネイル画像のパス（PNG 推奨）")
    parser.add_argument("--dry-run",     action="store_true", help="投稿せず内容だけ表示する")
    args = parser.parse_args()

    print("=" * 60)
    print("  ライフオラクル X 投稿スクリプト")
    print("=" * 60)

    # 環境変数チェック
    if not args.dry_run:
        missing = _validate_env()
        if missing:
            print(f"ERROR: 以下の環境変数が未設定です: {', '.join(missing)}", file=sys.stderr)
            return 1

    # ツイート本文生成
    print("\n[1/3] ツイート本文を生成中...")
    body = generate_tweet_body(args.title, args.description, args.note_url)
    print(f"  生成された本文:\n{body}")

    # note URL を付与（これがバグ修正の核心）
    tweet_text = build_tweet_text(body, args.note_url)
    print(f"\n[2/3] 最終ツイート（{len(tweet_text)}文字 ※URL は Twitter で短縮）:")
    print("-" * 40)
    print(tweet_text)
    print("-" * 40)

    if args.dry_run:
        print("\n✅ --dry-run モード: 投稿はスキップしました。")
        return 0

    # 画像アップロード
    media_id: str | None = None
    if args.image:
        image_path = Path(args.image)
        if not image_path.exists():
            print(f"ERROR: 画像ファイルが見つかりません: {image_path}", file=sys.stderr)
            return 1
        print(f"\n[2b] 画像をアップロード中: {image_path}")
        media_id = upload_media(image_path)

    # ツイート投稿
    print("\n[3/3] X に投稿中...")
    result = post_tweet(tweet_text, media_id)
    tweet_id = result["tweet_id"]
    tweet_url = f"https://x.com/lifeoraclejp/status/{tweet_id}"
    print(f"  ✅ 投稿完了: {tweet_url}")
    print(f"  note URL:   {args.note_url}")
    print("=" * 60)
    return 0


if __name__ == "__main__":
    sys.exit(main())
