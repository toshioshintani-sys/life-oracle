# -*- coding: utf-8 -*-
"""
set_jin_payline.py — jin_ 記事の有料ラインを「原稿の <!-- more --> 位置」に直す

各記事の原稿 MD（articles/posted/jin/articles/）の <!-- more --> 直後の見出しを
有料ラインの位置（=その見出しの直前から有料）にする。

仕組み（recon で確定）:
  editor /edit/ → 公開に進む → 有料エリア設定 画面に
  「ラインをこの場所に変更」ボタンが各ブロック境界に出る。
  目的の見出し(H2/H3)の直前のボタンをクリック → 予約投稿 で保存。

使い方:
  python -X utf8 scripts/set_jin_payline.py --only 3          # jin_03 だけ
  python -X utf8 scripts/set_jin_payline.py --check           # 各記事の目標見出しを表示
  python -X utf8 scripts/set_jin_payline.py                   # 全件
"""
from __future__ import annotations
import argparse
import re
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NOTE_DIR = ROOT.parent / "ライフオラクルnoteネタ" / "articles" / "posted" / "jin" / "articles"

# jin_no -> note_key
JIN_NOTE_KEY_MAP = {
    3: "n77b4d1c95588", 4: "nf809a285a0d7", 5: "na1e95f66a032", 6: "n3e57bb2020c2",
    7: "nb888fd274ba7", 8: "n055318acad27", 9: "n5a926ccc362a", 10: "nbd006f28b2e8",
    11: "n6069cbabdb4b", 12: "nbabfc7943fad", 13: "n2f6434bfb3c6", 14: "n55488c6f5829",
    15: "n072a64d81572", 16: "n3c517b39a83f", 17: "n00894216dd63", 18: "n16f8580d0d42",
    19: "n64f341a50b0b", 20: "nc127cb8b535f", 21: "nc65bfc0b7b28", 22: "n3d8098040596",
    23: "nc5b0d099ca6c", 24: "n82d7348a4ace", 25: "nbe59c97d82a8", 26: "nea2ffa55bfb3",
    27: "n451e6248dfe7", 28: "n4b103114e16b", 29: "nd41595a5d47e", 30: "nafdb856ea71a",
    31: "nda83927e6614", 32: "n9d6cc12dbc6c", 33: "n47faeefd960a", 34: "n57b9924565c8",
    35: "n2d1c0a267293", 36: "nbc490995ced7", 37: "n5a37014153ea", 38: "nd02a1dbf4cf3",
    39: "n19def23e102f", 40: "n789903f6aab5", 41: "n7276197916d2", 42: "n551380d85ee6",
    43: "nfaf2812db9a9", 44: "nfeaf785b8fe6", 45: "n3a188bd56e71", 46: "n03f173de901c",
    47: "n7a6831083add", 48: "n907139ae8814", 49: "nf28d8c45de00", 50: "n088511787e5e",
    51: "nb54d19014e55", 52: "ne035e1d7f682", 53: "neee07aaa04cf", 54: "n0502b16cfbbc",
    55: "ndf2b0a76270c", 56: "n00026b630a7e", 57: "n2b5a13d80cbe", 58: "n3ba05cf848f9",
}


def load_token() -> str:
    for envp in [ROOT.parent / ".env", ROOT / ".env"]:
        if envp.exists():
            for line in envp.read_text(encoding="utf-8").splitlines():
                if line.startswith("NOTE_SESSION_TOKEN"):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise RuntimeError("NOTE_SESSION_TOKEN なし")


def find_md(jin_no: int) -> Path | None:
    cands = list(NOTE_DIR.glob(f"jin_{jin_no:02d}_*.md"))
    return cands[0] if cands else None


def target_heading(jin_no: int) -> str | None:
    """原稿の <!-- more --> 直後の最初の見出し(## or ###)テキストを返す"""
    md = find_md(jin_no)
    if not md:
        return None
    txt = md.read_text(encoding="utf-8")
    i = txt.find("<!-- more -->")
    if i < 0:
        i = txt.find("<!--more-->")
    if i < 0:
        return None
    after = txt[i:]
    m = re.search(r"^#{2,3}\s+(.+)$", after, re.MULTILINE)
    if not m:
        return None
    h = m.group(1).strip()
    # 番号プレフィックス（"2｜" 等）や記号を除いた素のテキスト
    return h


def heading_match_key(h: str) -> str:
    """見出しから照合用キー（記号・番号を除いた識別文字列）"""
    h = re.sub(r"^[0-9０-９]+[｜|\.\s　]*", "", h)  # 先頭番号
    h = re.sub(r"[\s　]+", "", h)
    return h[:12]


def get_session(token):
    import requests
    s = requests.Session()
    s.cookies.set("_note_session_v5", token, domain="note.com")
    s.headers.update({"User-Agent": "Mozilla/5.0", "X-Requested-With": "XMLHttpRequest",
                      "Referer": "https://note.com/"})
    return s


def measure_payline(page, key: str):
    """エディタ /edit/ を開き、.ProseMirror 内の <paywall-line> 位置から
    無料部分の可読字数と、ライン直後の見出しを測る。"""
    page.goto(f"https://editor.note.com/notes/{key}/edit/", wait_until="domcontentloaded", timeout=60000)
    try:
        page.wait_for_load_state("networkidle", timeout=30000)
    except Exception:
        pass
    time.sleep(6)
    pm = page.locator(".ProseMirror").first.inner_html()
    pi = pm.find("paywall")
    if pi < 0:
        return {"has": False, "free": None, "next_head": None}
    before = re.sub(r"\s+", "", re.sub(r"<[^>]+>", "", pm[:pi]))
    # ライン直後の最初の見出し
    after = pm[pi:]
    mh = re.search(r"<h[23][^>]*>(.*?)</h", after)
    nh = re.sub(r"<[^>]+>", "", mh.group(1)) if mh else ""
    return {"has": True, "free": len(before), "next_head": nh[:30]}


def set_one(page, jin_no: int, key: str, target: str) -> tuple[bool, str]:
    page.goto(f"https://editor.note.com/notes/{key}/edit/", wait_until="domcontentloaded", timeout=60000)
    try:
        page.wait_for_load_state("networkidle", timeout=30000)
    except Exception:
        pass
    time.sleep(7)
    try:
        page.locator("button", has_text="公開に進む").first.click(timeout=15000)
    except Exception as e:
        return False, f"公開に進む fail: {e}"
    time.sleep(4)
    try:
        page.locator("button", has_text="有料エリア設定").first.click(timeout=10000)
    except Exception as e:
        return False, f"有料エリア設定 fail: {e}"
    time.sleep(3)

    mkey = heading_match_key(target)
    # 目的見出しH2/H3を探し、その直前の「ラインをこの場所に変更」ボタンをクリック
    clicked = page.evaluate("""(mkey) => {
        const norm = s => (s||'').replace(/\\s|　/g,'');
        // 目的見出し要素を探す
        const heads = Array.from(document.querySelectorAll('h2,h3'));
        let target = null;
        for (const h of heads) {
            if (norm(h.innerText).includes(mkey)) { target = h; break; }
        }
        if (!target) return {ok:false, reason:'heading not found'};
        const ty = target.getBoundingClientRect().top;
        // 目的見出しより上にある「ラインをこの場所に変更」ボタンのうち最もyが大きい(=直前)もの
        const btns = Array.from(document.querySelectorAll('*')).filter(
            el => el.children.length===0 && el.innerText && el.innerText.trim()==='ラインをこの場所に変更');
        let best=null, bestY=-1;
        for (const b of btns) {
            const by = b.getBoundingClientRect().top;
            if (by < ty && by > bestY) { bestY = by; best = b; }
        }
        if (!best) return {ok:false, reason:'move button not found before heading', ty};
        best.scrollIntoView({block:'center'});
        best.click();
        return {ok:true, by:Math.round(bestY), ty:Math.round(ty)};
    }""", mkey)
    if not clicked.get("ok"):
        return False, f"ライン位置設定 fail: {clicked.get('reason')}"
    time.sleep(2)

    # 保存: published は「更新する」、reserved は「予約投稿」
    saved = False
    for label in ("予約投稿", "更新する"):
        loc = page.locator("button", has_text=label)
        if loc.count():
            try:
                loc.first.click(timeout=10000)
                saved = True
                break
            except Exception:
                continue
    if not saved:
        return False, "保存ボタン(予約投稿/更新する)が見つからない"
    time.sleep(6)
    return True, f"ライン設定(btn_y={clicked.get('by')}, head_y={clicked.get('ty')})"


def cmd_check():
    for n in sorted(JIN_NOTE_KEY_MAP):
        h = target_heading(n)
        print(f"jin_{n:02d}: 目標見出し = {h!r}  -> key={heading_match_key(h) if h else None!r}")


def cmd_apply(only, headed, sleep_sec):
    from playwright.sync_api import sync_playwright
    token = load_token()
    sess = get_session(token)

    targets = sorted(JIN_NOTE_KEY_MAP)
    if only:
        targets = [n for n in targets if n in set(only)]

    # 目標見出しが取れない記事は事前に弾く
    plan = []
    for n in targets:
        h = target_heading(n)
        if not h:
            print(f"⚠ jin_{n:02d}: <!-- more --> または見出しが原稿に無い → スキップ")
            continue
        plan.append((n, JIN_NOTE_KEY_MAP[n], h))
    print(f"対象: {len(plan)} 件")

    ok = fail = 0
    fails = []
    with sync_playwright() as p:
        b = p.chromium.launch(headless=not headed)
        ctx = b.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                            viewport={"width": 1400, "height": 1000})
        ctx.add_cookies([{"name": "_note_session_v5", "value": token, "domain": ".note.com",
                          "path": "/", "secure": True, "httpOnly": True, "sameSite": "Lax"}])
        page = ctx.new_page()
        page.on("console", lambda m: None)
        for i, (n, key, h) in enumerate(plan, 1):
            print(f"[{i}/{len(plan)}] jin_{n:02d} 目標='{h[:24]}'...", flush=True)
            try:
                done, msg = set_one(page, n, key, h)
            except Exception as e:
                done, msg = False, f"例外: {e}"
            if done:
                time.sleep(1.5)
                v = measure_payline(page, key)
                mkey = heading_match_key(h)
                # 成功条件: paywall-line があり、無料>300字、ライン直後が目標見出し
                head_ok = v["next_head"] and mkey[:8] in v["next_head"].replace(" ", "")
                if v["has"] and (v["free"] or 0) > 300 and head_ok:
                    print(f"  ✓ jin_{n:02d}: 無料{v['free']}字 / 直後='{v['next_head']}'", flush=True)
                    ok += 1
                else:
                    print(f"  ✗ jin_{n:02d}: line={v['has']} 無料={v['free']} 直後='{v['next_head']}' (期待先頭='{mkey[:8]}')", flush=True)
                    fail += 1; fails.append(n)
            else:
                print(f"  ✗ jin_{n:02d}: {msg}", flush=True)
                fail += 1; fails.append(n)
            if sleep_sec:
                time.sleep(sleep_sec)
        b.close()
    print("-" * 60)
    print(f"成功: {ok}  失敗: {fail}")
    if fails:
        print(f"失敗: {fails}")
    return 0 if fail == 0 else 2


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--only", type=int, nargs="*")
    ap.add_argument("--headed", action="store_true")
    ap.add_argument("--sleep", type=float, default=1.5)
    a = ap.parse_args()
    if a.check:
        cmd_check(); return 0
    return cmd_apply(a.only, a.headed, a.sleep)


if __name__ == "__main__":
    sys.exit(main())
