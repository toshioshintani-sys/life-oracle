#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""add_cross_promo_gachi_reserved.py — 予約済みのガチ人note記事の本文末尾へ
クロス送客フッター（→サブスクやめた）を後追い付与する（段階導入・冪等・可逆）。

背景：2026-07-14 に判明した事実（[[memory: project_cross_promo_note_footer]]）——
cross_promo_footer.py（commit bf04832）は正しく実装・結線されているが、
全45テーマの note 予約はそれより前（pipeline_run_date 2026-05-06〜06-19）に
作成済みのため、本文には一度もフッターが出力されていない。本スクリプトは
pipeline/add_cross_promo_reserved.py（post_/yoru_で実証済み・2026-07-14に
89本+50本を無事故適用）と同一の安全設計を、ガチ人の記事所在
（ローカル key_map ではなく Supabase の jobs/job_outputs）に適用したもの。

候補の集め方がpost_/yoru_と違うだけで、GET確認・安全ガード・PUT・検証・
backupの一連の処理は unpay_yoru.py 系譜の型を忠実に踏襲する。

安全装置（すべて実装・pipeline/add_cross_promo_reserved.py と同一）：
  - 予約限定：note.com 側の status!=reserved（既公開）は SKIP
  - 冪等：body に 'note-lifeoracle' を含む or 既にstate登録済みは SKIP
  - 本文を再変換しない：GETしたbodyをそのまま土台に末尾追記のみ
  - 予約保全：publish_at を再送（publishedへ送ると422になるため reserved のみ）
  - 通知抑止：send_notifications_flag=False を全PUTで固定
  - 検証GET：PUT後に body含有・publish_at保持・status維持を確認。null化したら再復元
  - 元body完全退避：PUT前に元の全フィールドを backup jsonl に保存（撤回用）
  - 段階導入：--limit N / --only KEY でロット制御。各PUT後 time.sleep

使い方：
  python -X utf8 scripts/add_cross_promo_gachi_reserved.py                # DRY-RUN
  python -X utf8 scripts/add_cross_promo_gachi_reserved.py --limit 5      # 先頭5本だけdry-run
  python -X utf8 scripts/add_cross_promo_gachi_reserved.py --apply        # 本番PUT（全件）
"""
from __future__ import annotations
import os, sys, json, time, argparse, re
import urllib.request
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

# .env 読み込み（HOWTO_note_posting_pipeline.md §6 の注意点を踏襲：
# 空文字での setdefault 事故を避けるため「未設定 or 空」なら上書き）
for line in (ROOT / ".env").read_text(encoding="utf-8").splitlines():
    line = line.strip()
    if not line or line.startswith("#") or "=" not in line:
        continue
    k, v = line.split("=", 1)
    if not os.environ.get(k.strip()):
        os.environ[k.strip()] = v.strip()

from gachijin.cross_promo_footer import cross_promo_footer_markdown, pick_theme, CROSS_PROMO_URL  # noqa: E402
from gachijin.markdown import markdown_to_note_html  # noqa: E402

TOKEN = os.environ["NOTE_SESSION_TOKEN"]
NOTE_API_BASE = "https://note.com"

H = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest",
    "Accept": "application/json, text/plain, */*",
    "Referer": "https://note.com/notes/new",
    "Origin": "https://note.com",
    "Content-Type": "application/json",
}
COOKIES = {"_note_session_v5": TOKEN}

SENTINEL = "note-lifeoracle"  # 冪等判定：これがbodyに在れば付与済み
LOG_DIR = ROOT / "var" / "gachijin" / "xpromo_logs"


def _supabase_get(path: str) -> list | dict:
    url = f"{os.environ['SUPABASE_URL'].rstrip('/')}/rest/v1/{path}"
    key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    req = urllib.request.Request(url, method="GET")
    req.add_header("apikey", key)
    req.add_header("Authorization", f"Bearer {key}")
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())


def _note_key_from_url(url: str) -> str | None:
    m = re.search(r"/n/([a-zA-Z0-9]+)", url or "")
    return m.group(1) if m else None


def get_note(key: str) -> dict:
    r = requests.get(f"{NOTE_API_BASE}/api/v3/notes/{key}", headers=H, cookies=COOKIES, timeout=20)
    r.raise_for_status()
    return r.json()["data"]


def put_note(note_id, body: dict) -> requests.Response:
    return requests.put(
        f"{NOTE_API_BASE}/api/v1/text_notes/{note_id}",
        headers=H, cookies=COOKIES, json=body, timeout=30,
    )


def hashtags_of(note: dict) -> list[str]:
    return [h["hashtag"]["name"] for h in note.get("hashtag_notes", []) if h.get("hashtag", {}).get("name")]


def eye_catch_key_of(note: dict) -> int | None:
    m = re.search(r"/images/(\d+)/", note.get("eyecatch") or "")
    return int(m.group(1)) if m else None


def build_footer_html(title: str, hashtags: list[str]) -> tuple[str, str]:
    theme = pick_theme({"title": title, "tags": hashtags})
    footer_md = cross_promo_footer_markdown(theme)
    footer_html = markdown_to_note_html(footer_md)
    return footer_html, theme


def build_put_body(note: dict, new_body: str) -> dict:
    """元noteの全保全フィールド＋差し替えたbodyでPUTボディを構築（PUTは全フィールド必須・
    HOWTO_note_posting_pipeline.md §4-2 ③ / §7 の罠を踏襲）。"""
    status = "reserved" if (note.get("is_reserved") or note.get("status") == "reserved") else note.get("status", "published")
    put_body = {
        "author_ids": [],
        "body_length": len(new_body),
        "disable_comment": note.get("disable_comment", False),
        "free_body": new_body,
        "hashtags": [f"#{t}" if not t.startswith("#") else t for t in hashtags_of(note)],
        "image_keys": [],
        "name": note["name"],
        "price": note.get("price", 0) or 0,
        "send_notifications_flag": False,
        "separator": note.get("separator") if note.get("separator") else None,
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


def load_state(path: Path) -> dict:
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return {}


def collect_candidates() -> list[tuple[str, str]]:
    """Supabase jobs(series=gachijin) -> job_outputs.note_url から (label, key) を収集。"""
    jobs = _supabase_get("jobs?series=eq.gachijin&select=id,theme,start_date&order=start_date.asc")
    job_ids = ",".join(j["id"] for j in jobs)
    if not job_ids:
        return []
    outputs = _supabase_get(f"job_outputs?job_id=in.({job_ids})&select=id,job_id,day_no,note_url,status")
    theme_by_job = {j["id"]: j["theme"] for j in jobs}
    start_by_job = {j["id"]: j["start_date"] for j in jobs}

    candidates = []
    for o in outputs:
        note_url = o.get("note_url")
        if not note_url:
            continue
        key = _note_key_from_url(note_url)
        if not key:
            continue
        theme = theme_by_job.get(o["job_id"], "?")
        start = start_by_job.get(o["job_id"], "?")
        label = f"gachi_{theme}_day{o['day_no']}_(start={start})"
        candidates.append((label, key))
    return candidates


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="本当にPUTする（既定はDRY-RUN）")
    ap.add_argument("--limit", type=int, default=0, help="先頭N本だけ処理（0=全件）")
    ap.add_argument("--only", help="特定keyだけ処理")
    args = ap.parse_args()

    LOG_DIR.mkdir(parents=True, exist_ok=True)
    state_path = LOG_DIR / "xpromo_state_gachi.json"
    state = load_state(state_path)
    ts = int(time.time())
    backup_path = LOG_DIR / f"xpromo_backup_gachi_{ts}.jsonl"

    candidates = collect_candidates()
    if args.only:
        candidates = [(l, k) for (l, k) in candidates if k == args.only]
    if args.limit:
        candidates = candidates[: args.limit]

    mode = "APPLY (本番PUT)" if args.apply else "DRY-RUN（PUTしない・GETのみ）"
    print(f"== add_cross_promo_gachi_reserved : {mode} ==")
    print(f"対象候補（Supabase job_outputs 全件）: {len(candidates)} 本")
    print(f"フッターURL(sentinel): {CROSS_PROMO_URL}\n")

    counts = {"applied": 0, "would_apply": 0, "skip_paid": 0, "skip_not_reserved": 0,
              "skip_already": 0, "fail": 0}
    theme_hist = {"A": 0, "B": 0, "C": 0}
    successes, failures = [], []

    for i, (label, key) in enumerate(candidates, 1):
        try:
            note = get_note(key)
        except Exception as e:
            print(f"[{i}/{len(candidates)}] {label:<50} key={key}  ❌ GET失敗: {e}")
            counts["fail"] += 1
            failures.append({"label": label, "key": key, "reason": "GET", "msg": str(e)})
            continue

        nid = note.get("id")
        price = note.get("price", 0) or 0
        status = "reserved" if (note.get("is_reserved") or note.get("status") == "reserved") else note.get("status")
        body = note.get("body", "") or ""
        name = note.get("name", "")

        if price > 0:
            print(f"[{i}/{len(candidates)}] {label:<50} ⏭  SKIP 有料(price=¥{price})")
            counts["skip_paid"] += 1
            continue
        if status != "reserved":
            print(f"[{i}/{len(candidates)}] {label:<50} ⏭  SKIP 非予約(status={status})")
            counts["skip_not_reserved"] += 1
            continue
        if SENTINEL in body or key in state:
            print(f"[{i}/{len(candidates)}] {label:<50} ⏭  SKIP 付与済み(冪等)")
            counts["skip_already"] += 1
            continue

        footer_html, theme = build_footer_html(name, hashtags_of(note))
        theme_hist[theme] += 1
        base = body.rstrip()
        fh = footer_html
        if base.endswith("<hr>") and fh.startswith("<hr>"):
            fh = fh[len("<hr>"):].lstrip("\n")
        new_body = f"{base}\n{fh}"
        put_body = build_put_body(note, new_body)

        assert put_body["price"] == 0, "free限定のはず"
        assert put_body["status"] == "reserved", "予約限定のはず"
        assert SENTINEL in new_body, "footer未挿入"
        assert put_body["send_notifications_flag"] is False

        pa = put_body.get("publish_at")
        if not args.apply:
            print(f"[{i}/{len(candidates)}] {label:<50} theme={theme} "
                  f"body {len(body)}→{len(new_body)}  publish_at={pa}")
            print(f"        name: {name[:54]}")
            counts["would_apply"] += 1
            continue

        with backup_path.open("a", encoding="utf-8") as bf:
            bf.write(json.dumps({
                "key": key, "id": nid, "label": label, "name": name,
                "orig_body": body, "orig_price": price, "orig_separator": note.get("separator"),
                "orig_status": status, "orig_publish_at": note.get("reserved_publish_at") or note.get("publish_at"),
                "orig_eyecatch_key": eye_catch_key_of(note),
                "orig_hashtags": hashtags_of(note), "ts": ts,
            }, ensure_ascii=False) + "\n")

        r = put_note(nid, put_body)
        if r.status_code not in (200, 201):
            print(f"[{i}/{len(candidates)}] {label:<50} ❌ PUT {r.status_code}: {r.text[:200]}")
            counts["fail"] += 1
            failures.append({"label": label, "key": key, "reason": f"PUT_{r.status_code}", "msg": r.text[:200]})
            time.sleep(0.6)
            continue

        time.sleep(0.8)
        chk = get_note(key)
        chk_pa = chk.get("reserved_publish_at") or chk.get("publish_at")
        ok = (SENTINEL in (chk.get("body", "") or "")) and (chk.get("price", 0) or 0) == 0
        if not chk_pa and pa:
            print(f"        ⚠ publish_at null化 → 再復元 re-PUT")
            put_note(nid, {**put_body, "publish_at": pa})
            time.sleep(0.6)
            chk = get_note(key)
            chk_pa = chk.get("reserved_publish_at") or chk.get("publish_at")
        ok = ok and bool(chk_pa)

        if ok:
            print(f"[{i}/{len(candidates)}] {label:<50} ✅ theme={theme} publish_at={chk_pa}")
            counts["applied"] += 1
            state[key] = {"applied": True, "ts": ts, "theme": theme, "label": label, "publish_at": chk_pa}
            state_path.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
            successes.append({"label": label, "key": key, "theme": theme})
        else:
            print(f"[{i}/{len(candidates)}] {label:<50} ⚠ PUT200だが検証失敗 "
                  f"(sentinel={SENTINEL in (chk.get('body','') or '')} pa={chk_pa})")
            counts["fail"] += 1
            failures.append({"label": label, "key": key, "reason": "VERIFY", "publish_at": chk_pa})
        time.sleep(0.5)

    print("\n=== 集計 ===")
    for k, v in counts.items():
        print(f"  {k}: {v}")
    print(f"  theme内訳(付与対象): A={theme_hist['A']} B={theme_hist['B']} C={theme_hist['C']}")
    if args.apply:
        print(f"  backup: {backup_path}")
        print(f"  state : {state_path}")
        (LOG_DIR / f"xpromo_apply_gachi_{ts}.json").write_text(
            json.dumps({"successes": successes, "failures": failures, "counts": counts},
                       ensure_ascii=False, indent=2), encoding="utf-8")
    else:
        print("  （DRY-RUN：PUTは実行していません。本番は --apply）")


if __name__ == "__main__":
    main()
