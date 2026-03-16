# ライフオラクル Webアプリ

引き継ぎドキュメントの仕様に基づく React アプリです。

## 技術構成

- **フロント**: React 18 + Vite 5
- **ホスティング**: Netlify（`netlify.toml` 設定済み）
- **データ**: `public/data/` に JSON を配置（静的）

## 起動方法

```bash
cd "c:\Users\user\Desktop\ライフオラクル"
npm install
npm run dev
```

ブラウザで http://localhost:5173 を開く。

## ビルド・デプロイ

```bash
npm run build
```

`dist/` が出力されます。Netlify ではこのフォルダを publish に指定してください。

## データファイル

- **`public/data/type_profiles.json`**  
  16タイプ分の「大絶賛」「心の癖」テキスト。キーは `Te-光`, `Te-影` など。

- **`public/data/prescriptions.json`**  
  処方箋テキスト。キーは `{職種}_{タイプID}_{年代}`（例: `会社員_Te-光_30代`）。  
  **Excel から JSON への変換手順:**
  1. `ライフオラクル_処方箋_全職種マスター.xlsx` を「ライフオラクル」フォルダに置く
  2. コマンドプロンプトで次を実行:
     ```
     cd "C:\Users\user\Desktop\ライフオラクル"
     pip install openpyxl
     python excel_to_prescriptions_json.py
     ```
  3. `public/data/prescriptions.json` が 2,016 件分で上書きされる（Excel に「職種」「タイプID」「年代」「本文」の列があること）

## 画面フロー

1. イントロ → 2. 職種選択（18種）→ 3. 年代選択（7種）→ 4. ユング15問 → 5. バイアス16問 → 6. 結果（タイプ・大絶賛・心の癖・バイアス・処方箋・個人専用プロンプト・Xシェア）

## デザイン

- 背景: `#0f0f1a`
- カード: `#1a1a2e`
- アクセント: `#C4940A`（ゴールド）
- フォント: Hiragino Sans（日本語）
