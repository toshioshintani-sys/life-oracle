# Dispatch指示書 — GA4 GitHub Secrets 登録

> 目的：`https://life-oracle.jp/` の人流データ（診断開始数・完了数・シェア数）を
> 毎朝 Slack に自動送信する。そのために GitHub Secrets に2つの値を登録する。

---

## あなたがやること（概要）

1. ローカルの `.env` に GA4 認証情報があるか確認する
2. あれば → GitHub Secrets にコピーするだけ
3. なければ → GCP でサービスアカウントを新規作成して登録
4. GitHub Actions を手動実行して Slack への送信を確認する

---

## Step 1：.env を確認する

以下のパスを開いて `GA4_PROPERTY_ID` と `GOOGLE_CREDENTIALS_JSON` の行があるか探す。

```
C:\Users\user\Desktop\Claude_work\world-oracle-staging\.env
```

**ある場合 → Step 2A へ**
**ない場合 → Step 2B へ**

---

## Step 2A：.env に値がある場合（簡単）

GitHub の以下の画面に進む：
```
https://github.com/toshioshintani-sys/life-oracle/settings/secrets/actions
```

「New repository secret」を2回クリックして、それぞれ登録する。

| Secret 名 | 値 |
|---|---|
| `GA4_PROPERTY_ID` | .env の `GA4_PROPERTY_ID=` の右辺（9桁の数字） |
| `GOOGLE_CREDENTIALS_JSON` | .env の `GOOGLE_CREDENTIALS_JSON=` の右辺（`{` で始まる JSON 全体） |

⚠️ `GOOGLE_CREDENTIALS_JSON` の値は JSON 全体をそのままペーストする（改行・スペース込みでOK）。

登録完了後 → **Step 3 へ**

---

## Step 2B：.env に値がない場合（GCP 新規作成）

### 2B-1. GA4 プロパティ ID を取得する

1. `https://analytics.google.com/` を開く
2. 左上のプロパティ名をクリック →「プロパティ設定」
3. 「プロパティID」欄の数字（9桁）をメモする
   - 例：`123456789`

### 2B-2. GCP サービスアカウントを作成する

1. `https://console.cloud.google.com/` を開く
2. プロジェクトは既存のものを使うか、新規作成する（名前は何でもよい）
3. 左メニュー「IAM と管理」→「サービスアカウント」
4. 「サービスアカウントを作成」をクリック
   - 名前：`life-oracle-ga4`（任意）
   - ロールは「なし」のまま作成する
5. 作成したサービスアカウントをクリック →「キー」タブ →「鍵を追加」→「新しい鍵を作成」→ JSON → ダウンロード
6. ダウンロードした JSON ファイルの中身をテキストエディタで開いてコピーする

### 2B-3. GA4 Data API を有効にする

1. GCP コンソールで「APIとサービス」→「ライブラリ」
2. 「Google Analytics Data API」を検索して「有効にする」

### 2B-4. サービスアカウントを GA4 に追加する

1. `https://analytics.google.com/` → 左下「管理」
2. 「アカウントのアクセス管理」→「+」→「ユーザーを追加」
3. メールアドレス：サービスアカウントのメール（例：`life-oracle-ga4@your-project.iam.gserviceaccount.com`）
4. 役割：「閲覧者」を選択して保存

### 2B-5. GitHub Secrets に登録する

```
https://github.com/toshioshintani-sys/life-oracle/settings/secrets/actions
```

| Secret 名 | 値 |
|---|---|
| `GA4_PROPERTY_ID` | 2B-1 でメモした9桁の数字 |
| `GOOGLE_CREDENTIALS_JSON` | 2B-6 でコピーした JSON 全体 |

---

## Step 3：動作確認（手動実行）

1. `https://github.com/toshioshintani-sys/life-oracle/actions/workflows/daily-report.yml` を開く
2. 「Run workflow」→「Run workflow」をクリック
3. 1〜2分後に Slack の `#daily-report` チャンネル（または設定済みのチャンネル）を確認
4. GA4 の行が `未設定` から数値に変わっていれば成功

---

## 確認したいこと（成功の定義）

Slack に届いたレポートの GA4 セクションが以下のようになっていること：

```
📊 GA4（昨日）
・ユーザー数: XX
・セッション数: XX
・診断開始 (quiz_start): XX
・診断完了 (quiz_complete): XX
```

数値が `0` でも `未設定` でなければ接続成功。

---

## 触らないこと

- `.env` ファイルを Git にコミットしない（.gitignore 済みだが念のため）
- `GITHUB_` プレフィックスのシークレット名は GitHub に弾かれるので使わない
- `GA4_PROPERTY_ID` と `GOOGLE_CREDENTIALS_JSON` 以外の Secrets は変更しない

---

## 詰まったとき

- GCP の API 有効化後、反映に数分かかる場合がある
- `GOOGLE_CREDENTIALS_JSON` に改行が含まれていてもそのまま貼ってよい
- サービスアカウントのメールを GA4 に追加し忘れると権限エラーになる

*作成: 2026-06-08 ライフオラクル*
