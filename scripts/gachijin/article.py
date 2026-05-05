# -*- coding: utf-8 -*-
"""Claude article generation for Gachijin series.

Calls Anthropic API to produce ``article_bundle.json`` (3 articles + thumbnail
design) from a single theme. Returns a deterministic dry-run mock when the
API key is missing or ``dry_run=True``.

The system prompt encodes the rules from
``ライフオラクルnoteネタ/ガチ人_Cowork指示書.md`` so the orchestrator does not need
to ship the whole Cowork document over the wire.
"""
from __future__ import annotations

import json
import logging
import os
import re
import uuid
from datetime import date, datetime, timedelta
from typing import Any

logger = logging.getLogger(__name__)

ANTHROPIC_MODEL = os.environ.get("GACHIJIN_CLAUDE_MODEL", "claude-opus-4-7")
ANTHROPIC_MAX_TOKENS = 12000

SYSTEM_PROMPT = """あなたはnote連載「ガチ人（ガチじん）」の記事生成担当です。

シリーズ概要:
- 行動経済学・心理学の効果・バイアス・理論に名前を与え、読者が「あの人だ→自分もだ」と気づくシリーズ
- 全文無料、有料ラインなし
- 1記事 2500〜3000字
- 文体: です・ます調、2〜3行ごとに改行、絵文字なし、太字は段落あたり1〜2箇所まで
- AI特有の記号は禁止: " " ＃ ｜ ーー（連続長音）、—、–、" "、' ' は使わない
- カーリー引用符の代わりに「」を使う

3日展開（武田鉄矢の朝の三枚おろし方式）:
- Day1: 正体解説メイン。タイトル形式: 「〇〇しガチな人　その名は、〇〇効果」
- Day2: 場面深掘りメイン。タイトル形式: 「〇〇しガチな人の現場　〇〇効果が生む場面」
- Day3: 実践メイン。タイトル形式: 「〇〇しガチな人の対処法　〇〇効果を逆手に取る」
- 「ガチな」の前は体言止め・連用形（「引き際を誤り」「先延ばしにし」など）
- ダッシュ「——」やハイフン、引用符は使わず、全角スペースで区切る

記事構成（5パート）:
1. 冒頭あるある描写 約300字
2. ## 1｜その名は、〇〇効果（正体解説 約800字）
3. ## 2｜〇〇効果が生む場面（身近な場面の描写 約900字）
4. ## 3｜今日からできること（実践ナッジ 約500字）
5. ## 4｜おわりに（締め＋次回予告 約200字）

末尾には必ず以下のCTAを入れること:

自分がどんな効果やバイアスに影響されやすいか、
もっと体系的に知りたい方へ。

ユング心理学×行動経済学のアプローチで、
あなたの思考の癖と行動パターンを可視化できる
無料診断があります。

👉 ライフオラクル無料診断はこちら
https://life-oracle.jp/

サムネ設計（thumbnail_design）の必須要素:
- action_type: 「停滞系」「衝動系」「誤認系」のいずれか
- scene_type: 「アンカー」または「可変」
- scene_policy: 「固定」または「変化」
- reason: 1行で
- thumbnail_color: 「gold_black」「white_black」「black_white」のいずれか
- days.day1〜day3:
  - moment: 切り取り瞬間（カフェでノートPCの前で手が止まっている、など）
  - main_text: スマホで0.5秒で読める短い1行（10文字前後）
  - sub_text: 短い補助テキスト（効果名の短縮形など、6文字程度）

出力は必ずJSONのみ。前置き・説明・Markdown装飾は不要。
スキーマ:
{
  "theme_id": "lower-case-ascii-hyphen",
  "theme_name": "<入力テーマ>",
  "series": "gachijin",
  "post_dates": {"day1":"YYYY-MM-DD","day2":"YYYY-MM-DD","day3":"YYYY-MM-DD"},
  "articles": {
    "day1": {"title":"...","body_md":"..."},
    "day2": {"title":"...","body_md":"..."},
    "day3": {"title":"...","body_md":"..."}
  },
  "thumbnail_design": {
    "action_type":"...","scene_type":"...","scene_policy":"...",
    "reason":"...","thumbnail_color":"gold_black",
    "days": {
      "day1":{"moment":"...","main_text":"...","sub_text":"..."},
      "day2":{"moment":"...","main_text":"...","sub_text":"..."},
      "day3":{"moment":"...","main_text":"...","sub_text":"..."}
    }
  }
}
"""

THEME_BEHAVIORS = {
    "サンクコスト": "引き際を誤り",
    "損失回避": "損を怖がり",
    "現在バイアス": "今だけ考え",
    "アンカリング": "最初の数字に縛られ",
    "フレーミング": "言い方に乗せられ",
    "保有効果": "モノを溜め込み",
    "双曲割引": "先延ばしにし",
    "バンドワゴン": "流行に乗り",
    "確証バイアス": "見たいものしか見",
    "現状維持": "変えたがらな",
    "ハロー効果": "見た目で全部決め",
    "カリギュラ": "禁止されると逆にやり",
    "ピグマリオン": "期待で伸び",
    "ゴーレム": "期待されないとしぼみ",
    "ザイアンス": "会うほど好きになり",
    "ツァイガルニク": "途中が気になり",
    "傍観者": "誰かがやると思い",
    "同調圧力": "本音を隠し",
    "権威": "肩書きで信じ",
    "正常性": "まあ大丈夫と思い",
    "後知恵": "そうなると思ってたと言い",
}


def _normalize_theme_id(theme: str) -> str:
    ascii_hint = re.sub(r"[^a-z0-9]+", "-", theme.lower()).strip("-")
    if ascii_hint:
        return ascii_hint
    return "theme-" + uuid.uuid5(uuid.NAMESPACE_DNS, theme).hex[:10]


def _behavior_for_theme(theme: str) -> str:
    for key, behavior in THEME_BEHAVIORS.items():
        if key in theme:
            return behavior
    clean = re.sub(r"[・\s]*(効果|バイアス|理論)$", "", theme)
    return f"{clean}に影響され"


def _short_theme(theme: str) -> str:
    return re.sub(r"[・\s]*(効果|バイアス|理論)$", "", theme).replace("・バイアス", "")


def _post_dates(start_date: str) -> dict[str, str]:
    start = datetime.strptime(start_date, "%Y-%m-%d").date()
    return {f"day{i + 1}": (start + timedelta(days=i)).isoformat() for i in range(3)}


def _build_dry_run_body(theme: str, day_no: int, behavior: str) -> str:
    phase = ["気づき", "共感", "前進"][day_no - 1]
    return f"""通勤の電車でスマホを開いた瞬間、ふと自分の昨日の判断を思い出します。

{behavior}ガチな人の行動には、必ず名前があります。
名前がつくと、責める話ではなく、構造として見られるようになります。

## 1｜その名は、{theme}

{theme}は、人の意思決定をひそかに歪める心理メカニズムの一つです。
ここでは難しい言葉を避け、職場や日常の身近な場面に置き換えてみます。

頭では分かっていても、いざ自分のこととなると気づけない。
その不思議さこそが、{theme}の正体です。

## 2｜{theme}が生む場面

職場の会議室、家族との食卓、通勤電車、SNSのタイムライン。
場面はそれぞれ違っても、同じ判断のクセが顔を出します。

Day{day_no}は「{phase}」の役割として、具体的な場面を中心に描写します。
登場人物は架空のあの人。でも、読みながらどこかで自分が重なります。

## 3｜今日からできること

いきなり性格を変えようとしないでください。
判断する前に、ひと呼吸だけ「これ、本当に今決めるべきこと？」と問いを置きます。

それだけで、いつもの自動反応から少し距離が取れます。

## 4｜おわりに

明日のDay{day_no + 1 if day_no < 3 else 1}は、{theme}の{('現場' if day_no == 1 else ('対処法' if day_no == 2 else '次のテーマ'))}を扱います。

自分がどんな効果やバイアスに影響されやすいか、
もっと体系的に知りたい方へ。

ユング心理学×行動経済学のアプローチで、
あなたの思考の癖と行動パターンを可視化できる
無料診断があります。

👉 ライフオラクル無料診断はこちら
https://life-oracle.jp/
"""


def build_dry_run_bundle(theme: str, start_date: str) -> dict[str, Any]:
    """Deterministic article_bundle.json for dry-run / fallback."""
    behavior = _behavior_for_theme(theme)
    short = _short_theme(theme)
    return {
        "theme_id": _normalize_theme_id(theme),
        "theme_name": theme,
        "series": "gachijin",
        "post_dates": _post_dates(start_date),
        "articles": {
            "day1": {
                "title": f"{behavior}ガチな人　その名は、{theme}",
                "body_md": _build_dry_run_body(theme, 1, behavior),
            },
            "day2": {
                "title": f"{behavior}ガチな人の現場　{theme}が生む場面",
                "body_md": _build_dry_run_body(theme, 2, behavior),
            },
            "day3": {
                "title": f"{behavior}ガチな人の対処法　{theme}を逆手に取る",
                "body_md": _build_dry_run_body(theme, 3, behavior),
            },
        },
        "thumbnail_design": {
            "action_type": "停滞系",
            "scene_type": "アンカー",
            "scene_policy": "固定",
            "reason": "同一場面で3日間の意味変化を伝えるため",
            "thumbnail_color": "gold_black",
            "days": {
                "day1": {
                    "moment": "朝のカフェでノートPCの前に座り、手が止まっている",
                    "main_text": f"{behavior}人",
                    "sub_text": short,
                },
                "day2": {
                    "moment": "明るい会議室で資料を前に、誰も切り出せず黙っている",
                    "main_text": "現場で起きること",
                    "sub_text": short,
                },
                "day3": {
                    "moment": "自宅デスクでPCを閉じ、メモ帳に問いを書き始めている",
                    "main_text": "今日から変える",
                    "sub_text": short,
                },
            },
        },
    }


def _strip_ai_symbols(text: str) -> str:
    """Apply CLAUDE.md section 13 forbidden-symbols cleanup."""
    replacements = {
        "“": "「",
        "”": "」",
        "＃": "",
        "｜": "、",
    }
    for src, dst in replacements.items():
        text = text.replace(src, dst)
    text = re.sub(r"ー{4,}", "", text)
    text = re.sub(r"-{6,}", "", text)
    return text


def _validate_bundle(bundle: dict[str, Any]) -> None:
    required_top = {"theme_id", "theme_name", "series", "post_dates", "articles", "thumbnail_design"}
    missing = required_top - set(bundle)
    if missing:
        raise ValueError(f"article_bundle missing keys: {sorted(missing)}")
    for day in ("day1", "day2", "day3"):
        article = bundle["articles"].get(day)
        if not article or not article.get("title") or not article.get("body_md"):
            raise ValueError(f"article {day} is incomplete")
        design = bundle["thumbnail_design"]["days"].get(day)
        if not design or not design.get("moment"):
            raise ValueError(f"thumbnail_design {day} missing moment")


def _extract_json_block(text: str) -> str:
    """Strip Markdown fences if Claude wraps the JSON."""
    text = text.strip()
    fenced = re.match(r"^```(?:json)?\s*(.*?)\s*```$", text, re.DOTALL)
    if fenced:
        return fenced.group(1)
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        return text[start : end + 1]
    return text


def call_claude(theme: str, start_date: str, post_time: str) -> dict[str, Any]:
    """Call Anthropic API to produce article_bundle.json."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY is not set")

    try:
        import anthropic  # type: ignore
    except ImportError as exc:
        raise RuntimeError("anthropic package is not installed") from exc

    client = anthropic.Anthropic(api_key=api_key)
    user_msg = (
        f"テーマ: {theme}\n"
        f"開始日: {start_date}\n"
        f"投稿時刻: {post_time}\n"
        "上記テーマで3日分のガチ人記事（無料）と、サムネ設計をJSONで出力してください。"
    )
    logger.info("Anthropic API call: model=%s theme=%s", ANTHROPIC_MODEL, theme)
    response = client.messages.create(
        model=ANTHROPIC_MODEL,
        max_tokens=ANTHROPIC_MAX_TOKENS,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_msg}],
    )
    raw_text = "".join(
        block.text for block in response.content if getattr(block, "type", None) == "text"
    )
    payload = json.loads(_extract_json_block(raw_text))
    payload.setdefault("series", "gachijin")
    payload.setdefault("theme_name", theme)
    payload.setdefault("theme_id", _normalize_theme_id(theme))
    payload["post_dates"] = _post_dates(start_date)
    for day in ("day1", "day2", "day3"):
        article = payload["articles"].get(day, {})
        if "body_md" in article:
            article["body_md"] = _strip_ai_symbols(article["body_md"])
        payload["articles"][day] = article
    _validate_bundle(payload)
    return payload


def generate_article_bundle(
    theme: str,
    start_date: str,
    post_time: str,
    dry_run: bool,
) -> tuple[dict[str, Any], str]:
    """Return ``(bundle, source)`` where source is ``"claude"`` or ``"dry_run"``."""
    if dry_run or not os.environ.get("ANTHROPIC_API_KEY"):
        logger.info("Using deterministic dry-run article bundle (theme=%s)", theme)
        return build_dry_run_bundle(theme, start_date), "dry_run"
    try:
        bundle = call_claude(theme, start_date, post_time)
        return bundle, "claude"
    except Exception:
        logger.exception("Claude article generation failed; falling back to dry-run bundle")
        return build_dry_run_bundle(theme, start_date), "dry_run_fallback"
