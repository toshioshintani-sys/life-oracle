# Thumbnail Forge — 引き継ぎ書

## プロジェクト概要

note.jp / Substack / Pinterest 向けサムネイル画像を、複数のAIモデルに並列生成させて比較・ダウンロードできる Web アプリ。

- **本番 URL**: https://thumbnail-forge.netlify.app
- **リポジトリ**: toshioshintani-sys/life-oracle（`thumbnail-forge/` サブディレクトリ）
- **ホスティング**: Netlify（GitHub 連携、main マージで自動デプロイ）

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | React 18 + Vite + TypeScript + Tailwind CSS |
| バックエンド | Netlify Functions (TypeScript) |
| 画像生成 | Gemini `gemini-2.5-flash-image` / OpenAI `gpt-image-1` |
| プロンプト生成 | Gemini `gemini-2.5-flash` / OpenAI `gpt-4o-mini` |
| docx パース | `mammoth` npm パッケージ |

---

## ディレクトリ構成

```
thumbnail-forge/
├── netlify/functions/
│   ├── generate-gemini.ts     # Gemini 画像生成
│   ├── generate-openai.ts     # OpenAI 画像生成
│   ├── generate-flux.ts       # FLUX（UI非表示・コードは保存済み）
│   └── generate-prompt.ts     # 記事テキスト → 画像プロンプト変換
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── ArticleUpload.tsx      # 記事 (.md/.txt/.docx) アップロード
│   │   ├── PromptInput.tsx        # プロンプト入力
│   │   ├── AspectRatioSelector.tsx
│   │   ├── ModelSelector.tsx
│   │   ├── StyleSettings.tsx      # 世界観設定（キーワード/色/雰囲気）
│   │   ├── TextOverlaySettings.tsx # テキスト合成設定 ← 新規
│   │   ├── ImageGrid.tsx
│   │   ├── ImageCard.tsx          # ダウンロード + テキスト合成 ← 更新
│   │   └── PromptHistory.tsx
│   ├── hooks/
│   │   └── useGeneration.ts
│   └── lib/
│       ├── types.ts               # 型定義（TextOverlay 追加済み）
│       ├── api.ts                 # Netlify Functions 呼び出し
│       ├── storage.ts             # localStorage（履歴/設定/使用回数）
│       ├── styleUtils.ts          # スタイルキーワード → 英語プロンプト変換
│       └── textOverlay.ts         # Canvas テキスト合成ユーティリティ ← 新規
└── netlify.toml
```

---

## 環境変数（Netlify ダッシュボードで設定済み）

| 変数名 | 用途 |
|---|---|
| `GEMINI_API_KEY` | Gemini API |
| `OPENAI_API_KEY` | OpenAI API |
| `REPLICATE_API_TOKEN` | FLUX用（未設定・機能非表示） |

**セキュリティ要件（変更禁止）:**
- API キーは Netlify 環境変数で管理。ハードコード禁止
- フロントエンドから外部 API を直叩きしない。すべて Netlify Functions 経由

---

## 現在の PR 状況

**PR #8** `claude/thumbnail-forge-setup-zZMCC` → `main`
- URL: https://github.com/toshioshintani-sys/life-oracle/pull/8
- CI: 全チェック通過済み（Netlify Deploy Preview 成功）
- ステータス: **マージ待ち**（Draft PR）

---

## PR #8 の変更内容

### 1. プロンプトスタイル改訂（`generate-prompt.ts`）
記事アップロード時の AI プロンプト生成を**マンガ/アニメイラスト風**に変更。
- Before: フォトリアル・汎用スタイル
- After: manga/anime illustration、高コントラスト配色（黄・赤・橙）、誇張表情、シンプル背景

### 2. 「マンガ/アニメ」スタイルキーワード追加
世界観設定に「マンガ/アニメ」を追加。手動プロンプト入力時もスタイルを付与できる。

### 3. テキスト合成機能（新規）
**課題**: ユーザーが note.jp に投稿する際、タイトル文字を画像に入れる作業が最大のストレスだった。  
**解決策**: ブラウザの Canvas API で日本語テキストを画像に直接焼き込み、Canva 等の外部ツール不要で完結。

| 機能 | 詳細 |
|---|---|
| タイトル（大） | Bold フォント、画像高さの 6.8% サイズ |
| サブタイトル（小） | 通常フォント、画像高さの 3.8% サイズ |
| 文字色 | 白 / 黄 (#FFD700) / 黒 |
| テキスト位置 | 上部 / 下部 |
| グラデーションスクリム | テキスト可読性確保のため自動付与 |
| 日本語折り返し | Canvas measureText で文字単位で自動折り返し |
| ダウンロード | テキスト合成済み PNG を Canvas.toDataURL で出力 |
| プレビュー | CSS 絶対配置でリアルタイム確認可能 |

---

## 既知の制限・注意点

### FLUX（Replicate）
`generate-flux.ts` はコードとして保存済みだが、UI から非表示。  
再有効化する場合は以下の3箇所をアンコメント:
- `src/components/ModelSelector.tsx` L11
- `src/App.tsx` の selectedModels 初期値
- `src/hooks/useGeneration.ts` L17

### 生成画像のスタイルギャップ
AIが「マンガ風」を生成できるかはモデル依存。現在の SYSTEM_PROMPT では manga/anime illustration を強く指定しているが、完全に一致するとは限らない。より精度を上げるには:
- LoRA を使った画像生成モデル（Stable Diffusion 系）への切り替えを検討
- または: テキスト合成機能で視覚的補完（現在実装済み）

### Canvas テキストのフォント
Netlify Functions ではなくブラウザ側 Canvas で処理するため、ユーザーの OS フォントに依存。日本語フォントが入っていない環境では sans-serif にフォールバック。

---

## 残タスク（優先度順）

1. **PR #8 をマージ** → 本番反映
2. （任意）REPLICATE_API_TOKEN を Netlify に設定 → FLUX を再有効化
3. （任意）フォント埋め込み対応 → Canvas のフォントを統一（FontFace API）
4. （任意）テキストオーバーレイのフォントサイズを手動調整できる UI の追加

---

## 開発ガイド

```bash
# ローカル開発
cd thumbnail-forge
npm install
# Netlify Functions も含めてローカル起動する場合は Netlify CLI が必要
# GEMINI_API_KEY / OPENAI_API_KEY を .env.local に設定

# ビルド確認
npm run build
```

開発ブランチ: `claude/thumbnail-forge-setup-zZMCC`  
本番ブランチ: `main`（マージ = 自動デプロイ）
