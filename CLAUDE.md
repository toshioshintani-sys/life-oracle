# ライフオラクル CLAUDE.md

Claude Codeが起動するたびに自動で読み込まれるプロジェクトルールです。

---

## プロジェクト基本情報

- **アプリ名**：ライフオラクル
- **本番URL**：https://incredible-llama-51caa2.netlify.app/
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
- バイアス追加メッセージ（128件）
- 偉人マッピング（16名）
- 光と影のマッピング（cognitiveFunctionMap）
- 診断質問データ（questions.js / biasQuestions.js）

---

## ファイル操作のルール

### 重要：実際にビルドされるファイル
**main.jsx は App_v8.jsx を読み込んでいる。**
結果ページの変更は必ず `src/App_v8.jsx` を編集すること。
`src/App.jsx` を編集してもビルドに反映されない。

### 大きな変更をするとき
App_v8.jsxを直接上書きしない。
App_v9.jsx として別ファイルで作り、動作確認後にmain.jsxのimportを更新する。

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
- ベースカラー：background: #0f0f1a（ダーク）
- テキスト：color: #e8e0d0
- フォント：Hiragino Sans, Hiragino Kaku Gothic ProN, Noto Sans JP, sans-serif

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

## よくある確認への回答

- LF will be replaced by CRLF → 無視してOK
- Do you want to overwrite App.jsx? → Noを選びApp_v2.jsxで保存
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
