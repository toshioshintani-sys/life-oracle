// ブランド（色とトーン）の解決。
//
// このキットはプロジェクトに依存しない。ブランドの渡し方は3通り：
//   1. プリセット名   brand: 'subsuku'
//   2. 直接オブジェクト brand: {bgFrom: '#101820', accent: '#e0a34a'}   ← 他プロジェクトはこれ
//   3. 省略           → neutral（無彩色の既定）
//
// 2 は neutral の上にマージされるので、必要な色だけ書けばよい。
// 新しいプロジェクトで何度も使うなら、presets に1つ足すのが早い。

// 既定。特定のブランドに寄せていない＝どのプロジェクトでも成立する出発点。
export const neutral = {
  name: '',
  url: '',
  bgFrom: '#1c1f26',
  bgTo: '#0e1014',
  surface: '#f7f7f5',
  ink: '#ffffff',
  inkOnLight: '#16181d',
  inkMuted: '#a7adba',
  accent: '#6ea8fe',
  gold: '#e0b25c',
  warn: '#e8907c',
  card: 'rgba(255,255,255,0.06)',
  cardBorder: 'rgba(255,255,255,0.14)',
  mark: 'none',
};

export const presets = {
  // subsuku-yameta-web/src/index.css の --hm-*
  subsuku: {
    name: 'サブスクやめた',
    url: 'sabusuku-yameta.com',
    bgFrom: '#2a3658',
    bgTo: '#141a2a',
    surface: '#faf6ee',
    inkOnLight: '#1b2030',
    inkMuted: '#b9c0d4',
    accent: '#34c0c6',
    gold: '#edb85f',
    warn: '#f0a58a',
    mark: 'cancel',
  },
  // life-oracle/CLAUDE.md「CSSについて」
  oracle: {
    name: 'ライフオラクル',
    url: 'life-oracle.jp',
    bgFrom: '#faf6f1',
    bgTo: '#f1e9de',
    surface: '#ffffff',
    ink: '#2d2318',
    inkOnLight: '#2d2318',
    inkMuted: '#7a6a55',
    accent: '#b8833f',
    gold: '#8c5f28',
    light: '#3d7a5a',
    shadow: '#a05050',
    card: 'rgba(255,255,255,0.72)',
    cardBorder: 'rgba(184,131,63,0.28)',
    mark: 'compass',
  },
};

// 文字列（プリセット名）でも、オブジェクト（その場のブランド定義）でも受ける。
export const getBrand = (brand) => {
  if (brand && typeof brand === 'object') return {...neutral, ...brand};
  return {...neutral, ...(presets[brand] ?? {})};
};

// 後方互換：以前の brands 参照
export const brands = presets;

// フォント。プロジェクト側で別のフォントを使うなら props で上書きする（fontFamily）。
// 環境に無いフォント名を書くと警告なく豆腐になるので、必ずスチルで目視すること。
export const JP_FONT = '"IPAGothic", "Noto Sans JP", "Hiragino Sans", sans-serif';
