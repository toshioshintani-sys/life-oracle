# RESOLVED_FACTS — 確定事実・解決済み台帳（真実源）

> 委員会(`scripts/committee.py`)が会議冒頭で読む「いま何が解決済み・設定済みか」の真実源（AUTONOMY §2「真実源」）。
> **目的**：解決済みの論点を「未着手・未設定」として蒸し返さない／古い前提を本日の新情報で更新する。
> 制定：2026-06-13。proposal-stress-test 済。

---

## 🔑 運用ルール（これを守らないと真実源が逆に事故る）

1. **解決したら、その日のうちにここへ追記する**（人＋Claude の癖）。追記しない台帳は陳腐化し、委員会が古い"確定事実"を盲信する＝より悪い事故になる。
2. **各項目に as-of 日付を必ず付ける**。日付の古い項目は「再検証の候補」。
3. **検知（コード）と解釈（プロンプト）は層を分ける**。障害の検知は `committee.py` の原則7（成果ゼロ→Slack通知）や `daily_report.py` 等の**コード**が担う＝この台帳のプロンプト判断では握りつぶせない。本台帳は「既に済んだことを蒸し返さない」ための参照であり、**新障害を隠すものではない**。
4. **本日の実データ・ログが確定事実と矛盾したら、委員会は即「確定事実の更新要」として再提起する**（例：「GA4は稼働中」とあるのに本日 401/取得失敗が出たら、済み扱いをやめて継続審議へ）。

---

## 確定事実（as-of 付）

### GA4 計測基盤 — 設定済み・稼働中（as-of 2026-06-08）
- GitHub Secrets `GA4_PROPERTY_ID` / `GOOGLE_CREDENTIALS_JSON` は **2026-06-08 に登録済み**。クラウド委員会/daily_report は **実データを取得できている**（2026-06-13 の data担当が「セッション2/ユーザー1/PV2/滞在49秒」を取得）。
- ✅ **「GA4 Secrets を登録してください」という俊雄さんへの依頼は出さない**（済み）。
- 🔧 **残課題（別物）**：診断ファネルの**カスタムイベント**（`diagnosis_start` / `question_view` / `diagnosis_complete` 等）が**アプリ(`life-oracle-v2`)に未実装**。これは Secret でなく**アプリ側のコード作業**。完走率・離脱設問はこれが入るまで算出不可。

### gachijin パイプライン — 引退（as-of 2026-06-13・[[NOT_DOING.md]] #8）
- gachi は2026-11月まで予約完了済み＝パイプラインは役目を終えている。`gachijin-pipeline` / `gachijin-scheduler` の古いCI失敗（直近実行2026-05-08）は**無視してよい**。修復を律速・最優先として採択しない。daily_report も `RETIRED_WORKFLOW_KEYWORDS` で報告・再実行から除外済み。

### 委員会のクラウド自動稼働 — 稼働中（as-of 2026-06-13）
- `committee-research.yml`(10:00 JST) / `committee-meeting.yml`(14:00) / `daily-report.yml`(08:00) は **main にあり定時稼働中**。「委員会のクラウド稼働準備」は完了＝未着手扱いしない。
- committee.py は計画拘束（WEEKLY_SPRINT/NOT_DOING/本台帳を読む）＋DO-NOT-ADOPT除外＋執行レビュー込み。

### Anthropic API キー — GitHub Secret 同期済み（as-of 2026-06-13）
- 2026-06-11〜13 に 401(invalid x-api-key) で委員会が4日停止 → ローカルの有効キーを `ANTHROPIC_API_KEY` Secret に同期して復旧。
- ⚠️ **キーをローテしたら GitHub Secret も `gh secret set ANTHROPIC_API_KEY` で必ず更新**（ローカル .env だけだとクラウドが401で止まる）。

---
*更新：解決・設定が確定した事項を as-of 付で追記。古くなった/矛盾が出た項目は日付を更新するか削除する。*
