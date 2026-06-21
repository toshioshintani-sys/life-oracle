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
- 🔧 **診断ファネルのカスタムイベント — 大半が実装済み（as-of 2026-06-19 コードで確認）**：`life-oracle-v2/src/lib/analytics.js` の `trackEvent()`（→`window.gtag('event',...)`）経由で、**`app_loaded` / `quiz_start`（mbti/situation/attack）/ `quiz_complete`（mbti_type・jin_id付）/ `result_share_intent` / `lead_captured` が既に発火している**。
  - ✅ **完走率は今すぐ算出可能**（`quiz_start`数 vs `quiz_complete`数）。「完走率が算出不可」は**誤り**＝この前提で蒸し返さない。`diagnosis_start`/`complete` は **名称違いで実体は実装済み**（`quiz_start`/`quiz_complete`）。
  - ❌ **唯一の未実装＝`question_view`（設問ごとの閲覧イベント）**。これだけが「どの設問で離脱したか（離脱設問）」の算出に必要。残るアプリ側コード作業はこの1イベントのみ。
  - ⚠️ 委員会/データ担当が「カスタムイベント未実装・完走率算出不能」を繰り返してきたのは、本台帳のこの項目が不正確だったため（2026-06-19 修正）。

### gachijin パイプライン — 引退（as-of 2026-06-13・[[NOT_DOING.md]] #8）
- gachi は2026-11月まで予約完了済み＝パイプラインは役目を終えている。`gachijin-pipeline` / `gachijin-scheduler` の古いCI失敗（直近実行2026-05-08）は**無視してよい**。修復を律速・最優先として採択しない。daily_report も `RETIRED_WORKFLOW_KEYWORDS` で報告・再実行から除外済み。

### 委員会のクラウド自動稼働 — 稼働中（as-of 2026-06-13）
- `committee-research.yml`(10:00 JST) / `committee-meeting.yml`(14:00) / `daily-report.yml`(08:00) は **main にあり定時稼働中**。「委員会のクラウド稼働準備」は完了＝未着手扱いしない。
- committee.py は計画拘束（WEEKLY_SPRINT/NOT_DOING/本台帳を読む）＋DO-NOT-ADOPT除外＋執行レビュー込み。

### Anthropic API キー — GitHub Secret 同期済み（as-of 2026-06-13）
- 2026-06-11〜13 に 401(invalid x-api-key) で委員会が4日停止 → ローカルの有効キーを `ANTHROPIC_API_KEY` Secret に同期して復旧。
- ⚠️ **キーをローテしたら GitHub Secret も `gh secret set ANTHROPIC_API_KEY` で必ず更新**（ローカル .env だけだとクラウドが401で止まる）。

### stress_test baseline — 記録済み（as-of 2026-06-14）
- `life-oracle-v2/scripts/stress_test.mjs` を実行し `scripts/baseline.json` に保存：**dist gzip 291.7KB / build 9.0秒 / 診断計算 0.22ms（中央値）**。
- ✅ **「stress_test baseline を記録せよ」の3回連続持ち越しは解消**。委員会は再提案しない（次は回帰検知＝baselineとの比較に進む）。

### GSC（Google Search Console）連携 — 連携済み・稼働中（as-of 2026-06-14）
- **サービスアカウント方式で連携完了**。SA `life-oracle-ga4@gen-lang-client-0791471309.iam.gserviceaccount.com` を Search Console の `https://life-oracle.jp/` に siteFullUser で追加済み＋GCPで Search Console API 有効化済み。SA実APIで疎通確認済み。
- 委員会 SEO担当は `get_gsc_stats()`（`daily_report.py`）経由で**GSC実データ（直近28日のクリック/表示/上位クエリ）を取得**。クラウドは `GOOGLE_CREDENTIALS_JSON`(同一SA)、ローカルは `monitoring/config/ga4-sa.json`(発行したSA鍵)。
- ⚠️ OAuth(gcloud ADC)方式は Google にブロックされる（汎用クライアント＋機微スコープ）ため**SA方式が正**。`adc.json`(ユーザーADC)はGA4専用(analyticsのみ)。
- ✅ **「GSC連携を」「所有権確認を」の再依頼は出さない（済み）。** 連携は機能。残課題は「検索に載る」だが、その真因は下記（コンテンツでなく重複）。

### GA4/GSC 徹底調査 — アプリSEO不振の真因特定＋計測実態（as-of 2026-06-19・実API確認）
- 🔴 **アプリが検索に載らない真因＝Netlify生サブドメインが正規URLを奪っていた（修正済）**：GSC URL検査で `googleCanonical=https://incredible-llama-51caa2.netlify.app/`＝life-oracle.jpは重複扱い。`life-oracle-v2/netlify.toml` にホスト301（netlify.app/*→life-oracle.jp）を追加・デプロイ済（curlで301確認）。**SEO不振はコンテンツ不足でなくこの重複が真因**＝「記事を増やせ/タイトルだけ直せ」で蒸し返さない。次＝Google再クロール＋GSCインデックス登録リクエスト（俊雄さん操作）。
- 🔴 **note記事のインデックスはGSCで不可視**：note.com＝別ドメイン・所有外。委員会の「GSCでnote記事を点検」は前提誤り＝再提案しない（site:検索のみ・US-IPでは不発）。
- 🔧 **GA4ローカル読み取りは権限不足**：ローカルSAはGA4プロパティのViewer権限ゼロ（GSCには有）。`monitoring/config/sites.json`の life-oracle.jp=`534433669` はSAから読めず＝誤りor権限未付与。GA4 Admin APIはGCPで無効でプロパティ自動特定不可。**クラウド日次は取得成功**。→ 俊雄さん操作待ち（SAをpropertyにViewer追加／Admin API有効化 or `GA4_PROPERTY_ID`値開示）。済むまでローカルGA4は乖離。
- ✅ **question_view 実装済（2026-06-19デプロイ）**：離脱設問も算出可能に（完走率は元から quiz_start/complete で算出可）。詳細＝`tasks/committee/ga4_gsc_investigation_2026-06-19.md`。

### GA4 海外（US）流入の正体 — 非エンゲージのノイズ＝英語化の根拠にならない（as-of 2026-06-21・GA4実UI確認）
- 🔴 **「異常値メール＝海外流入」を英語化の判断材料にしない（否）**。GA4「ユーザー属性の詳細：国」（過去28日 5/24-6/20）の実数：**US＝15ユーザー（最多）だがエンゲージのあったセッションは1件のみ（全体の5.88%）・エンゲージメント率6.67%・1ユーザーあたりエンゲージ0.07**。対して **Japan＝エンゲージ15件（全体の88.24%）・エンゲージ率68.18%**。∴ **28日で診断に実際に触れたセッションの88%は日本、海外(US)は1件だけ**＝海外流入は実質ほぼ非エンゲージ（直帰/ボット/クローラ/Netlify自動アクセス＝先日301した生netlify.app含む）。異常値メールは母数極小ゆえ非エンゲージのスパイクをGA4が異常検知しただけ＝実需ではない。
- ⚠️ US平均エンゲージ時間1分52秒は**エンゲージ率6.67%と矛盾するn=1小標本アーティファクト**＝「海外の人間が熱心」と読むのは誤読。信頼すべきは率(6.67%)と件数(1)。
- ✅ **英語化の再検討トリガー＝海外の「エンゲージのあったセッション」が複数月で持続した時のみ（目安：月30件+・エンゲージ率40%+）。** 閾値はユーザー数(膨らみやすい)でなく**エンゲージ件数**。現状は28日でUSエンゲージ1件＝トリガー未達。委員会は「海外流入→英語化」で蒸し返さない。
- 🟢 **参照元レベルの裏付け（2026-06-21・GA4「トラフィック獲得」参照元/メディア・28日）＝note翻訳由来の海外読者説は否定／noteファネルは機能**：本物の人間流入は**全てnote由来**＝`note/article`(10セッション・エンゲージ率50%)＋`note.com/referral`(4セッション・**エンゲージ率100%・平均4分21秒**)で**全エンゲージ17件中9件(53%)を供給**＝記事CTA→アプリ導線は効いている（＝「届け方＝note」は正しく回っている・俊雄さんの「認知はnoteのみ」認識が正）。一方 海外(US)の正体は**note非経由**＝`(not set)`4セッションが**0エンゲージなのに724イベント/セッション(≒2,900イベント)** のJS実行型ボット＋`(direct)/(none)`の非エンゲージ分（米data center IP）。∴ もしnote翻訳で海外読者が流入なら`note/article`がUS地理＋エンゲージで出るはずだが、note由来は全てエンゲージ(=日本)。**海外流入=ボット確定・英語化根拠でない**。副次：`(not set)`724イベント/セッションは異常値＝GA4ボット除外設定 or question_viewの外部クローラ暴発を一度点検する価値（ただし実ユーザーのバグではない・(not set)4セッションに限局）。

---
*更新：解決・設定が確定した事項を as-of 付で追記。古くなった/矛盾が出た項目は日付を更新するか削除する。*
