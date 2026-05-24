// 世界の神様の名前リスト（IPハッシュから決定論的に選択）
// 日本人に馴染みのある神様に絞る：日本・ギリシャ・北欧

const DEITY_NAMES = [
  // 日本
  'アマテラス', 'スサノオ', 'ツクヨミ', 'イザナギ', 'イザナミ',
  'オオクニヌシ', 'スクナビコナ', 'コトシロヌシ', 'フツヌシ', 'タケミカヅチ',
  'イナリ', 'フウジン', 'ライジン', 'サルタヒコ', 'アメノウズメ',
  // 七福神
  'エビス', 'ダイコク', 'ベンテン', 'ビシャモン', 'ホテイ', 'ジュロウジン', 'フクロクジュ',
  // ギリシャ
  'アポロン', 'アテナ', 'アルテミス', 'ヘルメス', 'ポセイドン',
  'アフロディテ', 'ヘパイストス', 'アレス', 'ディオニュソス',
  'ヘカテ', 'ニケ', 'エオス', 'ヘスティア',
  // 北欧
  'オーディン', 'トール', 'フレイヤ', 'ロキ', 'バルドル',
  'ティール', 'ヘイムダル', 'ブラギ',
];

/**
 * IP文字列から決定論的な神様名を返す
 * @param {string} ip - クライアントIPアドレス（またはランダムな識別子）
 * @returns {string} 神様の名前
 */
export function getDeityName(ip) {
  let hash = 0;
  const str = ip || Math.random().toString();
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % DEITY_NAMES.length;
  return DEITY_NAMES[index];
}

export { DEITY_NAMES };
