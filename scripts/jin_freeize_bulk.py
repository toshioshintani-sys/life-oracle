# -*- coding: utf-8 -*-
"""jin_freeize_bulk.py — jin_03〜58（56本）を price=0 にし、
有料導線（メンバーシップCTA・途中課金ティーザー）を本文から除去する。

引き継ぎ書: tasks/handoff_jin_free.md
俊雄さん決定: 2026-09-23（メンバー0人・単品売上0円・9/21判定未達で価格凍結期限切れ）
安全設計: scripts/add_cross_promo_gachi_reserved.py の実証済みPUTパターンを踏襲
  （全フィールド保全PUT・backup jsonl・PUT後GET検証・publish_at null化検知+再PUT・冪等）

本文除去ブロック（全56本を機械分類して検証済み・var/jin/bodies_before_free/ にスナップショット済）:
  Group A (jin_03-16, 14本): 末尾の <hr> + 「このシリーズでは、職場にいる…」
    + 「対人攻略シリーズ・メンバーシップはこちら」の2段落を除去
  Group B (jin_17-58, 42本): ①本文中盤の 🔓「続きで扱うこと」<figure>ブロック
    ②末尾の <h2>メンバーシップで読み放題にする場合</h2> + 3段落 を除去

使い方:
  python -X utf8 scripts/jin_freeize_bulk.py --check      # 対象と現状価格を一覧
  python -X utf8 scripts/jin_freeize_bulk.py --only 4      # jin_04だけ本番実行
  python -X utf8 scripts/jin_freeize_bulk.py --apply       # 全件本番実行
"""
from __future__ import annotations
import argparse, json, re, sys, time
from pathlib import Path
import requests

ROOT = Path(__file__).resolve().parents[1]
LOG_DIR = ROOT / "var" / "jin" / "freeize_logs"

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

H = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest",
    "Accept": "application/json, text/plain, */*",
    "Referer": "https://note.com/notes/new",
    "Origin": "https://note.com",
    "Content-Type": "application/json",
}


def load_token() -> str:
    for envp in [ROOT.parent / ".env", ROOT / ".env"]:
        if envp.exists():
            for line in envp.read_text(encoding="utf-8").splitlines():
                if line.startswith("NOTE_SESSION_TOKEN"):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise RuntimeError("NOTE_SESSION_TOKEN なし")


def get_note(s, key: str) -> dict:
    r = s.get(f"https://note.com/api/v3/notes/{key}", headers=H, timeout=20)
    r.raise_for_status()
    return r.json()["data"]


def put_note(s, note_id, body: dict) -> requests.Response:
    return s.put(f"https://note.com/api/v1/text_notes/{note_id}", headers=H, json=body, timeout=30)


def strip_group_a(body: str) -> tuple[str, bool]:
    """jin_03-16: 末尾の hr+メンバーシップ2段落を除去"""
    i = body.find("このシリーズでは、職場にいる")
    if i < 0:
        return body, False
    hr_start = body.rfind("<hr", 0, i)
    if hr_start < 0:
        return body, False
    return body[:hr_start], True


def strip_group_b(body: str) -> tuple[str, bool]:
    """jin_17-58: ①🔓ティーザーfigure ②末尾h2セクション を除去"""
    lock_i = body.find("🔓")
    if lock_i < 0:
        return body, False
    fig_s = body.rfind("<figure", 0, lock_i)
    fig_e = body.find("</figure>", lock_i)
    if fig_s < 0 or fig_e < 0:
        return body, False
    fig_e += len("</figure>")
    body2 = body[:fig_s] + body[fig_e:]

    h2_i = body2.find("メンバーシップで読み放題にする場合")
    if h2_i < 0:
        return body2, False
    h_s = body2.rfind("<h2", 0, h2_i)
    hr_after = body2.find("<hr", h_s)
    if h_s < 0 or hr_after < 0:
        return body2, False
    body3 = body2[:h_s] + body2[hr_after:]
    return body3, True


def strip_paid_funnel(jin_no: int, body: str) -> tuple[str, bool]:
    if 3 <= jin_no <= 16:
        return strip_group_a(body)
    return strip_group_b(body)


def hashtags_of(note: dict) -> list[str]:
    return [h["hashtag"]["name"] for h in note.get("hashtag_notes", []) if h.get("hashtag", {}).get("name")]


def eye_catch_key_of(note: dict) -> int | None:
    m = re.search(r"/images/(\d+)/", note.get("eyecatch") or "")
    return int(m.group(1)) if m else None


def build_put_body(note: dict, new_body: str) -> dict:
    status = note.get("status", "published")
    put_body = {
        "author_ids": [],
        "body_length": len(new_body),
        "disable_comment": note.get("disable_comment", False),
        "free_body": new_body,
        "hashtags": [f"#{t}" if not t.startswith("#") else t for t in hashtags_of(note)],
        "image_keys": [],
        "name": note["name"],
        "price": 0,
        "send_notifications_flag": False,
        "separator": None,
        "status": status,
    }
    eck = eye_catch_key_of(note)
    if eck:
        put_body["eye_catch_key"] = eck
    if status == "reserved":
        pa = note.get("reserved_publish_at") or note.get("publish_at")
        if pa:
            put_body["publish_at"] = pa
    return put_body


def cmd_check():
    token = load_token()
    s = requests.Session()
    s.cookies.set("_note_session_v5", token, domain="note.com")
    for n in sorted(JIN_NOTE_KEY_MAP):
        note = get_note(s, JIN_NOTE_KEY_MAP[n])
        grp = "A" if 3 <= n <= 16 else "B"
        _, would_strip = strip_paid_funnel(n, note.get("body") or "")
        print(f"jin_{n:02d}({grp}): price={note['price']:>4} status={note['status']:<9} "
              f"除去対象ブロック検出={would_strip}")
        time.sleep(0.1)


def cmd_apply(only: list[int] | None):
    token = load_token()
    s = requests.Session()
    s.cookies.set("_note_session_v5", token, domain="note.com")

    LOG_DIR.mkdir(parents=True, exist_ok=True)
    ts = int(time.time())
    backup_path = LOG_DIR / f"backup_{ts}.jsonl"
    result_path = LOG_DIR / f"result_{ts}.json"

    targets = sorted(JIN_NOTE_KEY_MAP)
    if only:
        targets = [n for n in targets if n in set(only)]

    print(f"対象: {len(targets)} 本")
    counts = {"applied": 0, "skip_already_free": 0, "fail": 0}
    successes, failures = [], []

    for i, n in enumerate(targets, 1):
        key = JIN_NOTE_KEY_MAP[n]
        try:
            note = get_note(s, key)
        except Exception as e:
            print(f"[{i}/{len(targets)}] jin_{n:02d}  ❌ GET失敗: {e}")
            counts["fail"] += 1
            failures.append({"jin_no": n, "key": key, "reason": "GET", "msg": str(e)})
            continue

        nid = note["id"]
        cur_price = note.get("price", 0) or 0
        body = note.get("body") or ""

        if cur_price == 0 and "🔓" not in body and "このシリーズでは、職場にいる" not in body:
            print(f"[{i}/{len(targets)}] jin_{n:02d}  ⏭  SKIP 既に無料化済み(price=0・導線なし)")
            counts["skip_already_free"] += 1
            continue

        new_body, changed = strip_paid_funnel(n, body)
        if not changed:
            print(f"[{i}/{len(targets)}] jin_{n:02d}  ⚠ 除去対象ブロックが見つからない → 本文は変更せずprice=0のみ")

        put_body = build_put_body(note, new_body)
        assert put_body["price"] == 0
        assert put_body["name"] == note["name"]

        # バックアップ（PUT前の全状態を退避）
        with backup_path.open("a", encoding="utf-8") as bf:
            bf.write(json.dumps({
                "jin_no": n, "key": key, "id": nid, "name": note["name"],
                "orig_body": body, "orig_price": cur_price,
                "orig_separator": note.get("separator"), "orig_status": note.get("status"),
                "orig_publish_at": note.get("reserved_publish_at") or note.get("publish_at"),
                "orig_eyecatch_key": eye_catch_key_of(note), "orig_hashtags": hashtags_of(note),
                "new_body": new_body, "ts": ts,
            }, ensure_ascii=False) + "\n")

        r = put_note(s, nid, put_body)
        if r.status_code not in (200, 201):
            print(f"[{i}/{len(targets)}] jin_{n:02d}  ❌ PUT {r.status_code}: {r.text[:200]}")
            counts["fail"] += 1
            failures.append({"jin_no": n, "key": key, "reason": f"PUT_{r.status_code}", "msg": r.text[:200]})
            time.sleep(0.6)
            continue

        time.sleep(1.2)
        chk = get_note(s, key)
        chk_price = chk.get("price", 0) or 0
        chk_body_len = len(chk.get("body") or "")
        chk_pa = chk.get("reserved_publish_at") or chk.get("publish_at")
        orig_pa = put_body.get("publish_at")

        # publish_at null化バグ対策（gachi実績パターン踏襲）
        if put_body.get("status") == "reserved" and orig_pa and not chk_pa:
            print("        ⚠ publish_at null化 → 再復元 re-PUT")
            put_note(s, nid, {**put_body, "publish_at": orig_pa})
            time.sleep(0.8)
            chk = get_note(s, key)
            chk_price = chk.get("price", 0) or 0
            chk_body_len = len(chk.get("body") or "")
            chk_pa = chk.get("reserved_publish_at") or chk.get("publish_at")

        ok = (chk_price == 0) and (chk_body_len == len(new_body))
        if put_body.get("status") == "reserved":
            ok = ok and bool(chk_pa)

        if ok:
            print(f"[{i}/{len(targets)}] jin_{n:02d}  ✅ price {cur_price}→0  本文 {len(body)}→{chk_body_len}字"
                  f"{f'  publish_at={chk_pa}' if chk_pa else ''}")
            counts["applied"] += 1
            successes.append({"jin_no": n, "key": key, "orig_price": cur_price,
                              "body_before": len(body), "body_after": chk_body_len})
        else:
            print(f"[{i}/{len(targets)}] jin_{n:02d}  ⚠ PUT200だが検証失敗 "
                  f"(price={chk_price} body_len={chk_body_len}/{len(new_body)} pa={chk_pa})")
            counts["fail"] += 1
            failures.append({"jin_no": n, "key": key, "reason": "VERIFY",
                             "price": chk_price, "body_len": chk_body_len, "expected_len": len(new_body)})
        time.sleep(0.6)

    print("\n=== 集計 ===")
    for k, v in counts.items():
        print(f"  {k}: {v}")
    result_path.write_text(json.dumps({"successes": successes, "failures": failures, "counts": counts},
                                       ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"  backup: {backup_path}")
    print(f"  result: {result_path}")
    if failures:
        print(f"  失敗一覧: {[f['jin_no'] for f in failures]}")
    return 0 if counts["fail"] == 0 else 2


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--only", type=int, nargs="*")
    ap.add_argument("--apply", action="store_true")
    a = ap.parse_args()
    if a.check:
        cmd_check()
        return 0
    return cmd_apply(a.only)


if __name__ == "__main__":
    sys.exit(main())
