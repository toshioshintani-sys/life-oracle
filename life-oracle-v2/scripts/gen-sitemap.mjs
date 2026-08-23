// sitemap.xml をビルド時に生成する（2026-08-23 追加）
//
// これまで public/sitemap.xml は手書きで、lastmod が 2026-06-06 のまま固定されていた。
// 何度デプロイしても更新日が動かないため、クローラに「動きのないサイト」と伝わり
// 再クロールの頻度が落ちる。ビルドのたびに当日の日付が入るようにする。
//
// ⚠️ このアプリは SPA でルーティングを使っておらず、実在するURLはトップ1枚だけ。
//    ページを増やしたらここに追記する（存在しないURLを載せると逆効果）。
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://life-oracle.jp';

const PAGES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
];

// JSTの日付（UTCだと日本の夕方以降に前日付が入る）
const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
const today = jst.toISOString().slice(0, 10);

const body = PAGES.map(({ path, changefreq, priority }) => `  <url>
    <loc>${ORIGIN}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

const out = join(ROOT, 'public', 'sitemap.xml');
writeFileSync(out, xml, 'utf-8');
console.log(`sitemap.xml を生成: ${PAGES.length}件 / lastmod=${today}`);
