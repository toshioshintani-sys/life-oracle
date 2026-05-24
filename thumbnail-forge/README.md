# Thumbnail Forge

マルチモデル画像生成ツール。1つのプロンプトから **Gemini / OpenAI GPT Image / FLUX** に並列リクエストし、結果を1画面で見比べてダウンロードできます。note・Substack・Pinterest のサムネイル運用を想定。

---

## 必要な環境変数

| 変数名 | 用途 | 取得先 |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini 画像生成 | [Google AI Studio](https://aistudio.google.com) → API Keys |
| `OPENAI_API_KEY` | OpenAI GPT Image | [OpenAI Platform](https://platform.openai.com/api-keys) → API Keys |
| `REPLICATE_API_TOKEN` | FLUX via Replicate | [Replicate](https://replicate.com/account/api-tokens) → API Tokens |

### ローカル開発での設定方法

```bash
cp .env.example .env
# .env を編集してキーを貼り付ける
```

**`.env` は `.gitignore` に含まれているため Git にはコミットされません。**

---

## ローカル開発の起動手順

```bash
# 依存パッケージのインストール
npm install

# Netlify CLI のインストール（未インストールの場合）
npm install -g netlify-cli

# 開発サーバーの起動（Netlify Functions 込み）
netlify dev
```

`netlify dev` が使えない場合：

```bash
# フロントエンドのみ（API 機能は使えない）
npm run dev
```

---

## Netlify へのデプロイ手順

1. GitHub にリポジトリを作成してプッシュ
2. [Netlify](https://app.netlify.com) で「Add new site → Import an existing project」
3. GitHub リポジトリを選択
4. ビルド設定は自動検出（`netlify.toml` に定義済み）
5. **環境変数の設定**：Site settings → Environment variables で以下を追加：
   - `GEMINI_API_KEY`
   - `OPENAI_API_KEY`
   - `REPLICATE_API_TOKEN`
6. 「Deploy site」をクリック

---

## 使用モデルと参考コスト（1枚あたり）

| モデル | API | 参考コスト | 備考 |
|---|---|---|---|
| Gemini 2.5 Flash Image | Google AI | 無料枠あり / ~$0.039 | `gemini-2.5-flash-image` |
| GPT Image 1 | OpenAI | $0.04〜$0.08 | 品質設定により変動 |
| FLUX 1.1 Pro | Replicate | ~$0.04 | `black-forest-labs/flux-1.1-pro` |

**1日の生成上限**: アプリ内で累計100回を超えると警告（localStorage 管理）。

---

## 動作確認用テストプロンプト

```
A serene Japanese tea garden at dawn, soft morning mist,
traditional wooden bridge over koi pond, cherry blossoms
falling, cinematic lighting, photorealistic, 4K detail
```

---

## トラブルシューティング

### 「APIエラー」と表示される

- Netlify dashboard の環境変数が正しく設定されているか確認
- API キーの権限・残高を各プロバイダーのダッシュボードで確認

### FLUX の画像が表示されない

- Replicate は非同期処理のため、生成に5〜30秒かかることがあります
- `REPLICATE_API_TOKEN` が正しいか確認

### Gemini が動かない

- `GEMINI_API_KEY` は Google AI Studio（`aistudio.google.com`）で発行したものを使用
- `gemini-2.5-flash-image` モデルは画像生成に対応した API キーが必要

### ローカルで CORS エラーが出る

- `netlify dev` 経由でアクセスしているか確認（`npm run dev` 単体では Functions が動きません）
