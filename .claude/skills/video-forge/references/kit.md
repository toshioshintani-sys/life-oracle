# kit の使い方

`assets/kit/` は動くレンダリング基盤。**レイアウトのテンプレートではない**（それは禁止事項2）。
毎回ここから作業ディレクトリを作り、composition だけを新規に書く。

---

## 起動

```bash
# 1. 作業ディレクトリへコピー（scratchpad 推奨・成果物は消えてよい前提で作る）
cp -r <skill>/assets/kit "$SCRATCH/video" && cd "$SCRATCH/video"

# 2. 依存を入れる（約20秒・250パッケージ）
npm i

# 3. 登録済み composition を確認
node scripts/render.mjs --list
```

Remotion のバージョンは4つのパッケージ（`remotion` / `@remotion/cli` / `@remotion/bundler` /
`@remotion/renderer`）で**完全に一致している必要がある**。片方だけ上げない。

## CLI

```bash
node scripts/render.mjs --list                                   # 一覧
node scripts/render.mjs --id=StackPull --stills=0,45,90,135,179   # 確認用スチル（PNG）
node scripts/render.mjs --id=StackPull --out=out/stack.mp4        # 書き出し
node scripts/render.mjs --id=StackPull --out=out/a.mp4 --props=data/a.json
node scripts/render.mjs --batch=data/posts.json                   # [{id, slug, props}, ...] を連続書き出し
```

プレビューをブラウザで触りたい時（俊雄さんのローカルPCのみ）：`npm run studio`
→ props をいじりながらタイムラインをスクラブできる。コンテナ内では見られないので使わない。

## composition を足す

1. `src/compositions/<Name>.jsx` を新規作成
2. 末尾に `meta` を export する

```jsx
export const meta = {
  id: 'Name',
  component: Name,
  width: 1080, height: 1920, fps: 30, durationInFrames: 240,
  defaultProps: {brand: 'subsuku', /* ... */},
};
```

3. `src/compositions/index.js` に1行足す

```js
import {meta as name} from './Name.jsx';
export const compositions = [stackPull, name];
```

## 部品

| 場所 | 中身 |
|---|---|
| `src/lib/motion.js` | `useEnter`（spring入場）/ `useProgress` / `useCount`（数字を動かす）/ `useCamera` / `useBeat` / `yen` |
| `src/lib/text.jsx` | `SplitText`（文字・行単位のスタガー）/ `Wipe`（マスクで書き出す） |
| `src/lib/brand.js` | `getBrand()`＝プリセット名／その場の定義オブジェクト／`neutral` を解決・フォント |
| `src/lib/Mark.jsx` | ブランドマーク（羅針盤／解約リング） |

**使い回すのは部品であってレイアウトではない。**

## 落とし穴

- **`--props` は defaultProps を丸ごと置き換えず、キー単位でマージされる**。
  `brand` を書かずに渡すと **defaultProps のブランドがそのまま残る**（別プロジェクトの色で出てしまう）。
  neutral にしたいなら `"brand": null` と明示する。
- **画面に出る文字を composition に直書きしない**。ラベル・通貨は props にする
  （`StackPull.jsx` の `DEFAULT_LABELS` / `currency` が実例）。日本語決め打ちだと他言語プロジェクトで詰む。
- **`map()` の中で直接フックを呼ばない**。要素は子コンポーネントに切り出す。
  props の要素数が変わるとフック数が変わり React が壊れる（`StackPull.jsx` の `Row` が実例）。
- **`useEnter(0)` は0フレーム目が opacity 0**。1フレーム目から見せたい要素はアニメーションさせない。
- **文字化けは無警告で通る**。必ずスチルを目視（`references/environment.md`）。
- `durationInFrames` を伸ばしたのに要素のタイムラインを直さないと、最後に無音の静止が残る。
