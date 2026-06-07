/**
 * notePublished フラグ管理ツール
 *
 * 使い方:
 *   # 現在の状態を一覧表示（dry-run）
 *   node scripts/mark_notes_published.mjs
 *
 *   # 特定タイプを published に
 *   node scripts/mark_notes_published.mjs --publish jin_01,jin_03,jin_04
 *
 *   # noteUrl を持つ全タイプを published に
 *   node scripts/mark_notes_published.mjs --publish-all
 *
 *   # 特定タイプを unpublished に戻す
 *   node scripts/mark_notes_published.mjs --unpublish jin_99
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, '../life-oracle-v2/src/data_v2/jin/jin_types.json');

const raw  = JSON.parse(readFileSync(DATA_PATH, 'utf8'));
const types = raw.types;

const args        = process.argv.slice(2);
const publishArg  = args.find(a => a.startsWith('--publish='))?.replace('--publish=', '') ?? null;
const publishAll  = args.includes('--publish-all');
const unpubArg    = args.find(a => a.startsWith('--unpublish='))?.replace('--unpublish=', '') ?? null;

// ── 一覧表示 ──────────────────────────────────────────────────
console.log('\n========================================');
console.log('  notePublished 管理ツール');
console.log('========================================');

const withUrl     = types.filter(t => t.noteUrl);
const published   = withUrl.filter(t => t.notePublished);
const unpublished = withUrl.filter(t => !t.notePublished);

console.log(`noteUrl 有り: ${withUrl.length} タイプ`);
console.log(`  ✅ 公開中 (notePublished=true):  ${published.length}`);
console.log(`  ⏳ 未公開 (notePublished=false): ${unpublished.length}`);
console.log('');

if (published.length) {
  console.log('─ 公開中 ─');
  for (const t of published) {
    console.log(`  ✅ ${t.id.padEnd(8)} ${t.internalLabel}`);
    console.log(`           ${t.noteUrl}`);
  }
  console.log('');
}

if (unpublished.length) {
  console.log('─ 未公開（noteUrl あり） ─');
  for (const t of unpublished) {
    console.log(`  ⏳ ${t.id.padEnd(8)} ${t.internalLabel}`);
    console.log(`           ${t.noteUrl}`);
  }
  console.log('');
}

// ── 更新処理 ─────────────────────────────────────────────────
let changed = 0;

if (publishAll) {
  for (const t of withUrl) {
    if (!t.notePublished) { t.notePublished = true; changed++; }
  }
  console.log(`✅ noteUrl 有り全 ${withUrl.length} タイプを published にしました。`);
}

if (publishArg) {
  const ids = publishArg.split(',').map(s => s.trim());
  for (const id of ids) {
    const t = types.find(x => x.id === id);
    if (!t) { console.error(`⚠️  ${id} が見つかりません`); continue; }
    if (!t.noteUrl) { console.error(`⚠️  ${id} に noteUrl がありません`); continue; }
    if (!t.notePublished) { t.notePublished = true; changed++; console.log(`  ✅ ${id} → published`); }
    else console.log(`  （${id} は既に published）`);
  }
}

if (unpubArg) {
  const ids = unpubArg.split(',').map(s => s.trim());
  for (const id of ids) {
    const t = types.find(x => x.id === id);
    if (!t) { console.error(`⚠️  ${id} が見つかりません`); continue; }
    if (t.notePublished) { t.notePublished = false; changed++; console.log(`  ⏳ ${id} → unpublished`); }
    else console.log(`  （${id} は既に unpublished）`);
  }
}

if (changed > 0) {
  writeFileSync(DATA_PATH, JSON.stringify(raw, null, 2) + '\n');
  console.log(`\n💾 jin_types.json を保存しました（${changed} タイプ変更）`);
  console.log('  → npm run build で反映してください');
} else if (args.length > 0) {
  console.log('変更なし。');
} else {
  console.log('使い方:');
  console.log('  node scripts/mark_notes_published.mjs --publish=jin_01,jin_03');
  console.log('  node scripts/mark_notes_published.mjs --publish-all');
}

console.log('========================================\n');
