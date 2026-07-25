// ブランド定義。色は実装から引用している（references/brand.md 参照）。
// 勝手に色を増やさない。実装が変わったらここを合わせる。

export const brands = {
  // subsuku-yameta-web/src/index.css の --hm-*
  subsuku: {
    name: 'サブスクやめた',
    url: 'sabusuku-yameta.com',
    bgFrom: '#2a3658',
    bgTo: '#141a2a',
    surface: '#faf6ee',
    ink: '#ffffff',
    inkOnLight: '#1b2030',
    inkMuted: '#b9c0d4',
    accent: '#34c0c6',
    gold: '#edb85f',
    warn: '#f0a58a',
    card: 'rgba(255,255,255,0.06)',
    cardBorder: 'rgba(255,255,255,0.14)',
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

export const getBrand = (key) => brands[key] ?? brands.subsuku;

// この環境の日本語フォント。無いと警告なく豆腐になるので、必ず目視確認すること。
export const JP_FONT = '"IPAGothic", "Noto Sans JP", "Hiragino Sans", sans-serif';
