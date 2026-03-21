// 認知機能マッピング（光と影）
export const cognitiveFunctionMap = {
  ENTJ: { dominant: 'Te', shadow: 'Ti', lightName: '指揮者',       shadowName: '堂々巡り' },
  INTJ: { dominant: 'Ni', shadow: 'Ne', lightName: '先読み人',     shadowName: '三日坊主' },
  ENTP: { dominant: 'Ne', shadow: 'Ni', lightName: '発明家',       shadowName: '独走者' },
  INTP: { dominant: 'Ti', shadow: 'Te', lightName: '職人',         shadowName: '鉄砲玉' },
  ENFJ: { dominant: 'Fe', shadow: 'Fi', lightName: '聴き手',       shadowName: '頑固者' },
  INFJ: { dominant: 'Ni', shadow: 'Ne', lightName: '先読み人',     shadowName: '三日坊主' },
  ENFP: { dominant: 'Ne', shadow: 'Ni', lightName: '発明家',       shadowName: '独走者' },
  INFP: { dominant: 'Fi', shadow: 'Fe', lightName: '求道者',       shadowName: '八方美人' },
  ESTJ: { dominant: 'Te', shadow: 'Ti', lightName: '指揮者',       shadowName: '堂々巡り' },
  ISTJ: { dominant: 'Si', shadow: 'Se', lightName: 'コツコツ人',   shadowName: '思いつき人' },
  ESTP: { dominant: 'Se', shadow: 'Si', lightName: '今を楽しむ人', shadowName: '現状維持人' },
  ISTP: { dominant: 'Ti', shadow: 'Te', lightName: '職人',         shadowName: '鉄砲玉' },
  ESFJ: { dominant: 'Fe', shadow: 'Fi', lightName: '聴き手',       shadowName: '頑固者' },
  ISFJ: { dominant: 'Si', shadow: 'Se', lightName: 'コツコツ人',   shadowName: '思いつき人' },
  ESFP: { dominant: 'Se', shadow: 'Si', lightName: '今を楽しむ人', shadowName: '現状維持人' },
  ISFP: { dominant: 'Fi', shadow: 'Fe', lightName: '求道者',       shadowName: '八方美人' },
};

// 16タイプ キャッチコピー
export const typeLabels = {
  ENFP: '直観と情熱の探求者',
  INFP: '理想を追い続ける詩人',
  ENFJ: '人を導くカリスマ',
  INFJ: '静かなるビジョナリー',
  ENTP: 'アイデアが止まらない論客',
  INTP: '理論を極める哲学者',
  ENTJ: '目標を貫く指揮官',
  INTJ: '孤高の戦略家',
  ESFP: '場を明るくするエンターテイナー',
  ISFP: '感性豊かなアーティスト',
  ESFJ: 'みんなの世話焼きリーダー',
  ISFJ: '縁の下の力持ち',
  ESTP: 'リスクを楽しむ行動派',
  ISTP: '黙って手を動かす職人',
  ESTJ: '秩序を守る現場監督',
  ISTJ: '堅実に積み上げる責任者',
};

// biasInfo の再エクスポート（ResultCard等で利用）
export { biasInfo } from '../utils/scoring.js';
