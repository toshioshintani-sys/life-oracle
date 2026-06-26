# lessons.md — 共有ナレッジ

## ⚡ 最新引き継ぎポインタ

→ **`tasks/HANDOFF_claude_ui_premium_deploy_2026-06-07.md`** を読むこと（UI最高級化・本番公開・未コミット巻き戻り防止）

→ **`tasks/HANDOFF_cloud_resume_2026-06-06.md`** を読むこと（自己完結の引き継ぎ書）

---

Claude Code・Cowork の両方がセッション開始時に必ず読む共有教訓ファイルです。
エラーや非効率を踏んだら、即ここに追記してください。

## 2026-06-26 【X投稿】生成不安定の真因＝「検証側だけ緩和し、プロンプト側を直し忘れた」二層不整合

**状況**：X自動投稿（`x_posting_system`）で単発生成が連続失敗（朝の 07:24 で n2ddd0900add8 が型B/C/D/E/G 全滅・EXECUTE_RESULT:False）。前セッションで単発上限を 180→280 に「緩和済み」のはずだった。

**真因（多層の文字数指示が三つ巴で矛盾）**：
- 検証 `generator.py:191` ＝単発 **280字**まで許可（前セッションで緩和済）
- 再試行フィードバック `generator.py:293` ＝「**上限180字**を絶対に超えるな」（直し忘れ）
- プロンプト本体 `prompts/x_posting_v2.4.md` ＝冒頭「最大4,000字・140字制約は不要」、なのに各型テンプレで「**上限180字 絶対厳守**」を13箇所＋例文は240〜290字（直し忘れ）
- → Gemini は「180厳守」と13回言われつつ4,000字OKとも言われ、オーバーシュート（289〜349字）して280検証を超え、全リトライ失敗＝投稿ゼロ。

**解決（2026-06-26・適用済）**：プロンプト本体の単発型（A〜G・チェックリスト）を 200〜260字推奨／上限280字に整合、`generator.py` の再試行上限を型依存（単発280・スレッド180）に。dry-run 検証で型A=264字・型B=279字がともに1回目で成功（修正前は全滅）。常駐は Python314・スーパーバイザー付きで再起動（PID 71592・1個のみ＝二重起動なし）。

**再発防止（最重要・横展開可）**：
- **「上限を緩和/変更する」修正は、検証ロジックだけでなく①LLMへ渡すプロンプト本体 ②再試行フィードバック ③チェックリスト ④例文 の全層を同時に直す。** 1層でも古い値が残ると、LLMは矛盾指示でオーバーシュートし、検証を通らず実質ゼロになる。「検証を直したから緩和済み」は罠。
- 文字数等のパラメータは**ハードコードを1箇所に集約**し各層が参照する形が理想（今回は3層に散在していた）。
- `load_prompt()` は生成毎にファイルを再読込する設計（generator.py:247）＝**プロンプト.md の修正は常駐再起動なしで即反映**。`generator.py` 等の .py 修正のみ再起動が必要。切り分けて最小再起動。
- X常駐は直起動だとスーパーバイザー無し＝落ちても自動復帰しない。**再起動はタスク `LifeOracle_X_Resident`（=start_resident.ps1 スーパーバイザー）経由**で行い、`logs/x_poster_*.log` の「常駐モード起動」が**1件だけ**増えることを確認（kill→既存スーパーバイザーの自動復帰とタスク再起動が競合して二重起動しうる・要確認）。

## 2026-05-11 【コンテンツ/課金】jin_ 全56本の有料ライン調査 — 全件が無料プレビューほぼゼロ or 未設定で要修正

**状況**：俊雄さんの依頼で jin_03〜58（500円・対人攻略シリーズ）の有料ライン（無料/有料の境界）を全件調査。

**調査方法（再利用可・anonだけでは不正確）**：
1. オーナー認証 GET `/api/v3/notes/{key}` → 本文全体 + `separator`（有料ライン UUID）+ status
2. 一般読者の無料プレビューは**認証なし GET でしか測れない**が、`reserved`(予約)記事は公開APIが本文を返さない（=anonで0字になるのは「無料0字」ではなく「予約で非公開」のことが多い）。anonの0字を鵜呑みにしない
3. 確実なのは **Playwright でエディタ `/edit/` を開き `.ProseMirror` 内の `paywall` クラス位置**を見る方法。`paywall` 文字列の前＝無料、後＝有料で可読字数を測れる。これが最も信頼できる
4. `investigate_paywall.py`（scripts/）に anon方式を実装済みだが、確定判定はエディタ方式を使うこと

**判明した実態（3コホート）**：
- **Aコホート 26本（jin_03〜16, 24, 47, 49〜58）**：有料ライン区切りが**冒頭の診断CTA直後**に存在。無料＝CTAの88字のみ、本文（見出し全部・3500〜4600字）が丸ごと有料。無料側の記事見出し=0個。→ 読者は本文を一切味見できず課金導線として致命的
- **Bコホート 30本（jin_17〜48の大半）**：エディタに `paywall` 区切りが**存在しない**＝有料ライン未設定。500円なのに無料/有料の境界がない不整合状態。`separator` UUIDも本文に無い
- published 13本（03-05, 49-58）は anon でも無料88字を実測確認。Aコホートの構造を裏取り済み

**あるべき姿**：CLAUDE.md 9パート構成に従い、無料＝導入(共感)＋問題の構造(リフレーミング＋バイアス解説)、有料ライン＝「やってはいけない対応／処方箋」の直前。無料で30〜40%（フック部分）を見せ、解決策を有料にするのが定石。現状は無料が約2-3%（CTAだけ）or 境界なし。

**再発防止**：
- jin_ の有料ライン位置は記事生成パイプライン（step1_clean.py / Cowork の `<!-- more -->` マーカー）で**処方箋直前に確実に置く**運用を徹底。CTA直後に置くと無料プレビューが消える
- 予約記事の無料プレビュー実測は anon API では不可。エディタの `paywall` クラス位置で判定する
- バルク投稿後は有料ライン位置を必ず検証（全部有料/未設定の事故が現に56本中56本で起きていた）

**【解決済み 2026-05-11】有料ライン一括修正の方法を確立**：`scripts/set_jin_payline.py` で全56本を原稿 `<!-- more -->` 位置に修正完了（成功56/失敗0）。
- 修正方法（Playwright・実証済み）：`/edit/` → 「公開に進む」→ 「有料エリア設定」→ 本文に出る**「ラインをこの場所に変更」ボタン**を目的見出し直前のものだけJSで特定してクリック → 保存。
- **保存ボタンは published記事=「更新する」/ reserved記事=「予約投稿」**（どちらかをcountで判定して押す。これを取り違えると timeout する）。
- 有料ラインは note内部で `<paywall-line ... textcount=... text="有料部分">` 要素。**この要素はエディタ(.ProseMirror)にのみ存在し、`/api/v3/notes` のbodyには出ない**。検証は必ずエディタ再読込で `.ProseMirror` 内の `paywall` 位置を測ること（API bodyで探すと常に未検出になる）。
- 目標位置は各原稿MDの `<!-- more -->` 直後の見出し。jin_03-16=「やってはいけない3つの対応」直前（無料≈1900-2200字）、jin_17-58=「2｜なぜ〜のか」直前（無料≈510-625字）。
- 修正後検証：jin_03 で一般読者の無料プレビューが 87字→1935字に増加・タイトル/価格/メンバーシップ/サムネ全て保持を確認済み。バルク操作（タイトル変更・有料ライン変更）はこのフローを通しても本文・各種設定を壊さない。

> ⚡ **最新（2026-06-07）自律運用ルール適用B 完了**：`docs/WEEKLY_SPRINT.md`・`docs/NOT_DOING.md` 新規、`committee.py` に計画拘束/DO-NOT-ADOPT除外/執行レビュー、`scripts/runway_check.py`＋週次タスク `LifeOracle_RunwayCheck_Weekly`（予約21日未満でSlack通知・**通知のみ**）。North Star＝サムネ追加＋発信。詳細は `docs/WEEKLY_SPRINT.md`。
> ⚡ **教訓（2026-06-07）在庫/ランウェイ監視はローカル専用**：`daily_report.py` はクラウド(GitHub Actions)で動き、予約データ（別フォルダ `ライフオラクルnoteネタ/articles/` の記事ファイル）を見られない。さらに note.com の list系API は予約記事を隠す。∴ 在庫・ランウェイ系の監視はローカルスクリプトでしか正しく動かない（クラウド(daily_report.py)に置こうとしない）。stress-testの初期案を実測で訂正した実例。
> ⚡ **引き継ぎ（2026-06-06）**：委員会インフラ＋アプリ改修ブランチを main にマージが次の一手（要承認・本番デプロイ）。詳細 `tasks/HANDOFF_cloud_resume_2026-06-06.md`。

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

## 2026-06-09 【CI/委員会】累積失敗の正体＝gachijin(無視対象)・委員会本体は健全（決定3点検）

**状況**：委員会2026-06-09 決定3「累積16失敗のログを4分類＋Researchジョブに timeout-minutes 明記」を実施するため `gh run list` で実査した。

**問題**：engine担当が「累積16失敗」を懸念していたが内訳が不明で、緑/赤信号の信頼性が判断できなかった。

**原因（実測）**：直近80 runのワークフロー別失敗は **Committee Research 0/4・Committee Meeting 0/4・Daily Report 0/6（＝委員会クラウド本体は失敗ゼロ・健全）**。失敗46件はすべて **Gachijin Pipeline** で、最新runは全て **2026-05-08 の workflow_dispatch(手動)**。cronは当日コメントアウト済み（`gachijin-scheduler.yml`「Daily cron disabled on 2026-05-08」／`gachijin-pipeline.yml`はworkflow_dispatchのみ）。∴以降の自動失敗ゼロ＝赤信号は増えていない。

**解決策**：新規実装は不要だった。(1)timeout-minutesは committee-research.yml=20・committee-meeting.yml=15 で**両方すでに明記済み**。(2)gachijin失敗は NOT_DOING #8（役目終了・無視対象）＋daily_report fix(6/9 d4ac7bf で毎朝報告から除外)で既にカバー済み。(3)4分類の精査は対象が全て停止済みgachijinのため NOT_DOING #8 に従いスキップ（労力漏れ防止）。

**再発防止**：「累積N失敗」を見たら、まず **ワークフロー別＋実行日時＋trigger(event)** で切り分ける。古い手動runの失敗を「進行中の異常」と誤認しない。最速＝`gh run list --json workflowName,conclusion,createdAt,event`。

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
