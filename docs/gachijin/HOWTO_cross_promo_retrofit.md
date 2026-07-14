# note予約記事へのクロス送客フッター後付け（遡及PUT）完全解説

対象: post_/yoru_/gachi_ 全シリーズで実際に稼働し、**236記事への後付けを無事故で完遂した仕組み**
作成: 2026-07-14 / Claude Code（サブスクやめたプロジェクトのセッションから実行）
関連: `ライフオラクルnoteネタ/docs/gachijin/HOWTO_note_posting_pipeline.md`（記事の新規作成・投稿の解説。本ドキュメントは**既に予約済みの記事の本文を後から書き換える**別の作業を扱う）

---

## 0. 一行で

**note.comの予約記事は「予約した時点の本文」を保持するだけで、後からコードを直しても再実行されない。だから新機能（クロス送客フッター）を予約済みバックログに効かせるには、GET→本文末尾に追記→PUTという遡及処理が別途必要。これを3シリーズ（post_/yoru_/gachi_）それぞれの記事の所在（ローカルJSON or Supabase）に応じたやり方で行った。**

---

## 1. なぜこの作業が必要だったか

2026-06-27の決定で「note記事の最下段にサブスクやめたへの送客フッターを自動付与する」機能を実装（commit群、2026-06-28）。しかし2026-07-14に判明した事実：

- **gachi_**：全45テーマの`pipeline_run_date`は2026-05-06〜06-19。フッター機能の実装（6/28）より前に全記事が予約済みだったため、**一度も読者にフッターが届いていなかった**（コードは正しいが、対象となる新規ビルドがそもそも発生していなかった）。
- **post_**：2026-06-28に33本へパイロット適用済みだったが、残り89本（8/1〜10/28公開分）が未着手のまま放置されていた。
- **yoru_**：着手すらしていなかった。

「新規投稿にだけ自然に付く」という設計コメントは、**予約済みバックログが数ヶ月分ある運用（このプロジェクトの標準）とは相性が悪い前提**だった。新機能を作ったら、既存の予約分にも同じ手間で後付けする工程を必ずセットで考えること。

---

## 2. 3シリーズの違い（ここが一番のハマりどころ）

| | post_ / yoru_ | gachi_ |
|---|---|---|
| 記事の所在 | ローカルJSON（`pipeline/post_key_map.json` / `pipeline/yoru_key_map.json`） | **Supabase**（`jobs` → `job_outputs.note_url`） |
| 既存ツール | `pipeline/add_cross_promo_reserved.py`（2026-06-28作成・実証済み） | 存在しなかった→今回新規作成 |
| note.com認証 | `Claude_work/.env` の `NOTE_SESSION_TOKEN` | `ライフオラクル/.env` に**元々無かった**（要補完） |

**同じ「クロス送客フッターを付ける」という一つの決定でも、実装の準備度は3系統でバラバラだった。** 「全部まとめて一つの作業」に見えても、実際は候補の集め方から作り直す必要がある系統が混ざっていることがある——着手前に各系統の実装状態を個別に確認すること。

---

## 3. 安全設計（3系統共通・`pipeline/add_cross_promo_reserved.py`が原型）

```python
# 候補ごとに以下を順にチェックし、どれか一つでも該当したらSKIP（PUTしない）
if price > 0:                      # 有料記事は絶対に触らない（収益破壊リスク）
    skip("有料")
if status != "reserved":           # 既に公開済み/削除済みは触らない（再通知・意図しない改変を避ける）
    skip("非予約")
if SENTINEL in body or key in state:  # 既に付与済み（冪等）
    skip("付与済み")

# 通過したら:
new_body = body.rstrip() + footer_html   # 本文を再変換せず、GETした生bodyの末尾に追記するだけ
# 元記事が既に<hr>で終わる場合は、footer側の先頭<hr>を落として二重線を防ぐ
if base.endswith("<hr>") and footer_html.startswith("<hr>"):
    footer_html = footer_html[len("<hr>"):].lstrip("\n")

put_body = {...元noteの全フィールドを保全..., "free_body": new_body,
            "send_notifications_flag": False,     # 通知を飛ばさない
            "status": "reserved", "publish_at": 元のpublish_at}  # 予約を維持

# PUT後に必ず検証GETし、フッターが実際に入ったか・publish_atが消えていないかを確認
# publish_atがnull化していたら再PUTで復元する（既知の罠）
```

**note.com APIの罠（`HOWTO_note_posting_pipeline.md` §4-4 と同一）**：公開API（一覧系）は予約記事を返さない。**必ず `/api/v3/notes/{key}` を個別に叩いて現在の状態を見る**こと。PUTは部分更新ではなく全フィールド必須なので、GETした元データを土台に組み立てる。

---

## 4. 候補の集め方（シリーズごとに異なる部分）

### post_ / yoru_（ローカルkey_map）

```python
SERIES_KEY_MAPS = {
    "post": ROOT / "pipeline" / "post_key_map.json",
    "yoru": ROOT / "pipeline" / "yoru_key_map.json",
}
km = json.loads(path.read_text(encoding="utf-8"))
for label, raw in km.items():
    key = raw.get("key") if isinstance(raw, dict) else raw   # ★後述の罠
    ...
    if date_in(label) > today:   # 「予約」＝ラベルの日付が今日より後
        candidates.append((label, key))
```

### gachi_（Supabase）

```python
jobs = supabase_get("jobs?series=eq.gachijin&select=id,theme,start_date")
job_ids = ",".join(j["id"] for j in jobs)
outputs = supabase_get(f"job_outputs?job_id=in.({job_ids})&select=id,job_id,day_no,note_url,status")
for o in outputs:
    key = note_key_from_url(o["note_url"])
    candidates.append((f"gachi_{theme}_day{o['day_no']}", key))
# note.com側で status=reserved かどうかは、後段のGETで個別に確認する
# （Supabase側のjob status="scheduled"は「ジョブが完了した」という意味で、
#   note.com側の「予約中/公開済み」とは別軸なので混同しない）
```

---

## 5. 実際に踏んだ罠（2026-07-14）

| 罠 | 症状 | 対策 |
|---|---|---|
| **yoru_key_map.jsonの値が混在形式** | `{'key':'n...','stem':...}`という辞書と、素の文字列`'n...'`が混在。スクリプトは`isinstance(key,str)`しか見ておらず、49/50件が候補にすら入らなかった | `raw.get("key") if isinstance(raw, dict) else raw` で正規化してから使う |
| **ライフオラクル/.envのSUPABASE_URLが別プロジェクトを指していた** | DNS解決から失敗（`Test-NetConnection`でも到達不可）。「プロジェクトが一時停止している」と誤診断しかけた | 実際はプロジェクト自体は`Healthy`。ダッシュボードで正しいproject ref（`frexpdazuhbxecgpnbyb`）を確認し`.env`を是正。**「繋がらない＝一時停止」と決めつけず、まずダッシュボードで実プロジェクトの状態を直接見ること** |
| **NOTE_SESSION_TOKENがライフオラクル/.envに無かった** | gachi_のnote_client.pyはこの変数を要求するが、gachi_のオリジナル実装はGitHub Actions Secrets経由の実行を前提にしていてローカル`.env`には元々置いていなかった | 同じnote.comセッションなので`Claude_work/.env`（pipeline/が使用）から値をそのままコピーして追記すればよい。project固有の値ではない |
| **サービスキー・トークンを画面に表示しない** | Supabaseのservice_role keyは「Reveal」ボタンでしか見えない設計 | Revealしてすぐ「Copy」でクリップボードへ→`Get-Clipboard`で直接`.env`に書き込む。値を一度もチャット上のテキスト出力に含めない |
| **post_152のみ末尾`<hr>`が二重（2026-06-28からの既存不具合）** | 元記事が既に`<hr>`で終わっていたケースで、当時のスクリプトには二重防止ロジックがまだ無かった | 該当パターン`<hr>\n\n<hr>\n<p>（おまけ）`を`<hr>\n<p>（おまけ）`に置換して単発修正。**新規追加した236本には同種の不具合はゼロ**（現行スクリプトの`base.endswith("<hr>")`チェックが機能している証拠） |

---

## 6. 一括付与後の監査（今回から標準工程に追加）

俊雄さんの「二重になっていないか念のため確認した方がいい」という指摘を受けて実施。**判断が要らない単純な文字列カウントなので、エージェントに投げず直接スクリプトで検証するのが正しい**（多エージェント検証はコストに見合わない）。

```python
for series, state_path in STATE_FILES.items():
    for key in json.load(open(state_path)).keys():
        note = get_note(key)   # 実際に GET し直す（backupやstateの記録を信じない）
        body = note["body"]
        url_count = body.count("sabusuku-yameta.com")      # 期待値=1
        label_count = body.count("サブスクやめた")            # 期待値=1
        dup_hr = re.findall(r"(?:<hr\s*/?>\s*){2,}", body[-400:])  # 期待値=0件
        if url_count != 1 or label_count != 1 or dup_hr:
            flag(key)
```

**次に同種の一括付与をする時は、適用直後にこの監査を必ず走らせること。** 今回は269本監査して異常1件（post_152・既知の古い不具合）を発見・修正できた。

---

## 7. 「ガチ人の投稿は速かった」という記憶について

俊雄さんの記憶通り、**元々のガチ人新規作成パイプライン（`gachijin_bulk_run.py`）は体感で速い**。理由は並列性の違い：

- **元の新規作成**：ローカルは各テーマのジョブをSupabaseに登録してGitHub Actionsを起動するだけ（1テーマあたり throttle 15秒）。実際の記事生成・note投稿はGitHub Actions側で**並行実行**されるため、俊雄さんが待つ体感時間は「45テーマ×15秒≒11分」程度で済み、生成・投稿自体はバックグラウンドで進む。
- **今回の遡及フッター付与**：note.comの1アカウントに対して**単一プロセスが順番にGET→PUT→検証GETを繰り返す**設計（安全のため意図的に直列・スリープ挟み）。236本で合計30〜40分程度かかった。

同じ「note.comへの236件の書き込み」でも、**新規作成は複数ジョブが並行するAction基盤に乗るため速く感じ、後付け修正は安全性優先の単一プロセス直列処理なので体感が遅くなる**——これは設計判断の違いであって、どちらかが壊れているわけではない。今後も「予約済み記事の一括修正」をする時は、この直列・スリープ挟みの安全設計を維持すること（並列PUTはnote.com側のレート制限・競合更新のリスクが上がるため推奨しない）。

---

## 8. 主要ファイル一覧

| ファイル | 役割 |
|---|---|
| `pipeline/add_cross_promo_reserved.py` | post_/yoru_ 用（ローカルkey_map起点）。`--series {post,yoru}` |
| `ライフオラクル/scripts/add_cross_promo_gachi_reserved.py` | gachi_ 用（Supabase起点）。本日新規作成 |
| `pipeline/cross_promo_footer.py` / `ライフオラクル/scripts/gachijin/cross_promo_footer.py` | フッター文言・テーマ判定（両者は一字一句同一に保つこと） |
| `pipeline/logs/xpromo_state_{post,yoru}.json` / `ライフオラクル/var/gachijin/xpromo_logs/xpromo_state_gachi.json` | 冪等判定用の適用済みkey一覧 |
| `pipeline/logs/xpromo_backup_*.jsonl` / `ライフオラクル/var/gachijin/xpromo_logs/xpromo_backup_gachi_*.jsonl` | 撤回用の元body完全退避 |

---

## 9. 次回チェックリスト（同種の一括修正をする時）

- [ ] 各シリーズの記事の所在（ローカルJSON or Supabase or 他）を個別に確認する。「1つのツールで全部いける」と決めつけない
- [ ] key_mapがあるなら、値の型（文字列 or 辞書）が混在していないか事前にサンプル確認する
- [ ] 外部サービス（Supabase等）に繋がらない時は「一時停止」と決めつけず、まずダッシュボードで実プロジェクトの状態を直接見る
- [ ] 認証情報がどの`.env`にあるか（プロジェクトをまたいで共有されている場合がある）を確認してから「無い」と判断する
- [ ] まず`--limit 5`程度の小規模dry-runで安全性を確認 → 全件dry-run → `--apply`
- [ ] 適用後は必ず§6の監査（URL出現数・連続hr）を走らせる。判断不要な単純カウントはエージェントでなく直接スクリプトで
- [ ] 撤回が必要になった場合はbackup jsonlから復元するスクリプトを用意しておく（`pipeline/remove_cross_promo_reserved.py`が前例）
