# 環境依存メモ

Remotion は「ヘッドレス Chrome で React を描画して1フレームずつ画像にし、動画に固める」仕組み。
つまり **ブラウザ・フォント・GPU** の3つが環境ごとの地雷になる。

---

## 1. ブラウザ

Remotion は既定で専用の Chrome Headless Shell を自動ダウンロードする（約120MB）。

- **ローカル PC**：そのままでよい。初回だけ時間がかかる。
- **Claude Code の実行環境（コンテナ）**：Playwright 用の Chrome Headless Shell が同梱済みなので、
  ダウンロードさせずにそれを使う。kit は既定でこのパスを見る。

```
/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
```

環境変数で上書きできる：
```bash
export REMOTION_BROWSER_EXECUTABLE=/path/to/headless_shell
```
パスは環境で変わる（`chromium_headless_shell-<番号>`）。存在しなければ
`ls /opt/pw-browsers/` で確認する。**見つからなければ環境変数を空にして Remotion に取りに行かせる。**

## 2. GPU が無い

コンテナには GPU が無いので、ソフトウェアレンダリングにフォールバックさせる。
kit では `chromiumOptions: {gl: 'swangle'}` を指定済み。
これを外すと WebGL・一部の CSS フィルタで真っ黒なフレームが出る。

## 3. 日本語フォント（最重要）

**フォントが無い＝豆腐（□□□）になる。**しかも警告なしで完走するので、
必ず Step 4 の目視確認で気づくこと。

- コンテナに入っている日本語フォントは `IPAGothic`（`fonts-japanese-gothic.ttf`）1つだけ。
  確認：`fc-list | grep -i japan`
- kit の `src/lib/brand.js` は `IPAGothic` を先頭に指定している。
- **明朝が必要な時**は代替が無い。ゴシックで代用するか、フォントファイルを持ち込んで
  `@remotion/fonts` の `loadFont()` で読む（環境非依存になるので、本番運用ならこちらが正解）。
- `@remotion/google-fonts` で Noto Sans JP を読む手もあるが、レンダリング時に
  fonts.gstatic.com へ出るのでネットワーク遮断環境では落ちる。

## 4. レンダリング時間の目安

1080×1920 / 6秒 / 30fps（180フレーム）で **1本あたり約45〜60秒**、出力 0.7〜0.9MB（h264）。
複数本作る時は `bundle()` を1回だけ作って使い回す（kit の `render.mjs` はそうしている）。
CLI を N 回叩くと毎回バンドルし直して遅い。

## 5. 出力の置き場所

- 作業は scratchpad（`/tmp/claude-*/scratchpad/`）で行う。**コンテナ回収で消える。**
- 残す必要がある成果物は、書き出した直後に `SendUserFile` で俊雄さんに渡すか、
  リポジトリにコミットする。**mp4 をリポジトリに入れる時は容量に注意**（1本1MB弱でも積むと効く）。
- kit の `node_modules/` と `out/` は `.gitignore` 済み。

## 6. スケールさせたくなったら

- `@remotion/lambda`（AWS Lambda で並列レンダ）は数十本〜数百本を回す段階の話。
  月2〜3本のうちは**ローカル書き出しで足りる**。先に入れない。
