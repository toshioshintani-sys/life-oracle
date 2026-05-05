# Gachijin Pipeline — Preflight Checklist

本番投入前のセットアップ確認スクリプト群。順番に通せば、本番ジョブが動かない原因の99%を事前検出できる。

---

## 前提

- Python 3.11 以降
- `pip install -r scripts/requirements.txt`
- 必要に応じて `netlify-cli` (`npm i -g netlify-cli`) と `gh` CLI

---

## チェックリスト

### 1. ローカル dry-run（API依存なし）

```powershell
python -X utf8 scripts/gachijin_orchestrator.py --dry-run
```

期待: `var/gachijin/jobs/local-xxxx/` に15ファイル生成。失敗時はテスト手前で構造の問題が出ているので、まずそれを修正する。

---

### 2. Supabase 接続

```powershell
$env:SUPABASE_URL = "https://xxxxx.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "eyJ..."
$env:SUPABASE_STORAGE_BUCKET = "gachijin"   # 任意

python -X utf8 scripts/preflight/check_supabase.py
```

検証内容:
- 環境変数の存在
- `jobs` / `job_outputs` / `job_logs` テーブルの到達性
- Storage bucket の存在（指定時）
- 各テーブルへの insert／delete 権限
- Storage への upload／delete 権限

`__preflight__` という捨てジョブを作成→検証→削除する。失敗時は migration が未適用、または Service Role Key が誤り。

---

### 3. 外部API疎通（Anthropic / OpenAI / note.com）

```powershell
$env:ANTHROPIC_API_KEY = "sk-ant-..."
$env:OPENAI_API_KEY = "sk-proj-..."
$env:NOTE_SESSION_TOKEN = "xxx_32_chars"
$env:NOTE_USERNAME = "lifeoraclejp"

python -X utf8 scripts/preflight/check_apis.py
```

検証内容:
- Anthropic: `claude-haiku-4-5` で 1-token 完了が走ること
- OpenAI: モデル一覧が取れて `gpt-image-1` が含まれること
- note.com: `_note_session_v5` で Cookie 認証が通ること（401/403 が出たら Cookie 失効）

---

### 4. note 下書きスモークテスト（実際にAPIを叩く）

```powershell
python -X utf8 scripts/preflight/smoke_note_draft.py
```

または既存サムネで eyecatch アップロードまで検証:

```powershell
python -X utf8 scripts/preflight/smoke_note_draft.py `
  --thumbnail var/gachijin/jobs/sample-bandwagon/final_day1.png
```

- デフォルトで下書き作成→検証→自動削除
- `--keep` を付けると残す（ダッシュボードで目視確認したい時）

note ダッシュボード（https://editor.note.com/）で、下書きが消えていれば成功。

---

### 5. Netlify環境変数

```powershell
netlify login          # 初回のみ
netlify link            # プロジェクトをリンク（初回のみ）
python -X utf8 scripts/preflight/check_netlify.py
```

期待:
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`
- `GITHUB_ACTIONS_TOKEN` または `GITHUB_TOKEN`
- `GITHUB_REPO` (`toshioshintani-sys/life-oracle`)
- `GITHUB_BRANCH` （任意・未指定時 main）
- `GACHIJIN_WORKFLOW_ID` （任意・未指定時 `gachijin-pipeline.yml`）
- `SUPABASE_STORAGE_BUCKET` （任意）

足りない値は Netlify ダッシュボード `Site configuration → Environment variables` から追加。

---

### 6. GitHub Actions secrets

```powershell
$env:GITHUB_ACTIONS_TOKEN = "ghp_xxx"  # workflow scope 必須
$env:GITHUB_REPO = "toshioshintani-sys/life-oracle"

python -X utf8 scripts/preflight/check_github.py
```

検証内容:
- Token 認証 OK
- ワークフローファイル `gachijin-pipeline.yml` の存在
- 必須 secrets 全部が設定されていること:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `ANTHROPIC_API_KEY`
  - `OPENAI_API_KEY`
  - `NOTE_SESSION_TOKEN`
  - `NOTE_USERNAME`

足りない値は `gh secret set NAME` で投入:

```powershell
gh secret set ANTHROPIC_API_KEY --repo toshioshintani-sys/life-oracle
# 値はプロンプトで貼り付け（コマンドラインに残らない）
```

---

## 全部一気に流す

```powershell
python -X utf8 scripts/gachijin_orchestrator.py --dry-run; `
python -X utf8 scripts/preflight/check_supabase.py; `
python -X utf8 scripts/preflight/check_apis.py; `
python -X utf8 scripts/preflight/check_netlify.py; `
python -X utf8 scripts/preflight/check_github.py
```

すべて `PASS` が出れば、`/gachijin` UI から `draft_only` で本番ジョブを1件流す段階に進める。

---

## 本番投入の安全な順序

1. ローカル dry-run（このREADME ステップ1）
2. Preflight 全部 PASS（ステップ 2〜6）
3. `/gachijin` から **`draft_only`** で1件投入 → note ダッシュボードで下書き目視確認
4. **smoke_note_draft.py** 単体で1件 → 削除も含めて成功確認
5. `/gachijin` から **`schedule_publish`** で1テーマだけ予約投稿 → note 予約日時を目視確認
6. 連続3テーマで安定稼働を確認 → 自動運用を有効化

各ステップで失敗したら、ログを見てから次に進む。いきなり `schedule_publish` を3件叩かない。
