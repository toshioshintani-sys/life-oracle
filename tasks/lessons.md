# lessons.md — 共有ナレッジ

Claude Code・Cowork の両方がセッション開始時に必ず読む共有教訓ファイルです。
エラーや非効率を踏んだら、即ここに追記してください。

---

## 使い方

- **記録タイミング**：エラー発生時 / デプロイ失敗時 / 記事生成で手戻りが出たとき
- **フォーマット**：`## YYYY-MM-DD タイトル` → 原因 → 解決策 → 再発防止策
- **読むタイミング**：Claude Code / Cowork ともにセッション開始時の最初の読み込みとして使う

---

## テンプレート

```
## YYYY-MM-DD 【カテゴリ】タイトル

**状況**：何をしようとしたか
**問題**：何が起きたか
**原因**：なぜ起きたか
**解決策**：どう直したか
**再発防止**：次回どうすれば防げるか
```

カテゴリ例：`【デプロイ】` `【コンテンツ】` `【セキュリティ】` `【設計】`

---

## ログ

<!-- 新しい教訓はここに追記する（新しいものが上） -->

## 2026-05-06 【設計】GitHub repo secrets は GITHUB_ プレフィックス禁止

**状況**：ガチ人スケジューラ初の自動cron実行（2026-05-06 17:24 JST）が `Process completed with exit code 1` で失敗。失敗メールが俊雄さんに届いた。

**原因**：`.github/workflows/gachijin-scheduler.yml` で `secrets.GITHUB_ACTIONS_TOKEN` を参照していたが、GitHub の仕様で repo secrets 名は `GITHUB_` で始められない。`New repository secret` 画面でその名前を入力すると赤帯で `Secret names must not start with GITHUB_` と弾かれる。Step 6 のチェックリストでは Netlify env のキー名がそのまま GitHub repo secrets にも使えると思い込んでいた（Netlify には制約なし）。結果としてシークレットは未登録のまま、`os.environ.get("GITHUB_ACTIONS_TOKEN")` が None を返し、`dispatch_pipeline()` が False を返して exit 1。

**解決策**：シークレット名を `ACTIONS_DISPATCH_TOKEN` にリネーム。ワークフロー側で `GITHUB_ACTIONS_TOKEN: ${{ secrets.ACTIONS_DISPATCH_TOKEN }}` とマップして、Pythonスクリプトの環境変数名は維持する（既存コードを変えずに済む）。

**再発防止**：
- 新規ワークフローで PAT を読むときの secrets 名は **`ACTIONS_DISPATCH_TOKEN` / `WORKFLOW_PAT` などの非 GITHUB_ 名で統一**する。
- Netlify env と GitHub repo secrets はキー命名規則が異なる。GitHub 側は `GITHUB_*` `RUNNER_*` 不可。
- preflight チェックに「ワークフロー内で参照する secrets が repo secrets に存在するか」を追加すべき（現在の `check_github.py` は固定リストのみ確認している）。

---

## 2026-05-03 【API】note.com サムネイル・予約投稿 確定仕様

**状況**：`post_to_note()` で `thumbnail_uploaded=False` になり続けた。旧エンドポイント `/api/v1/attachments` が 404。

**確定した正しい仕様（実証済み）**：

### サムネイルアップロード

- エンドポイント：`POST /api/v1/image_upload/note_eyecatch`
- パラメータ：`data={'note_id': note_id}` + `files={'file': (filename, bytes, 'image/png')}`
- 画像サイズ：**1280×670 必須**（他のサイズは 400 エラー。Pillow で事前リサイズ）
- セッションに `Content-Type: application/json` を含めてはいけない（multipart が壊れる）
- レスポンス：`{"data": {"url": "https://assets.st-note.com/production/uploads/images/{ID}/rectangle_large_type_2_{hash}.png"}}`
- `eye_catch_key` = `int(re.search(r'/images/(\d+)/', url).group(1))` で整数を抽出

### PUT（予約投稿設定）の必須条件

- `status` は **`'reserved'`** でないと 422 エラー（`'draft'` は不可）
- `publish_at` フィールドをPUTボディに含める → note.com は `reserved_publish_at` として内部保存（GETで確認可能）
- `reserved_publish_at` をPUTボディに直接入れると 422 「公開日付が不正です」になる

### フロー順序

1. `POST /api/v1/text_notes` (status=draft) → `note_id`（数値）・`note_key`（文字列）取得
2. `POST /api/v1/image_upload/note_eyecatch` (note_id + resized image) → `eye_catch_key`（整数）
3. `PUT /api/v1/text_notes/{note_id}` (status=reserved, publish_at, eye_catch_key) → 完了

**再発防止**：`step4_note_api.py` の `upload_image()` を上記仕様で実装済み（2026-05-03）。create_draft() が先に必要なため、post_to_note() の呼び出し順序も修正済み。

---

## 2026-05-03 【設計】質問データの固定解除（フェーズ2再整合）

**状況**：ライフオラクルの開発初期（4ヶ月前）に固めた質問データが、note中心戦略への移行と現在の発信トーンと噛み合わなくなった。実ユーザーからも「中間がない」「答えづらい」という声があったが、CLAUDE.md の「絶対に触らない」リストに `questions.js` と `biasQuestions.js` が含まれていたため変更を保留していた。

**問題（温度差）**：
1. 文体差：旧質問は「〜する傾向がある」型の自己内省的文体。一方noteは「職場でなぜかうまくいかない」型のペインポイント直撃路線
2. シーン偏重：旧質問は「人との会話」「グループ」「片付け」など生活・対人一般の抽象テーマが多く、職場・キャリアシーンが少ない
3. ターゲット像の不一致：旧質問は「自分はどんな人？」を聞く占い寄り、noteは「行動変容・処方箋」を求めるビジネスパーソン向け
4. ユーザーフィードバック：「強くそう/ややそう」の4段階Likertで質問内容に合わない場合がある
5. バイアス8種の固定：B7アンカリング・B8感情ヒューリスティックは日常感が弱く、note記事に登場する他のバイアス（サンクコスト・フレーミング・後知恵・ハロー・認知的不協和）が反映されていなかった

**決定**：
- CLAUDE.md「絶対に触らないもの」リストから `questions.js` `biasQuestions.js` `bias_messages.json` `biasInfo` を外した
- フェーズ1（学術寄り）→ フェーズ2（note中心・日常あるある型）への再整合として記録
- 維持するもの：処方箋データ2,016件、cognitiveFunctionMap、偉人マッピング、MBTI 4軸スコアリングロジック、16タイプ判定の閾値（13点以上で左極）

**改修方針**：
- 質問は「日常生活のあるある」シーン型（職種・年代非依存）。会社員に寄せない・占いチック禁止
- バイアスは8種→12種に拡張：B7アンカリング維持、B8感情ヒューリスティック→サンクコスト効果リネーム（messageKeyは元から sunk_cost で内容整合済）、新規にフレーミング・後知恵・ハロー・認知的不協和を追加（利用可能性ヒューリスティックは採用せず）
- 「中間がない」対策：4段階Likertに代替問（main+alt のペア構造）を導入。詰まったら別シーンの代替問が出現
- 回答UIスタイル：文字ラベル（強くそう/ややそう）から数字・マーク（●◐◑○）に変更。ユーザーが自由に強度を解釈できる形へ
- バイアス回答は○×2択（そう／ちがう）

**再発防止**：
- 「絶対に触らない」リストに項目を追加するときは、戦略変更時にロック解除する手順も同時に明記する
- 数ヶ月単位で発信戦略が変わる前提で、データ凍結期間を最大3ヶ月程度に区切る発想を持つ
- ユーザーから「答えづらい」フィードバックが2回以上あったら、固定解除の検討を必ず行う

---

## 2026-05-03 【価格戦略】夜のトリセツ価格変更（500円→300円・No.4以降）

**状況**：夜のトリセツシリーズの初期構想は全編500円だったが、市場調査で読者の購入心理ハードルを下げるため値下げを決定。No.1〜No.3は500円のまま、**No.4以降は300円**に変更。

**変更箇所**：
- `CLAUDE.md` — 価格設定テーブルを新設
- `ライフオラクルnoteネタ/夜のトリセツ_Cowork指示書.md` — 「価格」「各編」「編集メモ」「OUTPUT形式」の4箇所
- `pipeline/main.py` `build_note_payload()` — yoru_ のNo番号で自動切替（No≤3=500円、No≥4=300円）。`filename` パラメータ追加
- 既存投稿記事の本文中「500円」表記は **編集メモ末尾のメタデータ**にしか出ておらず、パイプラインで自動削除されるため note.com 側には影響なし

**Stage 1中の挙動**：`post_inventory.py` の Stage1 強制無料化処理で `price=0` になるため、上記価格設定は Stage 2移行後に適用される。

**再発防止**：価格変更を行う際は **CLAUDE.md・Cowork指示書・パイプラインコード** の3箇所を必ず同時更新する。1箇所だけ更新するとCoworkの新規生成記事と矛盾する。

---

## 2026-05-03 【コンテンツ】関連記事リンクは個別URL必須

**状況**：投稿済みyoru_No31記事内の「関連記事」セクションに `https://note.com/lifeoraclejp` だけのざっくりリンクが3件あり、読者がトップページに飛ばされて目的の記事に辿り着けない構造になっていた。No24（感傷編・既に削除済）にも同様の4件があった。

**原因**：Coworkが関連記事リンクを生成する際、シリーズ内の他記事の固有URLが分からないため、トップページのジェネリックURLで埋めてしまっていた。

**解決策**：
- CLAUDE.mdに「関連記事リンクのルール」を追記。固有URL `https://note.com/lifeoraclejp/n/n〇〇〇` 必須、リンク文末に1行説明を付ける
- 既存投稿記事は `pipeline/logs/batch_inventory_*.json` から `filename → note_url` マッピングを抽出して個別URLに置換
- note.com本体も PUT で本文同期（感傷編は削除済みのためスキップ）

**再発防止**：
- Coworkに対して「note URLが分からない場合は `[記事タイトル（No.XX）]({{要URL}})` プレースホルダで生成 → Claude Code側で投稿後にURL置換」とルール化したい（次回フィードバック時に検討）
- 当面は投稿後に `pipeline/logs/batch_inventory_*.json` から手動置換可能

---

## 2026-05-03 【設計】Cowork保存先の指示分散と No24 重複事故

**状況**：在庫43件一括投稿の最中に、Coworkが新規生成した `yoru_No24_2026-05-29_感傷・ノスタルジア編.md` が `夜のトリセツ/` 直下に保存され、パイプラインがサムネイル確認・編集前に即posted/に移動した。さらに既存の `yoru_No24_2026-05-29_YouTubeループ編.md` と No番号が重複し、両方とも note.com に予約投稿されてしまった。

**問題**：
1. 保存先指示が CLAUDE.md（`articles/inbox/`）と スケジュールタスクファイル（`夜のトリセツ/`）で矛盾していた
2. `post_inventory.py` は `夜のトリセツ/` 直下も globで拾う設計だったため、Coworkが古い指示に従って保存した新ファイルを即拾った
3. Coworkは生成前に既存No番号の確認をしていなかった

**原因**：
- CLAUDE.mdセクション13（`inbox/` ルール）整備後も、Cowork指示書ファイル（`夜のトリセツ_Cowork指示書.md` / `私のトリセツ_Cowork指示書.md`）の保存先指定が更新されていなかった
- パイプライン側にNo番号重複検出機能がなかった

**解決策**：
1. `夜のトリセツ_Cowork指示書.md`、`私のトリセツ_Cowork指示書.md`、`CLAUDE.md` セクション13に **保存先 = `articles/inbox/` のみ** を強い表現で明記
2. `pipeline/main.py` に `detect_no_duplicates()` を追加。バッチ処理開始前に inbox/ + posted/ + シリーズ別フォルダ全体で No番号衝突を検出し、見つかれば処理中止する
3. CLAUDE.mdに「No番号重複厳禁」セクションを追加。Coworkが生成前に4ヶ所（夜のトリセツ/、私のトリセツ/、inbox/、posted/）の確認を必須化

**再発防止**：
- **ルール変更時の波及確認**：CLAUDE.mdのファイル管理ルールを変更したら、Cowork指示書（夜のトリセツ_Cowork指示書.md、私のトリセツ_Cowork指示書.md）と各種スケジュールタスクファイルも必ず同時に更新する
- **二重実装の検出**：パイプラインが複数のフォルダを監視するスクリプト（post_inventory.py型）を新規作成する場合は、必ず main.py の inbox/ オンリー設計と整合させる。一時用スクリプトでも放置するとCoworkの保存ミスを拾ってしまう
- **構造的予防**：パイプラインに重複検出を組み込んだので、今後は同種事故が起きてもバッチ処理開始前に止まる

---

## 2026-05-03 【note API】予約投稿の確定仕様（最短手順テンプレ）

**状況**：在庫43件を一括予約投稿しようとして、Cookie名・エンドポイント・予約日時フィールド・有料記事の4箇所で詰まった。次回はこのレシピ通りにやればワンショットで通る。

### ✅ 確定したnote.com API仕様（次回はこのまま使う）

**1. 認証**
- Cookie名：`_note_session_v5`（**アンダースコア付き**。`note_session_v5` ではない）
- 値：Chrome DevTools → Application → Cookies → `https://note.com` から取得（32文字）
- 必須ヘッダー：
  ```python
  HEADERS = {
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/json",
      "Accept": "application/json, text/plain, */*",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Referer": "https://note.com/notes/new",
      "Origin": "https://note.com",
  }
  ```
  → User-Agent がないと CloudFront WAF が 403 を返す

**2. 予約投稿の正しい2ステップフロー**

| ステップ | メソッド | エンドポイント | 役割 |
|---|---|---|---|
| ① 下書き作成 | `POST` | `/api/v1/text_notes` | 下書き生成・`id`（数字）と`key`（文字列）を取得 |
| ② 予約設定 | `PUT` | `/api/v1/text_notes/{id}` | フルペイロード + `status:'reserved'` + `publish_at` |

- ❌ `POST /api/v3/notes` → 404（存在しない）
- ❌ `PATCH /api/v3/notes/{key}` → 404（存在しない）
- ❌ `status:'scheduled'` → 422（不正な値）
- ✅ `status:'reserved'` が正解

**3. 予約日時のフィールド名トリック（最重要）**

```python
# PUT のリクエストボディ:
"publish_at": "2026-05-13T22:00:00+09:00"   # ← これで送る
```
```python
# GET のレスポンス:
"reserved_publish_at": "2026-05-13T22:00:00.000+09:00"  # ← こっちで返ってくる
"publish_at": None                                       # ← 公開済み記事のみ値が入る
```

→ **書き込み名と読み出し名が違う**。検証時は `reserved_publish_at` を見ること。

**4. 有料記事は予約NG（Stage 1運用ではすべて無料化）**

`separator` + `paid_body` + `price>0` で PUT すると：
```
422 {"error":{"code":"invalid","message":"有料エリアを再度設定し直してください。"}}
```
→ note.com の支払い口座設定（Stripe等）が必要。Stage 1（基盤構築期）は全記事無料が方針なので、`post_inventory.py` で `separator!=None` の記事は free+paid を結合して `price=0, separator=None, paid_body=None` に強制する処理を入れた。

**5. ペイロード形式（POST/PUT 共通・フラット）**
```python
{
    "author_ids": [],
    "body_length": len(free_body),
    "disable_comment": False,
    "free_body": "<p>...</p>",      # ⚠️ "body" ではなく "free_body"（422の罠）
    "hashtags": ["#tag1", "#tag2"], # ⚠️ # 込みの文字列
    "image_keys": [],
    "name": "タイトル",
    "price": 0,
    "send_notifications_flag": False,
    "separator": None,              # 有料ライン位置（無料記事は None）
    "status": "draft",              # POST時。PUT時は "reserved"
    "publish_at": "...",            # PUT時のみ。ISO 8601 + JST
    "eye_catch_key": "...",         # サムネあれば
}
```
- ❌ `{"note": {...}}` ラッパーは付けない（フラット形式）

### ✅ 次回投稿の最短手順チェックリスト

1. `.env` の `NOTE_SESSION_TOKEN` が有効か（Chrome DevTools で `_note_session_v5` を確認）
2. `pipeline/step4_note_api.py` の `schedule_note()` は PUT + `publish_at` フィールドを使っているか
3. 有料ラインを含む記事は `post_inventory.py` の Stage1 強制無料化処理を通すか
4. Gemini Imagenの日次クォータ（70件/日）に注意。43件一気だと足りない
5. 1件テスト投稿 → note.com ダッシュボードで予約日時を目視確認 → 一括実行

### 確認済み実装
- `pipeline/step4_note_api.py:155` — `schedule_note(note_id, full_payload, publish_at)` PUT版
- `pipeline/step4_note_api.py:252` — `post_to_note()` で `id`（数字）を取得して PUT に渡す
- `pipeline/post_inventory.py:138` — Stage1 強制無料化（free+paid 結合）

**再発防止**：上記レシピを変更する前に必ずこのセクションを読む。特に `publish_at`（PUT body）と `reserved_publish_at`（GET response）の名前違いトリックを忘れない。

---

## 2026-05-02 【自動化】google-genai SDK 移行 — Imagen API 正常稼働確認済み

**状況**：`step3_thumbnail.py` で Imagen API によるサムネイル生成を実装

**問題**：旧パッケージ `google-generativeai` を使うと `AttributeError: module 'google.generativeai' has no attribute 'ImageGenerationModel'` が発生

**原因**：`google-generativeai` は非推奨。Imagen 4 は新パッケージ `google-genai` でのみ利用可能

**解決策**：
```bash
pip install google-genai  # v1.73.1 以降
```
```python
import google.genai as genai

client = genai.Client(api_key=api_key)
result = client.models.generate_images(
    model="imagen-4.0-generate-001",
    prompt=prompt,
    config=genai.types.GenerateImagesConfig(
        number_of_images=1,
        aspect_ratio="16:9",
        person_generation="allow_adult",
        # ← negative_prompt は Gemini API 非対応。指定すると ValueError が発生するので省略
    ),
)
image_bytes = result.generated_images[0].image.image_bytes
```

**利用可能モデル**：`imagen-4.0-generate-001`（推奨）/ `imagen-4.0-ultra-generate-001` / `imagen-4.0-fast-generate-001`

**再発防止**：`google.generativeai` と `google.genai` は別パッケージ。`google-genai` を使うこと。`negative_prompt` は Gemini API では未サポート — 指定すると即 ValueError。

---

## 2026-05-02 【自動化】パイプライン実装 — 動作確認済みの仕様

**状況**：`pipeline/` ディレクトリに自動投稿パイプラインを実装

**確認済みの動作仕様**：

1. **Windows での実行方法**：必ず `python -X utf8` フラグを付けて実行する
   ```bash
   python -X utf8 pipeline/main.py --article "path/to/article.md" --dry-run
   ```
   `-X utf8` なしだと CP932 コンソールエンコードエラーが発生する

2. **フォーマット判定**：ファイル先頭に `━━━━` または `【本文】` が含まれる → Format A（旧Cowork形式）。それ以外 → Format B（クリーンMarkdown）

3. **有料ライン検出パターン**（Format A）：`---【有料ライン】---` が本文内に存在する場合、そこで free_body と paid_body に分割し separator を計算する

4. **ハッシュタグの優先順位**：Format A の場合は `投稿タグ：` 行から抽出（`、` 区切り）→ フォールバックは DEFAULT_HASHTAGS

5. **投稿スケジュール**：
   - `yoru_` → 22:00 JST
   - `wata_` → 07:00 JST
   - `post_` → 18:00 JST
   - `taijin_` → 11:50 JST

6. **dry-run 出力先**：`pipeline/outputs/` 配下に `{stem}_cleaned_body.html` と `{stem}_note_payload_preview.json` が出力される

**再発防止**：note.com APIの `free_body`・`X-Requested-With`・ハッシュタグ形式（#付き）の仕様は lessons.md 2026-04-28 の記録を参照。新規投稿は POST /api/v3/notes → PATCH で status="scheduled"。

---

## 2026-04-29 【コンテンツ】サムネイルスタイルとシリーズのマッピング誤認

**状況**：life-oracle-thumbnail Skillにサムネイル生成プロンプトの定義を追加しようとした

**問題**：シリーズとスタイルの対応が最初から完全に誤っていた
- 誤: `post_` = Style A（私のトリセツ）、`wata_` = 別物
- 正: `wata_` = Style A（私のトリセツ・フォトリアル3DCG）、`post_` = Style C（自然・女性・金の羅針盤）、`yoru_` = Style B（夜のトリセツ・フラットイラスト）

**原因**：ファイル名プレフィックスとシリーズ名の対応を確認せずに定義を書き始めた

**解決策**：ユーザーが直接訂正。Skillを全面的に書き直して3スタイルを正しく定義した

**再発防止**：Skillにシリーズ定義を書くときは、**必ず既存ファイル名（`ls articles/`）を確認してからプレフィックスを特定する**。`wata_`=私のトリセツ、`yoru_`=夜のトリセツ、`post_`=汎用投稿記事。

---

## 2026-04-29 【自動化】X投稿システム Fタイプ（スレッド型）のバリデーション失敗が頻発

**状況**：x_posting_system が F-1/F-2（5ツイートスレッド）を生成・投稿しようとした

**問題**：ツイート1件が「200文字以内」の制限を超えてバリデーション失敗。3回リトライ後に別タイプへフォールバック。毎回 claude-opus-4-7 を3回呼ぶため APIコスト増大。

**確認方法**：`logs/x_poster_*.log` で `WARNING: バリデーション失敗` を検索

**原因**：`prompts/x_posting_v2.4.md` のFタイププロンプトで文字数制約の強調が不十分

**未解決**：プロンプト修正は TODO 状態（2026-04-29時点）

**再発防止**：`x_posting_system/prompts/x_posting_v2.4.md` のF-1/F-2セクションで各ツイートの文字数指示を「**必ず180文字以内**（絶対厳守）」に強化。修正後は `python main.py --dry-run` で5件テストしてバリデーション通過を確認してから本番適用。

---

## 2026-04-28 【自動化】note.com CTA一括追加 — 完全解決

**状況**：全102記事末尾にCTAをブラウザAPIで一括追加

**解決策（確定した正しい手順）**：

```javascript
// 1. 記事一覧取得
GET /api/v2/creators/{urlname}/contents?kind=note&page=N

// 2. 記事本文取得
GET /api/v3/notes/{key}
// → body（HTML）, slug, price, separator, hashtag_notes, disable_comment が返る

// 3. 本文末尾にCTAを追加してPUT
PUT /api/v1/text_notes/{id}
Headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
Body: {
  author_ids: [],
  body_length: newBody.length,
  disable_comment: false,
  free_body: newBody,          // ← キーは "body" ではなく "free_body"
  hashtags: hashtag_notes.map(h => h.hashtag.name),  // ← h.hashtag.name（h.nameではない）
  image_keys: [],
  name: "記事タイトル",
  price: 0,
  send_notifications_flag: false,
  separator: null,
  slug: "slug-xxxxx",
  status: 'published'
}
```

**ハマりポイント**：
1. `body` フィールドではなく `free_body` が正しいフィールド名（エディタJSバンドル解析で判明）
2. `hashtag_notes[].hashtag.name` がハッシュタグ名（`#心理学` 形式、`#` 込み）
3. `X-Requested-With: XMLHttpRequest` ヘッダーが必須
4. `draft_save` は下書き保存専用、PUTで直接 published として更新可能

**エディタJS解析の方法**（今後の参考）：
- `editor.note.com/_next/static/chunks/pages/_app-*.js` をcurlで取得
- `grep -o '.\{200\}text_note.\{400\}'` でAPI呼び出し箇所を特定
- `_buildManifest.js` でチャンクファイル名を特定できる

**結果**：101本成功、1本スキップ（既存CTA）、失敗0本

**追加教訓（2026-04-28 リンクテキスト修正時）**：
- note.comのAPIは、HTMLを保存するとき `&` を `&amp;` にエスケープして保存する
- 例：送信 `>https://...&utm_medium=...` → 保存 `>https://...&amp;utm_medium=...`
- 保存済み内容を検索・置換するときは `&amp;` 形式で検索すること
- CTAリンクテキストは生URLを貼ると読者に「怪しいアフィリエイト」と誤解される → **必ず `[ライフオラクルを無料で試してみる](URL)` 形式**

---

## 2026-04-28 【自動化】note.com記事のCTA一括追加でエディタ操作不可（旧ログ）

**状況**：Chrome MCP でnote.comの全102記事末尾にCTAを自動追加しようとした

**問題**：
1. Chrome MCP の `type` アクションが `editor.note.com` の ProseMirror エディタに届かない
2. REST API `PUT /api/v1/text_notes/{id}` は 422 を返し続けた（body フィールド名が間違い）
3. JavaScript が `[BLOCKED: Cookie/query string data]` でブロックされる（editor.note.com）
4. CORS が `note.com` → `editor.note.com` のクロスオリジンfetchを拒否

**原因**：body フィールド名が `body` ではなく `free_body` だった。JSバンドル解析で解決。

---

## 2026-04-28 【設計】ファイル構成の役割分担を確立

**状況**：Claude Code と Cowork が同じ CLAUDE.md を参照していて、役割が混在していた
**問題**：コンテンツ生成の指示と実装指示が混在し、どちらのエージェントも判断に迷う
**原因**：単一ファイルに全情報を詰め込んでいた
**解決策**：
- `ライフオラクル/CLAUDE.md` → Claude Code専用（実装・デプロイ）
- `ライフオラクル/cowork/CLAUDE.md` → Cowork専用（コンテンツ生成）
- `ライフオラクル/tasks/lessons.md` → 両者が読む共有ナレッジ（このファイル）

**再発防止**：新しいルールを追加するときは「実装系か？コンテンツ系か？共通か？」を最初に判断してから書くファイルを決める
