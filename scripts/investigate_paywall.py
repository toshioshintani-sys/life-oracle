# -*- coding: utf-8 -*-
"""
investigate_paywall.py — note 有料記事の「有料ライン位置」を一括調査

各記事について:
  - 認証あり(owner)で GET → 本文全体 + separator(有料ライン UUID) を取得
  - 認証なし(anon)で GET → 一般読者が見える無料プレビュー範囲を取得
  - 無料プレビューの可読文字数（HTMLタグ除去後）を計測
  - 「無料プレビューが冒頭CTAだけ」=有料ラインが高すぎる記事をフラグ

使い方:
  python -X utf8 scripts/investigate_paywall.py            # jin全件
  python -X utf8 scripts/investigate_paywall.py --keys n77b4d1c95588 ...
"""
from __future__ import annotations
import argparse
import re
import sys
import time
from pathlib import Path
import requests

ROOT = Path(__file__).resolve().parents[1]

# jin_03〜58 の note_key（引き継ぎ書 handoff_circle_membership.md より）
JIN_NOTE_KEY_MAP = {
    3: "n77b4d1c95588", 4: "nf809a285a0d7", 5: "na1e95f66a032",
    6: "n3e57bb2020c2", 7: "nb888fd274ba7", 8: "n055318acad27",
    9: "n5a926ccc362a", 10: "nbd006f28b2e8", 11: "n6069cbabdb4b",
    12: "nbabfc7943fad", 13: "n2f6434bfb3c6", 14: "n55488c6f5829",
    15: "n072a64d81572", 16: "n3c517b39a83f", 17: "n00894216dd63",
    18: "n16f8580d0d42", 19: "n64f341a50b0b", 20: "nc127cb8b535f",
    21: "nc65bfc0b7b28", 22: "n3d8098040596", 23: "nc5b0d099ca6c",
    24: "n82d7348a4ace", 25: "nbe59c97d82a8", 26: "nea2ffa55bfb3",
    27: "n451e6248dfe7", 28: "n4b103114e16b", 29: "nd41595a5d47e",
    30: "nafdb856ea71a", 31: "nda83927e6614", 32: "n9d6cc12dbc6c",
    33: "n47faeefd960a", 34: "n57b9924565c8", 35: "n2d1c0a267293",
    36: "nbc490995ced7", 37: "n5a37014153ea", 38: "nd02a1dbf4cf3",
    39: "n19def23e102f", 40: "n789903f6aab5", 41: "n7276197916d2",
    42: "n551380d85ee6", 43: "nfaf2812db9a9", 44: "nfeaf785b8fe6",
    45: "n3a188bd56e71", 46: "n03f173de901c", 47: "n7a6831083add",
    48: "n907139ae8814", 49: "nf28d8c45de00", 50: "n088511787e5e",
    51: "nb54d19014e55", 52: "ne035e1d7f682", 53: "neee07aaa04cf",
    54: "n0502b16cfbbc", 55: "ndf2b0a76270c", 56: "n00026b630a7e",
    57: "n2b5a13d80cbe", 58: "n3ba05cf848f9",
}


def load_token() -> str:
    for envp in [ROOT.parent / ".env", ROOT / ".env"]:
        if envp.exists():
            for line in envp.read_text(encoding="utf-8").splitlines():
                if line.startswith("NOTE_SESSION_TOKEN"):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise RuntimeError("NOTE_SESSION_TOKEN が見つかりません")


def strip_tags(html: str) -> str:
    txt = re.sub(r"<[^>]+>", "", html or "")
    return re.sub(r"\s+", "", txt)  # 可読文字だけ数える


def make_sessions(token: str):
    auth = requests.Session()
    auth.cookies.set("_note_session_v5", token, domain="note.com")
    auth.headers.update({"User-Agent": "Mozilla/5.0", "X-Requested-With": "XMLHttpRequest",
                         "Referer": "https://note.com/"})
    anon = requests.Session()
    anon.headers.update({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                         "Referer": "https://note.com/lifeoraclejp",
                         "Accept": "application/json"})
    return auth, anon


def _get_data(sess, key, tries=4):
    """data が返るまでリトライ（anon のレート制限対策）"""
    last = None
    for i in range(tries):
        try:
            j = sess.get(f"https://note.com/api/v3/notes/{key}", timeout=30).json()
            if "data" in j and j["data"]:
                return j["data"], True
            last = j
        except Exception as e:
            last = {"err": str(e)}
        time.sleep(1.5 * (i + 1))  # バックオフ
    return {}, False


def investigate(auth, anon, key: str) -> dict:
    da, _ = _get_data(auth, key)
    time.sleep(0.5)
    dn, anon_ok = _get_data(anon, key)
    full_body = da.get("body", "") or ""
    free_body = dn.get("body", "") or ""
    return {
        "anon_ok": anon_ok,
        "name": da.get("name", ""),
        "price": da.get("price"),
        "status": da.get("status"),
        "full_chars": len(strip_tags(full_body)),
        "free_chars": len(strip_tags(free_body)),
        "free_html_len": len(free_body),
        "separator": da.get("separator"),
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--keys", nargs="*", help="調べる note_key を直接指定")
    ap.add_argument("--sleep", type=float, default=0.3)
    args = ap.parse_args()

    token = load_token()
    auth, anon = make_sessions(token)

    if args.keys:
        targets = [(None, k) for k in args.keys]
    else:
        targets = [(n, JIN_NOTE_KEY_MAP[n]) for n in sorted(JIN_NOTE_KEY_MAP)]

    print(f"調査対象: {len(targets)} 件")
    print(f"{'記事':<8} {'価格':>5} {'無料字':>6} {'全字':>6} {'無料率':>6}  判定  タイトル")
    print("-" * 100)

    flagged = []
    rows = []
    for jin_no, key in targets:
        try:
            r = investigate(auth, anon, key)
        except Exception as e:
            print(f"jin_{jin_no}: ERROR {e}")
            continue
        label = f"jin_{jin_no:02d}" if jin_no else key[:10]
        free, full = r["free_chars"], r["full_chars"]
        ratio = (free / full * 100) if full else 0
        if not r["anon_ok"]:
            verdict = "⚠取得失敗"
        elif free <= 150:
            verdict = "🔴高すぎ"
            flagged.append(label)
        elif ratio < 15:
            verdict = "🟡やや高"
        else:
            verdict = "🟢適正"
        print(f"{label:<8} {str(r['price']):>5} {free:>6} {full:>6} {ratio:>5.1f}%  {verdict}  {r['name'][:34]}")
        rows.append((label, r))
        time.sleep(args.sleep)

    print("-" * 100)
    print(f"🔴 有料ライン高すぎ（無料プレビュー≦150字）: {len(flagged)} 件")
    if flagged:
        print(f"   {flagged}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
