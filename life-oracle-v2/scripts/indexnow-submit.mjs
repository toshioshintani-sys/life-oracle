// IndexNow へ URL の更新を通知する（2026-08-23 追加）
//
// Bing / Yandex などが対応する即時通知の仕組み。クローラの巡回を待たずに
// 「このURLが更新された」と伝えられる。Bing Webmaster に登録した（2026-08-23）ので有効。
//
// 前提：public/<key>.txt が本番に配信されていること（キーの所有証明に使われる）。
//       キーは .indexnow-key に保存してある（gitに含める。秘密情報ではなく所有証明用の公開値）。
//
// 使い方（デプロイが本番に反映されたあとで実行する）:
//   node scripts/indexnow-submit.mjs
//
// ⚠️ デプロイ前に叩いても意味がない。キーファイルと更新後のページが
//    本番に出ている状態で通知すること。
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://life-oracle.jp';
const HOST = 'life-oracle.jp';

// sitemap に載せているURLと揃える（存在しないURLを送ると信頼を落とす）
const URLS = [`${ORIGIN}/`];

const key = readFileSync(join(ROOT, '.indexnow-key'), 'utf-8').trim();

// 事前確認：キーファイルが本番から取得できるか
const keyUrl = `${ORIGIN}/${key}.txt`;
const keyRes = await fetch(keyUrl);
if (!keyRes.ok) {
  console.error(`キーファイルが本番にありません: ${keyUrl} → ${keyRes.status}`);
  console.error('デプロイが完了してから実行してください。');
  process.exit(1);
}
const served = (await keyRes.text()).trim();
if (served !== key) {
  console.error('キーファイルの中身が一致しません。送信を中止します。');
  process.exit(1);
}
console.log(`キーファイル確認OK: ${keyUrl}`);

const res = await fetch('https://api.indexnow.org/IndexNow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key, keyLocation: keyUrl, urlList: URLS }),
});

// 200/202 が成功。422 はURLとキーの不一致、403 はキー検証失敗。
console.log(`IndexNow: ${res.status} ${res.statusText}`);
if (res.status === 200 || res.status === 202) {
  console.log(`送信したURL: ${URLS.length}件`);
  URLS.forEach((u) => console.log(`  - ${u}`));
} else {
  console.error('送信に失敗しました:', (await res.text()).slice(0, 200));
  process.exit(1);
}
