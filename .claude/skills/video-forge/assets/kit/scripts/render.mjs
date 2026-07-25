// 動画・確認用スチルの書き出し。bundle は1回だけ作って使い回す。
//
//   node scripts/render.mjs --list
//   node scripts/render.mjs --id=StackPull --stills=0,45,90,135,179
//   node scripts/render.mjs --id=StackPull --out=out/stack-pull.mp4
//   node scripts/render.mjs --id=StackPull --out=out/x.mp4 --props=data/x.json
//   node scripts/render.mjs --batch=data/posts.json        # [{id, slug, props}, ...]
import {bundle} from '@remotion/bundler';
import {getCompositions, renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {browserExecutable, chromiumOptions} from './env.mjs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const arg = (name, fallback = null) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
const has = (name) => process.argv.includes(`--${name}`);
const readJson = (p) => JSON.parse(fs.readFileSync(path.isAbsolute(p) ? p : path.join(root, p), 'utf8'));

const serveUrl = await bundle({entryPoint: path.join(root, 'src', 'index.jsx')});

const renderOne = async ({id, props, out, stills}) => {
  const composition = await selectComposition({serveUrl, id, inputProps: props, browserExecutable});

  if (stills) {
    const dir = path.join(root, 'out', 'stills');
    fs.mkdirSync(dir, {recursive: true});
    for (const f of stills) {
      const output = path.join(dir, `${id}-${String(f).padStart(4, '0')}.png`);
      await renderStill({composition, serveUrl, output, frame: f, inputProps: props, browserExecutable, chromiumOptions});
      console.log(`🖼  ${output}`);
    }
    console.log('\n→ 書き出した PNG を必ず目で見てから次に進むこと（SKILL.md Step 4）');
    return;
  }

  const outputLocation = path.isAbsolute(out) ? out : path.join(root, out);
  fs.mkdirSync(path.dirname(outputLocation), {recursive: true});
  const started = process.hrtime.bigint();
  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    outputLocation,
    inputProps: props,
    browserExecutable,
    chromiumOptions,
  });
  const sec = Number(process.hrtime.bigint() - started) / 1e9;
  const mb = fs.statSync(outputLocation).size / 1024 / 1024;
  console.log(
    `✅ ${path.relative(root, outputLocation)}  ${composition.width}x${composition.height}  ` +
      `${(composition.durationInFrames / composition.fps).toFixed(1)}s  ${mb.toFixed(2)}MB  (${sec.toFixed(1)}s)`,
  );
};

// 一覧はバンドル経由で取る（compositions/index.js は JSX を import しているので Node から直接読めない）
if (has('list') || (!arg('id') && !arg('batch'))) {
  const found = await getCompositions(serveUrl, {browserExecutable});
  const ids = found.map((c) => `  ${c.id}  ${c.width}x${c.height}  ${c.durationInFrames}f@${c.fps}`);
  console.log(ids.length ? `登録済み composition:\n${ids.join('\n')}` : 'composition がまだありません');
  console.log('\n例: node scripts/render.mjs --id=<Id> --stills=0,45,90,135,179');
  process.exit(0);
}

const batch = arg('batch');
if (batch) {
  for (const item of readJson(batch)) {
    await renderOne({id: item.id, props: item.props, out: item.out ?? `out/${item.slug}.mp4`});
  }
} else {
  const propsArg = arg('props');
  await renderOne({
    id: arg('id'),
    props: propsArg ? readJson(propsArg) : undefined,
    out: arg('out', `out/${arg('id')}.mp4`),
    stills: arg('stills')
      ? arg('stills')
          .split(',')
          .map((n) => Number(n.trim()))
      : null,
  });
}
