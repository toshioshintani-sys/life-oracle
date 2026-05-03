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

## Self-Improvement

- **セッション開始時**：`tasks/lessons.md` を最初に読む
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
