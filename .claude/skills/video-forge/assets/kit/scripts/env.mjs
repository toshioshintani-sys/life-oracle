// 実行環境ごとに変わるブラウザの場所を解決する（Node 側でのみ使う）。
// 優先順： REMOTION_BROWSER_EXECUTABLE → 同梱の Chrome Headless Shell → null（Remotion に自動DLさせる）
import fs from 'node:fs';
import path from 'node:path';

const PW_ROOT = '/opt/pw-browsers';

const findBundledHeadlessShell = () => {
  try {
    const dir = fs
      .readdirSync(PW_ROOT)
      .filter((d) => d.startsWith('chromium_headless_shell-'))
      .sort()
      .pop();
    if (!dir) return null;
    const bin = path.join(PW_ROOT, dir, 'chrome-linux', 'headless_shell');
    return fs.existsSync(bin) ? bin : null;
  } catch {
    return null; // /opt/pw-browsers が無い環境（ローカルPC等）
  }
};

export const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || findBundledHeadlessShell();

// GPU が無い環境ではソフトウェアレンダリングにフォールバックさせる
export const chromiumOptions = {gl: 'swangle'};
