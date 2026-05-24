# Thumbnail Forge メンテナンスガイド

このファイルには、AIモデルのバージョンアップや仕様変更が起きたときに使う**AIへの指示プロンプト**をまとめています。
Claude、ChatGPT などに貼り付けて使ってください。

---

## 基本的な使い方

1. このリポジトリを Claude Code（または ChatGPT with Code Interpreter）に読み込ませる
2. 下記のプロンプトをコピーして貼り付ける
3. 指示に従ってコードを修正してもらう
4. Netlify に再デプロイする

---

## ■ Gemini のモデル名が変わった場合

```
netlify/functions/generate-gemini.ts を開いてください。
現在のモデル名「gemini-2.5-flash-image」を新しいモデル名「[ここに新しいモデル名]」に変更してください。
また、APIエンドポイントや generationConfig の形式に変更があれば、
https://ai.google.dev/gemini-api/docs/image-generation の最新ドキュメントを確認して修正してください。
```

---

## ■ OpenAI のモデル名が変わった場合

```
netlify/functions/generate-openai.ts を開いてください。
現在のモデル名「gpt-image-1」を新しいモデル名「[ここに新しいモデル名]」に変更してください。
また、サポートされる size パラメータに変更があれば、SIZE_MAP の値も更新してください。
最新の仕様は https://platform.openai.com/docs/api-reference/images で確認してください。
```

---

## ■ FLUX のモデル名が変わった場合（Replicate）

```
netlify/functions/generate-flux.ts を開いてください。
現在のモデルパス「black-forest-labs/flux-1.1-pro」を新しいモデルパス「[ここに新しいパス]」に変更してください。
Replicate のモデルページ（https://replicate.com/black-forest-labs）で最新のモデル名と
input パラメータを確認し、必要に応じて aspect_ratio などのパラメータ名も修正してください。
```

---

## ■ 記事→プロンプト生成で使うモデルを変えたい場合

```
netlify/functions/generate-prompt.ts を開いてください。
callGemini 関数内のモデル名「gemini-2.0-flash」を「[新しいモデル名]」に変更してください。
または callOpenAI 関数内のモデル名「gpt-4o-mini」を「[新しいモデル名]」に変更してください。
```

---

## ■ 新しい画像モデルを追加したい場合

```
Thumbnail Forge に新しい画像生成モデルを追加したいです。

追加したいモデル: [モデル名・プロバイダー]

以下の作業をお願いします:
1. netlify/functions/ に generate-[モデルID].ts を新規作成（既存の generate-gemini.ts を参考に）
2. src/lib/types.ts の ModelId 型に新しいモデルIDを追加
3. src/lib/api.ts の ENDPOINT マップに追加
4. src/components/ModelSelector.tsx の MODELS 配列に追加
5. src/components/ImageCard.tsx の MODEL_LABEL に追加
6. src/hooks/useGeneration.ts の INITIAL_RESULTS に追加

APIの仕様は [公式ドキュメントURL] を参照してください。
```

---

## ■ スタイルキーワードを追加・変更したい場合

```
src/components/StyleSettings.tsx の KEYWORDS 配列と、
src/lib/styleUtils.ts の KEYWORD_EN マッピングに新しいキーワードを追加してください。

追加したいキーワード（日本語）: [キーワード]
英語での表現（画像生成プロンプト向け）: [英語表現]
```

---

## ■ エラーが出て動かない場合の診断依頼

```
Thumbnail Forge でエラーが発生しています。

【エラー内容】
[ブラウザのコンソールまたは画面に表示されたエラーメッセージをここに貼り付け]

【発生する操作】
[どのボタンを押したとき、どのファイルを読み込んだときなど]

【環境】
- Netlify のデプロイ or ローカル（netlify dev）
- 発生したモデル: Gemini / OpenAI / FLUX / プロンプト生成

上記の情報をもとに、原因と修正方法を教えてください。
関連するファイル（netlify/functions/*.ts, src/hooks/useGeneration.ts 等）も確認してください。
```

---

## ■ 全体的なアップデート依頼（年次メンテナンス）

```
Thumbnail Forge の年次メンテナンスをお願いします。

1. package.json の依存パッケージを最新バージョンに更新してください
2. 各APIの現在のモデル名・エンドポイントを最新仕様に合わせてください
   - Gemini: https://ai.google.dev/gemini-api/docs/models
   - OpenAI: https://platform.openai.com/docs/models
   - FLUX (Replicate): https://replicate.com/black-forest-labs
3. 変更点の概要を教えてください
```

---

## ファイル構成（修正時の参照用）

```
netlify/functions/
  generate-gemini.ts   ← Gemini画像生成
  generate-openai.ts   ← OpenAI画像生成
  generate-flux.ts     ← FLUX画像生成（Replicate）
  generate-prompt.ts   ← 記事→プロンプト変換（LLM）

src/
  lib/
    types.ts           ← 型定義（ModelId, AspectRatio, StyleSettings等）
    api.ts             ← フロント→Functions呼び出し
    storage.ts         ← localStorage管理
    styleUtils.ts      ← 世界観設定のプロンプト変換
  hooks/
    useGeneration.ts   ← 並列生成ロジック
  components/
    PromptInput.tsx    ← プロンプト入力
    ArticleUpload.tsx  ← 記事ファイル投入
    StyleSettings.tsx  ← 世界観設定パネル
    ModelSelector.tsx  ← モデル選択
    AspectRatioSelector.tsx ← アスペクト比
    ImageGrid.tsx      ← 結果グリッド
    ImageCard.tsx      ← 個別画像カード
  App.tsx              ← メインレイアウト
```
