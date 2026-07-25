# 新しいプロジェクトで使う

このスキルは特定のプロジェクトに依存しない。**知らないプロジェクトで発動しても止まらないこと**が要件。

---

## 1. 置き場所

| 置き場所 | 効く範囲 | 使いどころ |
|---|---|---|
| `~/.claude/skills/video-forge/` | **全プロジェクト** | 基本はこれ。他プロジェクト・新規プロジェクトで使うならここ |
| `<repo>/.claude/skills/video-forge/` | そのリポジトリのみ | チームで共有したい／リポジトリに紐づけたい時 |

user レベルに入れる：

```bash
bash install.sh                        # macOS / Linux / WSL
powershell -ExecutionPolicy Bypass -File install.ps1   # Windows
```

両方に置くと user レベルとプロジェクトレベルで名前が衝突する。**どちらか一方にする**。
（同じ内容を複数リポジトリに置くと、更新のたびに全部へ反映が要る＝ずれる）

## 2. 作業ディレクトリ

kit は**プロジェクトのリポジトリを汚さない**。作業用ディレクトリにコピーして使う。

```bash
cp -r <skill>/assets/kit "$SCRATCH/video" && cd "$SCRATCH/video" && npm i
```

成果物（mp4）をプロジェクトに残すかは都度判断する。リポジトリに動画を入れると容量が効くので、
**既定では入れない**（書き出したら `SendUserFile` で渡す）。プロジェクト側で管理したいと言われたら、
`public/` や `assets/` など、そのプロジェクトの慣習に従う。

## 3. ブランドを決める（ここが唯一のプロジェクト依存）

順に試す。**聞き返す前に、まずリポジトリを見る。**

### a. プリセットがある
`src/lib/brand.js` の `presets` に定義済みなら、それを使う（`brand: 'subsuku'`）。

### b. プロジェクトから色を拾う
リポジトリに色の定義があるはず。次の順で探す：

```bash
rg -n "^\s*--[a-z-]+:\s*#" src/index.css src/**/*.css   # CSS カスタムプロパティ
rg -n "colors" tailwind.config.*                        # Tailwind
rg -n "#[0-9a-fA-F]{6}" src/theme* src/styles* 2>/dev/null
```

拾えたら props に**その場のブランド定義**として渡す（キットを編集しなくてよい）：

```json
{
  "brand": {
    "bgFrom": "#101820", "bgTo": "#05070a",
    "accent": "#e0a34a", "ink": "#ffffff", "inkMuted": "#9aa3b2",
    "name": "プロジェクト名", "url": "example.com", "mark": "none"
  }
}
```

指定しなかったキーは `neutral`（無彩色の既定）で埋まる。**必要な色だけ書けばよい。**
そのプロジェクトで何度も作るなら、`presets` に1つ足す方が早い。

### c. 何も無い
`neutral` のまま作る。`brand` を省略すればよい。色が無いことを理由に止まらない。

## 4. ロゴ・マーク

`src/lib/Mark.jsx` は `compass` / `cancel` / `none` の3つ。プロジェクト固有のマークが要るなら：

- **SVG のパスが手に入る**（リポジトリの `public/*.svg` 等）→ `Mark.jsx` に1分岐足して描く
- **画像しかない** → Remotion の `<Img>` で読む（`staticFile()` で `public/` から）
- **不明** → `mark: 'none'` で進める。ロゴが無くても動画は成立する

## 5. 言語・フォント

日本語以外のプロジェクトなら `fontFamily` を props で上書きする。
フォントが環境に無いと**警告なく豆腐になる**ので、必ずスチルで目視（`environment.md`）。

## 6. そのプロジェクトの禁則を先に確認する

`CLAUDE.md` / `docs/` にブランド原則や禁則句があれば**それが優先**する。
無ければ一般則（煽らない・数字を誇張しない・断定しない）で作る。
既存の禁則を見つけたら `references/brand.md` に追記して次回から効かせる。
