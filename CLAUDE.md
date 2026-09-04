# ライフオラクル CLAUDE.md

Claude Codeが起動するたびに自動で読み込まれるプロジェクトルールです。

---

## プロジェクト基本情報

- **アプリ名**：ライフオラクル
- **本番URL**：https://life-oracle.jp/
- **旧URL（301リダイレクト中）**：https://life-oracle.jp/
- **保護ドメイン（301リダイレクト）**：https://life-oracle.com/
- **GitHubリポジトリ**：https://github.com/toshioshintani-sys/life-oracle
- **技術構成**：React + Vite
- **プロジェクトパス**：C:\Users\user\Desktop\claude_work\ライフオラクル
- **デプロイ方法**：git push するだけで Netlify が自動ビルド＆デプロイ

---

## プロジェクトの設計思想

MBTIを入口にしつつ、ユング認知機能の光と影・行動経済学バイアスで深さを出す。
「ラベルを貼るツール」ではなく「自分の動き方を理解するツール」。

### 診断フロー
ユング診断（32問）→ バイアス測定（16問）→ 結果画面

### 結果画面の構成
タイプ名 + キャッチコピー + 偉人
主機能（光） / 影
思考のクセ（バイアス1位・2位）
処方箋（職種 × 年代 × タイプ）
結果カード画像保存ボタン
シェアボタン / もう一度診断

---

## 絶対に触らないもの

以下のデータは変更・削除禁止。

- 処方箋データ（2,016件）
- 偉人マッピング（16名）
- 光と影のマッピング（cognitiveFunctionMap）

## 固定解除されたもの（フェーズ2再整合）

2026-05-03 に以下のデータの「絶対に触らない」ロックを解除した。
note中心戦略への再整合のため、文体・対象シーン・分類を見直す。

- **診断質問データ（questions.js / biasQuestions.js）**：旧版は学術調・自己内省的な文体でnote記事の職場ペインポイント路線と温度差があった。日常生活の「あるある」シーン型に書き直す
- **バイアス追加メッセージ（bias_messages.json）**：8種から12種に拡張（アンカリング維持・利用可能性は採用せず・サンクコスト/フレーミング/後知恵/ハロー/認知的不協和を追加）
- **バイアス分類体系（biasInfo / scoring.js）**：B8「感情ヒューリスティック」→「サンクコスト効果」にリネーム（messageKeyは元から sunk_cost で内容も整合済）。B9〜B12を新規追加

旧版の質問データは Git 履歴で参照可能。スコアリング軸（EI/SN/TF/JP × 12バイアス）と16タイプ判定ロジックは維持する。

---

## ファイル操作のルール

### 重要：実際にビルドされるファイル
**main.jsx は App.jsx を読み込んでいる。**
フロントの変更は `src/App.jsx` を編集すること。

### バージョン管理はGit任せ
`App_v10.jsx` のような連番ファイルは作らない。
`App.jsx` を直接編集し、コミットで履歴を残す。
- 大きな変更：feature branch を切って作業 → PR/マージ
- 安全策：変更前に `git commit` でセーブポイントを作る
- ロールバック：`git revert` か `git checkout <commit> -- src/App.jsx`

### デプロイの手順
git add .
git commit -m "変更内容の説明"
git push origin main

pushするだけでNetlifyが自動でビルド＆デプロイする。
distフォルダを手動でドロップする必要はない。

### .gitignoreに含めるもの（変更不要）
node_modules/
dist/
.env
.env.local

---

## セキュリティのルール

### APIキーは絶対にコードに書かない
- AnthropicのAPIキーは Netlify の環境変数（ANTHROPIC_API_KEY）に設定済み
- ソースコード・.envファイルにAPIキーを直書きしない
- GitHubにpushする前に必ずAPIキーが含まれていないか確認する

### APIの呼び出し構造
フロントエンド（React）
↓
/.netlify/functions/generate-oracle（サーバー側）
↓
Anthropic API（APIキーはサーバー側のみ）

### Netlify Functionsの場所
netlify/functions/chat.js
netlify/functions/generate-oracle.js

---

## コーディングのルール

### Windowsの改行コード警告について
LF will be replaced by CRLF の警告は無視してOK。動作に影響なし。

### CSSについて
- ベースカラー：background: #faf6f1（ウォームクリーム）
- テキスト：color: #2d2318（深い焦げ茶）
- アクセント：#b8833f（アンバー・金土色。羅針盤と同系統）
- アクセント濃：#8c5f28
- 光の状態：#3d7a5a / 影の状態：#a05050
- フォント本文：Hiragino Sans, Hiragino Kaku Gothic ProN, Noto Sans JP, sans-serif
- フォント見出し：Noto Serif JP, Hiragino Mincho ProN, Yu Mincho, serif
- ブランドシグネチャ：**羅針盤モチーフ**（favicon / ヘッダー / イントロ画面で使用）

---

## スコアリングの仕様

### ユング診断（32問）
- 通常項目：強くそう=3 / ややそう=2 / ややちがう=1 / 強くちがう=0
- 逆転項目（4問のみ）：強くそう=0 / ややそう=1 / ややちがう=2 / 強くちがう=3
- 逆転項目：SN_7・SN_8・TF_8・JP_8
- 各軸13点以上 → 左極（E/S/T/J）、12点以下 → 右極（I/N/F/P）

### バイアス測定（16問）
- 各バイアス2問 × 最大3点 = 最大6点
- 合計点が高い順に上位2バイアスを表示
- B1損失回避 / B2現在バイアス / B3確証バイアス / B4同調バイアス
- B5過信バイアス / B6現状維持バイアス / B7アンカリング / B8感情ヒューリスティック

---

## 光と影の名前（変更不可）

Te：指揮者 / 鉄砲玉
Ti：職人 / 堂々巡り
Fe：聴き手 / 八方美人
Fi：求道者 / 頑固者
Se：今を楽しむ人 / 思いつき人
Si：コツコツ人 / 現状維持人
Ne：発明家 / 三日坊主
Ni：先読み人 / 独走者

---

## 自律運用ルール（計画拘束・2026-06-07）

全プロジェクト共通の `~/.claude/AUTONOMY_OPERATING_RULES.md`（7原則）に準拠。ライフオラクルは不足分（原則2/6/DO-NOT-ADOPT）を**最小で補った**。**固有決定（毎日自動投稿は2026-05-31停止＝バルク予約運用）が共通既定に優先する。**

- **セッション/会議の冒頭で読む**：`docs/WEEKLY_SPRINT.md`（今週の律速＝サムネ追加＋発信の仕組み化／やる3・やらない3）と `docs/NOT_DOING.md`（採択禁止リスト＝毎日自動投稿復活・X全自動・品質を削る量産・早すぎる収益化拡大ほか／再開トリガー付き）。
- **委員会**：`scripts/committee.py` は会議冒頭で上記を読み、律速に沿って採択・NOT_DOING該当案を自動除外・執行レビューで採択→実行を閉じる。
- **委員会の実行方式（2026-07-09変更）**：GitHub Actions（生API課金・毎日）から、ローカル週次タスク `LifeOracle_Committee_Weekly`（毎週月曜19:00 JST・`scripts/committee_native/run_weekly.ps1`）へ移行。`claude -p --permission-mode bypassPermissions` でTaskツールによる5担当会議を無人実行し、LEDGER.md追記・push・Slack通知まで行う（サブスク課金枠・生API不使用）。GitHub Actions側(`committee-research.yml`/`committee-meeting.yml`)の無効化可否は別途判断中。詳細＝`docs/RESOLVED_FACTS.md`「委員会の実行方式を週次ローカル無人実行へ移行」節。
- **予約ランウェイ監視（通知のみ）**：`scripts/runway_check.py` ＝ ローカル週次タスク `LifeOracle_RunwayCheck_Weekly`（毎週日曜18:00）。各シリーズの予約最終日が**21日未満**で俊雄さんに Slack 通知。真実源＝ローカル記事ファイル（note.com APIは予約を隠すため）。**記事生成・公開は一切しない。⚠️この週次タスクは意図的に登録したもの＝事故ではない**（再開/停止は `Enable/Disable-ScheduledTask`）。
- North Star＝「届け方の設計」。記事は約4-5ヶ月分予約済み＝量は律速でない。**律速はサムネ追加。**
- **委員会への情報連絡は「指示待ち」でなく「実行」（原則1）。** 委員会はクラウドで `RESOLVED_FACTS.md`／`WEEKLY_SPRINT.md`／`NOT_DOING.md` を**毎回読む**だけで、ここでの会話は知らない。よって**セッションで確定事実・決定・前提崩し（例：計測の実態、SEO真因、機能の実装状況）が出たら、その台帳を更新してpushするまでがそのタスクの完了**。「更新しますか？」と俊雄さんに聞かない（聞くのは原則1違反）。委員会が古い前提でループしていたら、それは台帳が古い＝こちらの未更新が原因。唯一の人ゲートはmainへのpush承認のみ。
- **真実源の鮮度監視（安全網・2026-06-19登録）**：ローカル日次タスク `LifeOracle_TruthSourceCheck_Daily`（毎日07:00）＝ `scripts/truth_source_check.py`。RESOLVED_FACTS/WEEKLY_SPRINT が STALE_DAYS 以上未更新で以降に活動があれば「次セッションで台帳点検を」と Slack通知。**Anthropic API不使用・通知のみ・更新も生成もしない**。⚠️ この通知/タスクは意図的（事故ではない）。停止は `Disable-ScheduledTask`。これは安全網であって本来の解は上記の更新習慣。
- **X投稿ルートは憲章で一本化・固定（2026-06-21）**：X自動投稿の**唯一の本番経路＝ローカル `Claude_work/x_posting_system`（ブラウザ式）**。本文確定は `poster.finalize_tweet_text` 単一チョークポイントで **note URL を構造付与**し、投稿直前の `_url_guard_or_abort` で **fail-loud**（URL欠落は構造的に投稿不可・発火時Slack）。隔週 `checkpoint_review.py` がガード健在を改ざん検知。不変条件・責任・監視・正本コード＝**`docs/X_POSTING_CHARTER.md`**。**第2経路を作らない／ガードを外さない／ClaudeにURL生成させない**（API版`scripts/x_poster.py`=PR#17は本番外の将来候補）。詳細＝[[memory: project_x_posting_url_fix]]。
- **マガジン自動編入（2026-08-03追加）**：`ライフオラクルnoteネタ/scripts/sync_new_articles_to_magazines.py` ＝ ローカル週次タスク `LifeOracle_MagazineSync_Weekly`（毎週日曜19:30 JST・スリープ復帰対策で3時間ごと12時間の繰り返し付き）。新しく公開されたnote記事を内容で分類し、35個のバイアス別マガジンへ編入する。**非LLM・Anthropic API不使用・冪等**（何度実行しても重複しない）。手動実行は `python -X utf8 scripts/sync_new_articles_to_magazines.py`（`--dry-run`あり）。⚠️この週次タスクは意図的登録（事故ではない）。停止は `Disable-ScheduledTask`。**jin_（有料・対人攻略）は対象外**＝俊雄さん決定により独立維持（11月の方向転換まで）。
- **マガジン体制の定期点検（2026-08-06追加・単発2本）**：`ライフオラクルnoteネタ/scripts/magazine_health_check.py` ＝ ローカル単発タスク `LifeOracle_MagazineCheck_1M`（2026-09-06 20:00）と `LifeOracle_MagazineCheck_2M`（2026-10-06 20:00）。①新規マガジン化の候補（記事2本以上あるのにマガジンが無いバイアス＝週次同期では拾えないので人の判断が要る）②固定記事へのリンク漏れ ③週次同期タスクの稼働 ④案内所記事の状態・スキ数 を点検し**Slack通知**する。⚠️**noteの固定枠（1つのみ）は「神プロンプト」記事に使う＝マガジン案内所記事は固定しない**（2026-08-06 俊雄さん決定・アプリ誘導を優先）。未固定でも異常ではないので固定を再提案しないこと。**非LLM・API課金なし**。手動実行は `python -X utf8 scripts/magazine_health_check.py --dry-run`。⚠️意図的登録・単発なので発火後は自動で終わる（繰り返さない）。
- **X投稿の日次ヘルスチェック（2026-07-10追加・安全網）**：`x_posting_system/check_posting_health.py` ＝ ローカル日次タスク `LifeOracle_XPostingHealthCheck_Daily`（毎日08:00 JST）。真実源＝`posts_log.jsonl`（システム自身の一次投稿記録。**Xタイムラインのブラウザスクレイピングは日時パースが不安定なため使わない**＝2026-07-10実測の教訓）。直近2枠（朝6:50/夜22:20）が連続欠落した時のみSlack通知、健全時は完全無通知（スカスカな日次ping化を避ける設計）。**非LLM・Anthropic API不使用**＝API残高が尽きても永久に動く。背景：06-27〜07-06の10日間投稿トリガー無音不発が、隔週checkpoint_reviewでは最大2週間気づけなかった実障害。⚠️この日次タスクは意図的登録（事故ではない）。

---

## Self-Improvement

- **セッション開始時**：`tasks/lessons.md`（および `docs/WEEKLY_SPRINT.md` / `docs/NOT_DOING.md`）を最初に読む
- **エラー発生後**：パターンを `tasks/lessons.md` に即追記する（フォーマット：日付・状況・原因・解決策・再発防止）
- **Netlify deploy前**：環境変数（特に `ANTHROPIC_API_KEY`）が Netlify 側に設定済みか必ず確認する
- **同じエラーが2回起きたら**：このCLAUDE.mdの「絶対に触らないもの」または「コーディングのルール」セクションを強化する

---

## よくある確認への回答

- LF will be replaced by CRLF → 無視してOK
- git compound command の確認 → Yes
- --dangerously-skip-permissions → 確認スキップしてよい
- Python関連の確認 → Yes, and don't ask again for: python:*
- ファイル編集の確認 → Yes, allow all edits during this session

---

## GitHubリポジトリ情報

- URL：https://github.com/toshioshintani-sys/life-oracle
- ブランチ：main
- pushコマンド：git push origin main

pushすると自動でNetlifyにデプロイされる。
Netlifyのデプロイ状況は https://app.netlify.com/ で確認できる。

---

## note記事作成ルール（AI執筆時の必須事項）

記事をAIで作成する際は、以下の8つのプロンプトを必ず適用して「AI感ゼロ」に仕上げること。

### ①会話調変換
「プロ編集者としてこの文章を会話調に修正して。AIっぽい言い回しや硬い構造は削除し、意味は変えずに自然な文章へ整えて。」

### ②人間っぽさ追加
「実際に経験した人が書いたような自然な文体に修正して。AI特有のテンプレ表現や形式的な言い回しは避けて。」

### ③語りかけ変換
「仲の良い専門家が読者に話しかけるような自然な会話調へ変換して。教科書的な説明は避けて。」

### ④感情追加
「人間らしい感情や温度感を加えて。単調な文章を避け、強弱のある読みやすい文章にして。」

### ⑤AI感ゼロ化
「AIが書いたと感じさせない文章に修正して。文の長さに変化をつけ、自然な表現へ整えて。内容は変更しないで。」

### ⑥リズム改善
「文章のテンポを改善して。文の長さに変化をつけ、繰り返し表現や予測可能な言い回しは削除して。」

### ⑦自然体変換
「着飾った表現を避け、自然で率直な言葉へ修正して。一番伝えたい内容が明確に伝わる文章にして。」

### ⑧仕上げ
「この文章を最終版として整えて。実在する人物が書いたような自然なトーンと構成に修正して。」
