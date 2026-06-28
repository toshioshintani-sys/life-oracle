# -*- coding: utf-8 -*-
"""ライフオラクルnote → サブスクやめた クロス送客フッター（Python移植）。

仕様・文言の「単一の正」= サブスクやめた repo の参照実装：
  - docs/syndication/LIFEORACLE_NOTE_CROSS_PROMO.md（仕様・判断軸）
  - scripts/note/cross-promo-footer.mjs（実行可能な単一の正）
この Python は上記 .mjs を**一字一句**移植したもの。文言・UTM・テーマ判定A/B/Cを
変えるときは必ず .mjs / doc を先に直し、ここを同期させること（doc が正・ここが実装）。

結線：gachijin_orchestrator._build_note_payload() が記事 body_md の末尾へ
``append_cross_promo_footer()`` を足してから markdown_to_note_html() に通す。
位置は記事「最下段」（本文末尾・関連リンクの後）。冒頭広告は信頼を削るので不可
（CLAUDE.md §9 別ブランド・§2-2 煽らない・§1 社会性＞一回の送客）。
過去記事には遡及しない（オーケストレータは過去記事を再投稿しないため、今日以降の
新規投稿分にだけ自然に付く）。
"""
from __future__ import annotations

# UTM は サブスクやめた名義note転載（utm_source=note）とは別ソースにして GA4 で分離計測する。
CROSS_PROMO_URL = (
    "https://sabusuku-yameta.com/?utm_source=note-lifeoracle"
    "&utm_medium=referral&utm_campaign=cross-promo"
)

# テーマ別の一言（A=汎用 / B=お金・固定費・見直し系 / C=最小・無関係記事用）。
# 文言は LIFEORACLE_NOTE_CROSS_PROMO.md / cross-promo-footer.mjs と一字一句そろえる。
FOOTER_BODY = {
    "A": (
        '（おまけ）月額のサブスク、"なんとなく続けてる"ものはありませんか。'
        "解約・乗り換え・買い切り・お試しの「次の動き」を、煽らず・両論併記でまとめた"
        "別サイトを運営しています。合わなければ、いつでも解約導線に戻ってこれます。\n"
        f"→ [サブスクやめた]({CROSS_PROMO_URL})"
    ),
    "B": (
        "（おまけ）暮らしを軽くする話のついでに——固定費でいちばん削りやすいのが、"
        "使っていないサブスクです。解約手順・無料代替・乗り換え先を、ランキングや★スコアを"
        "使わずに淡々とまとめています。\n"
        f"→ [サブスクやめた]({CROSS_PROMO_URL})"
    ),
    "C": f"別運営：サブスクの解約・乗り換え・買い切りをまとめた [サブスクやめた]({CROSS_PROMO_URL})。",
}

# B（お金・固定費・見直し系）を選ぶためのテーマ語。
MONEY_THEME = ["お金", "固定費", "節約", "家計", "見直し", "手放す", "ミニマル", "貯金", "支出", "断捨離"]
# C（明確に無関係 = 控えめ版）を選ぶためのテーマ語。
UNRELATED_THEME = ["占い", "スピリチュアル", "タロット", "星座", "運勢", "前世", "ヒーリング"]


def pick_theme(article: dict | None = None) -> str:
    """記事の {title, tags} からテーマ('A'|'B'|'C')を判定する。

    tags は配列・カンマ区切り文字列どちらでも可。判定不能なら 'A'（汎用）。
    """
    article = article or {}
    tags = article.get("tags")
    if isinstance(tags, (list, tuple)):
        tags_str = " ".join(str(t) for t in tags)
    else:
        tags_str = str(tags or "")
    hay = f"{article.get('title') or ''} {tags_str}"
    if any(w in hay for w in UNRELATED_THEME):
        return "C"
    if any(w in hay for w in MONEY_THEME):
        return "B"
    return "A"


def cross_promo_footer_markdown(theme: str = "A") -> str:
    """最下段ブロックを markdown で返す（先頭に区切り <hr> 用の ``---``）。"""
    body = FOOTER_BODY.get(theme) or FOOTER_BODY["A"]
    return f"---\n\n{body}"


def append_cross_promo_footer(body_md: str, title: str = "", tags=None) -> str:
    """記事本文 markdown の末尾へクロス送客フッターを連結して返す。

    既存の markdown_to_note_html() に通すだけで <hr> + 段落 + アンカー化される。
    """
    theme = pick_theme({"title": title, "tags": tags})
    return f"{body_md}\n\n{cross_promo_footer_markdown(theme)}"


if __name__ == "__main__":
    # 直接実行 = 自己テスト（出力確認＋不変条件 assert）。
    #   python -X utf8 scripts/gachijin/cross_promo_footer.py
    cases = [
        {"title": "Netflixを解約した話", "tags": ["暮らし"]},
        {"title": "ボーナスで固定費の見直し", "tags": ["お金", "節約"]},
        {"title": "今月の運勢とタロット占い", "tags": ["占い"]},
        {"title": "引き際を誤りガチな人　その名は、サンクコスト・バイアス", "tags": "サンクコスト・バイアス"},
    ]
    for c in cases:
        t = pick_theme(c)
        print(f"\n==== theme={t}  «{c['title']}» ====")
        print(cross_promo_footer_markdown(t))

    def _assert(cond: bool, msg: str) -> None:
        if not cond:
            raise SystemExit(f"ASSERT FAIL: {msg}")

    _assert(pick_theme({"title": "家計の見直し"}) == "B", "money->B")
    _assert(pick_theme({"title": "占いの話"}) == "C", "unrelated->C")
    _assert(pick_theme({"title": "ふつうの日記"}) == "A", "default->A")
    _assert(pick_theme({"title": "サンクコスト・バイアス"}) == "A", "gachijin theme->A")
    _assert(cross_promo_footer_markdown("A").startswith("---"), "starts with hr")
    _assert(CROSS_PROMO_URL in cross_promo_footer_markdown("A"), "contains UTM url")
    _assert(CROSS_PROMO_URL in cross_promo_footer_markdown("B"), "B contains UTM url")
    _assert(CROSS_PROMO_URL in cross_promo_footer_markdown("C"), "C contains UTM url")
    print("\nOK: all asserts passed")
