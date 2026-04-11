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

// バイアス別おすすめ書籍（Amazonアソシエイト）
export const biasBooksData = {
  B1: {
    title: 'ファスト&スロー（上）',
    author: 'ダニエル・カーネマン',
    asin: '4150504105',
    description: '損失回避・判断のクセを徹底解剖した行動経済学の名著',
  },
  B2: {
    title: '予想どおりに不合理',
    author: 'ダン・アリエリー',
    asin: '4150503842',
    description: '「わかっているのにやめられない」行動の仕組みを解き明かす',
  },
  B3: {
    title: 'FACTFULNESS（ファクトフルネス）',
    author: 'ハンス・ロスリング',
    asin: '4822289605',
    description: '思い込みを外し、事実ベースで世界を見る10の習慣',
  },
  B4: {
    title: '影響力の武器［第三版］',
    author: 'ロバート・B・チャルディーニ',
    asin: '4414304229',
    description: 'なぜ人は動かされるのか、社会心理学の定番書',
  },
  B5: {
    title: '超予測力',
    author: 'フィリップ・E・テトロック',
    asin: '4152096446',
    description: '自分の判断精度を客観的に上げるための思考法',
  },
  B6: {
    title: 'スイッチ！',
    author: 'チップ・ハース＆ダン・ハース',
    asin: '4152091509',
    description: '変化を嫌う人間の心理と、それを動かす実践的メソッド',
  },
  B7: {
    title: '行動経済学の使い方',
    author: '大竹文雄',
    asin: '4004317959',
    description: 'アンカリングなど日常の意思決定に潜むバイアスを平易に解説',
  },
  B8: {
    title: '情動はこうしてつくられる',
    author: 'リサ・フェルドマン・バレット',
    asin: '4314011696',
    description: '感情と判断の関係を神経科学から解き明かした一冊',
  },
};

export function getAmazonAffiliateUrl(asin) {
  return `https://www.amazon.co.jp/dp/${asin}/?tag=shinta1999-22`;
}
