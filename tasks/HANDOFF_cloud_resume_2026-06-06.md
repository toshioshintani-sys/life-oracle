# クラウド再開用 引き継ぎ書 — 2026-06-06

> ローカル（Windowsデスクトップアプリ）での作業をクラウド（GitHub/Codespace 側の Claude Code）が
> スムーズに再開するための自己完結メモ。クラウドはこの会話の記憶を持たず repo しか見えないため、ここに全部書く。
> **方針の前提**：GitHub（クラウド/Actions）が「基本（base）」。ローカルは「ローカルでしかできないこと」専用。

---

## 1. 現在地（事実）

- ブランチ：`claude/clarify-capabilities-cg3sQ`（origin と**完全同期・未pushゼロ**）
- 委員会（`scripts/committee.py`）はローカルで **2026-06-06 のフルサイクル（research→meeting）を実行成功**。
  `tasks/committee/reports/2026-06-06/`（ux/engine/data/seo）と `tasks/committee/LEDGER.md` に反映・push 済み。Slack 報告も送信済み。
- 直近コミット：`15a789d`（.gitignore に .env 追加）/ `d35dd02`（議事録）/ `25df234`（調査メモ）。

---

## 2. 最優先の次の一手（＝クラウドでやること）

**このブランチを `main` にマージする。** これが委員会のクラウド自動運用を起動する唯一の条件。

- 理由：GitHub Actions（`committee-research.yml` / `committee-meeting.yml` / `daily-report.yml`）の定時発火は **main からのみ**。委員会インフラ一式は今このブランチにしか無く main 未着。
- ⚠️ **重要**：このブランチは委員会だけでなく **アプリ本体の大改修（結果画面リニューアル）も載っている**。
  `origin/main...HEAD` 差分 = 32 files / **+1827 −408**（`App.jsx` `Result.jsx` `MbtiResult.jsx` `AttackResult.jsx` `Quiz.jsx` `App.css` `biasScorer.js` ほか）。
  **main マージ = 本番 life-oracle.jp にこのUI改修がデプロイされる**（Netlify 自動）。委員会を有効化するだけの軽い操作ではない。
- 手順：PR 作成 → 俊雄さんがUI改修込みでレビュー → **承認後**マージ（CHARTER：PR は俊雄さん承認なしにマージ禁止）→ Netlify デプロイ＋翌日から委員会 Actions が定時発火。

---

## 3. 委員会の動かし方（クラウド前提）

| フェーズ | コマンド | 動き |
|---|---|---|
| research（10:00 JST想定） | `committee.py --phase research` | 各担当が調査 → `reports/YYYY-MM-DD/<role>.md` にコミット |
| meeting（14:00 JST想定） | `committee.py --phase meeting` | 議長が議事録生成 → `LEDGER.md` 追記 → Slack 送信 |

- 必須 Secrets（GitHub・既存）：`ANTHROPIC_API_KEY` / `SLACK_WEBHOOK_URL`
- 任意 Secrets（未設定・下記6の依頼参照）：`GA4_PROPERTY_ID` / `GOOGLE_CREDENTIALS_JSON` /（将来）GSC
- content 担当＝隔日（年内通算日が偶数の日のみ）、sales 担当＝無効（将来枠）。

---

## 4. push 前ゲートは「クラウド用に正しい」— 触らないこと

- `.claude/settings.json` の PreToolUse フック + `.claude/pre-push-stress-gate.sh` のパスは Linux（`/home/user/life-oracle/...`）。
  これは **クラウド/Codespace 環境では正しい**。ローカル Windows では空振りするが、それは**意図どおり放置**（ローカルを GitHub の真似にしない方針）。
- **「Windows で動かす」ための移植はしないこと**（一度検討したが、base=クラウドでは正しいので取り下げ済み）。
- クラウドではゲートは生きている：`git push` 前に **proposal-stress-test（Step0→A→B→C）→ 俊雄さん承認 → `touch .claude/.stress-test-ok`（単回・30分失効）→ push**。

---

## 5. ローカルで完了済み・再実行/巻き戻し不要

- `.gitignore` に `.env` / `.env.local` / `.env.*.local` 追加（commit `15a789d`・push済み）。CLAUDE.md セキュリティ規約への追従。**.env は過去一度もコミットされておらず流出なし**。
- ローカル `.env`（gitignore済み・repoには無い）に `SLACK_WEBHOOK_URL`=（MORNING同値）を追加 = **ローカル手動実行用の stopgap**。クラウドは独自 Secret を使うので無関係。
- 兄弟プロジェクト `world-oracle-staging\.env` にも同キーを同期（ローカル限定・クラウド無関係）。

---

## 6. 委員会から俊雄さんへの依頼（06/06 LEDGER 要約・クラウドで催促すべき）

1. **GA4 プロパティID(9桁)＋測定ID の控え、サービスアカウントに「閲覧者」権限追加**（GA4は過去を遡れず1日の遅れがその日のデータ永久喪失）
2. **GitHub Secrets 登録可否の判断**（`GOOGLE_CREDENTIALS_JSON` / `GA4_PROPERTY_ID`）
3. **GSC（Search Console）連携の段取り**（SEO提案が全て推測ベースのため）
4. **俊雄さん自身が診断を1回完走し「どこで指が止まったか」共有**（GA4立ち上げ前の暫定ヒアリング）

詳細は `tasks/committee/LEDGER.md` の最新エントリ参照。

---

## 7. 未追跡のローカルファイル（repoに入れない）

`.netlify/functions/`（Netlifyローカルビルドキャッシュ）/ `market_research/`（ローカル作業データ）/ `.claude/launch.json`（ローカル設定）。いずれもソースではないので commit 不要。

---

*作成：2026-06-06 ローカルセッション終了時。次のクラウドセッションはまず本書と `tasks/committee/CHARTER.md` / `LEDGER.md` を読むこと。*
