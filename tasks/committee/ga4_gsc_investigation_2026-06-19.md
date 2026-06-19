# GA4・GSC 徹底調査レポート（2026-06-19）

> 実APIで確定させた計測の実態。SA=`life-oracle-ga4@gen-lang-client-0791471309.iam.gserviceaccount.com`。
> 調査スクリプト＝`monitoring/scripts/investigate_ga4_gsc.py`。

---

## 🔴 最重要発見：アプリが検索に載らない根本原因＝Netlify生サブドメインが正規URLを奪っている

GSC URL検査（`https://life-oracle.jp/`）の結果：

| 項目 | 値 |
|---|---|
| coverageState | **Duplicate, Google chose different canonical than user** |
| **googleCanonical** | **`https://incredible-llama-51caa2.netlify.app/`** ← Googleが正規と判断 |
| userCanonical | `https://life-oracle.jp/`（申告どおり） |
| verdict / robots / fetch | NEUTRAL / ALLOWED / SUCCESSFUL（クロール自体は成功） |
| referringUrls | netlify.appサブドメイン＋note記事 |

- **Netlifyのデフォルトサブドメイン `incredible-llama-51caa2.netlify.app` が301もnoindexもされず生稼働**（`curl -I` で HTTP 200・リダイレクトなし）。life-oracle.jp と同一中身を配信。
- `index.html` には `<link rel="canonical" href="https://life-oracle.jp/">` が**正しく入っている**。にもかかわらずGoogleは重複解決でnetlify.app側を正規に選択（サブドメインがクロール可能＋参照リンクが残るため）。
- 結果：**life-oracle.jp は「重複」として扱われ、検索評価がnetlify.app側へ流出 → ランクされない。** GSC実数も clicks=0 / impressions=2（28日）でほぼ検索不在。
- `netlify.toml` にサブドメイン対策が無い（SPAリライト `/* → /index.html 200` のみ）。

### ✅ 実装可能な対策（要デプロイ承認）
`netlify.toml` に**ホスト指定の301**を足し、netlify.app→本ドメインへ集約する：
```toml
[[redirects]]
  from = "https://incredible-llama-51caa2.netlify.app/*"
  to = "https://life-oracle.jp/:splat"
  status = 301
  force = true
```
これで重複が解消し、評価が life-oracle.jp に一本化される。**アプリSEOの最優先の一手。**

### 俊雄さんのコンソール操作（推奨・併せて）
1. **GSCにサイトマップ送信**：`https://life-oracle.jp/sitemap.xml` は**実在する（HTTP 200）**が**GSCに未登録**（`sitemaps().list` が空）。GSCで送信。
2. 301反映後、GSCで life-oracle.jp を**URL検査→インデックス登録をリクエスト**。

---

## GA4：ローカルSAにプロパティ権限が無い／sites.jsonのproperty IDが誤り

| 確認項目 | 結果 |
|---|---|
| ローカルSAで GSC（life-oracle.jp） | ✅ **成功**（SAはGSCに siteFullUser で追加済み） |
| ローカルSAで GA4 property 534433669（sites.json値） | ❌ **PermissionDenied** |
| 同 531854421 / 538470329 | ❌ 全て PermissionDenied（531854421はnote記事キーの誤検出） |
| クラウド日次レポートのGA4取得（本日6/19） | ✅ **「取得成功」**（Secret `GA4_PROPERTY_ID`＋`GOOGLE_CREDENTIALS_JSON`） |
| GA4 Admin API（プロパティ列挙） | ❌ **GCPプロジェクトで無効**（project gen-lang-client-0791471309）→ 列挙不可 |

**解釈（確定）**：
- アプリのクライアント計測（`quiz_start`/`quiz_complete` 等）は**コード上は正常**（前タスクで確認）。データは**クラウドのSecret設定で収集できている**（cloud=取得成功）。
- だが**ローカルSA(`ga4-sa.json`)はどのGA4プロパティにもViewer権限が無い**（GSCには追加済みだがGA4には未追加）。
- **`sites.json` の life-oracle.jp = 534433669 はSAから読めない＝誤りか権限未付与**。クラウドが使うSecretの property ID（正しい値）とローカル設定が**乖離**している。
- Admin APIが無効なので、正しいproperty ID（計測ID `G-L5V42D0116` を持つストリームの所属）を**プログラムで特定できない**。

**俊雄さんのコンソール操作（GA4の謎を解くのに必須）**：
1. **GA4 Admin API を有効化**（`console.developers.google.com/apis/api/analyticsadmin.googleapis.com/overview?project=gen-lang-client-0791471309`）→ これで正しいproperty IDをスクリプトで自動特定でき、`sites.json`を直せる。
2. **SA `life-oracle-ga4@…` をアプリのGA4プロパティに「閲覧者(Viewer)」で追加**（GA4管理→プロパティのアクセス管理）→ ローカル監視も実データを読めるようになる。
3. もしくは**Secretの `GA4_PROPERTY_ID` の値を教えてもらえれば**、`sites.json`を即修正できる（クラウドは既にこの値で成功している）。

**注意**：これらが解けるまで、`sites.json`/ローカル監視のGA4は実態と乖離したまま。クラウド委員会のGA4は動いているが、ローカルからの検証ができない状態。

---

## まとめ：今わかったこと

1. **アプリSEO不振の根本原因はSEOコンテンツ以前**——**Netlify生サブドメインが正規URLを奪う重複問題**だった（委員会が一度も指摘していなかった真因）。`netlify.toml`の301で直せる。
2. **note記事のインデックスはGSCでは見えない**（note.com＝別ドメイン・所有外）。site:検索のみ＝委員会決定1「GSCで点検」は前提が一部誤り。
3. **GA4はクラウドでは動いているがローカルSAは権限不足＋sites.json誤り**。完全解明にはAdmin API有効化かSecret値が要る（俊雄さんのコンソール操作）。
4. sitemap/robotsは実在・正常。**GSCへ未送信**なだけ。

*調査 2026-06-19。netlify.toml 301 のみ実装可（要デプロイ承認）。GA4権限・Admin API・GSC送信は俊雄さんのコンソール操作。*
