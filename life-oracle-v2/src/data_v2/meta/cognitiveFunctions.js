// 認知機能マップ（life-oracle から移植・変更なし）

// noteUrl: MBTIタイプ別の記事URL。URLが判明次第ここに追加する
export const cognitiveFunctionMap = {
  ENTJ: { dominant: 'Te', shadow: 'Ti', lightName: '指揮者',      shadowName: '堂々巡り',   todayAction: '今日の会議で、結論を出す前に「他に意見は？」と一言だけ聞いてみる',                               noteUrl: null },
  INTJ: { dominant: 'Ni', shadow: 'Ne', lightName: '先読み人',    shadowName: '独走者',     todayAction: '今日は遠い未来の心配より、「今日の夕方にできること」1つに絞って動く',                           noteUrl: null },
  ENTP: { dominant: 'Ne', shadow: 'Ni', lightName: '発明家',      shadowName: '三日坊主',   todayAction: '今日は1つのアイデアを、最後まで実行してから次のアイデアに移る',                               noteUrl: null },
  INTP: { dominant: 'Ti', shadow: 'Te', lightName: '職人',        shadowName: '鉄砲玉',     todayAction: '今日は「完璧な分析」より「60点の行動」を1つ先に起こしてみる',                                 noteUrl: null },
  ENFJ: { dominant: 'Fe', shadow: 'Fi', lightName: '聴き手',      shadowName: '頑固者',     todayAction: '誰かに親切にする前に、まず「自分は今どう感じているか」を10秒だけ確認する',                   noteUrl: null },
  INFJ: { dominant: 'Ni', shadow: 'Ne', lightName: '先読み人',    shadowName: '独走者',     todayAction: '今日は遠い未来の心配より、「今日の夕方にできること」1つに絞って動く',                           noteUrl: null },
  ENFP: { dominant: 'Ne', shadow: 'Ni', lightName: '発明家',      shadowName: '三日坊主',   todayAction: '今日は1つのアイデアを、最後まで実行してから次のアイデアに移る',                               noteUrl: null },
  INFP: { dominant: 'Fi', shadow: 'Fe', lightName: '求道者',      shadowName: '八方美人',   todayAction: '今日1つだけ、周りの期待でなく「自分がやりたいこと」を選ぶ',                                   noteUrl: null },
  ESTJ: { dominant: 'Te', shadow: 'Ti', lightName: '指揮者',      shadowName: '堂々巡り',   todayAction: '今日の会議で、結論を出す前に「他に意見は？」と一言だけ聞いてみる',                               noteUrl: null },
  ISTJ: { dominant: 'Si', shadow: 'Se', lightName: 'コツコツ人',  shadowName: '思いつき人', todayAction: '今日は「いつものやり方」のうち1つだけ、意図的に違う方法を試してみる',                         noteUrl: null },
  ESTP: { dominant: 'Se', shadow: 'Si', lightName: '今を楽しむ人', shadowName: '現状維持人', todayAction: '衝動的に動く前に3秒止まり、「これは本当に今やる必要がある？」と自問する',                   noteUrl: null },
  ISTP: { dominant: 'Ti', shadow: 'Te', lightName: '職人',        shadowName: '鉄砲玉',     todayAction: '今日は「完璧な分析」より「60点の行動」を1つ先に起こしてみる',                                 noteUrl: null },
  ESFJ: { dominant: 'Fe', shadow: 'Fi', lightName: '聴き手',      shadowName: '頑固者',     todayAction: '誰かに親切にする前に、まず「自分は今どう感じているか」を10秒だけ確認する',                   noteUrl: null },
  ISFJ: { dominant: 'Si', shadow: 'Se', lightName: 'コツコツ人',  shadowName: '思いつき人', todayAction: '今日は「いつものやり方」のうち1つだけ、意図的に違う方法を試してみる',                         noteUrl: null },
  ESFP: { dominant: 'Se', shadow: 'Si', lightName: '今を楽しむ人', shadowName: '現状維持人', todayAction: '衝動的に動く前に3秒止まり、「これは本当に今やる必要がある？」と自問する',                   noteUrl: null },
  ISFP: { dominant: 'Fi', shadow: 'Fe', lightName: '求道者',      shadowName: '八方美人',   todayAction: '今日1つだけ、周りの期待でなく「自分がやりたいこと」を選ぶ',                                   noteUrl: null },
};

// 2026-07-08 追加：MBTI→ユング機能タイプ(jungTypeId)と、その正しいペルソナ名の対応表。
// 背景：上の cognitiveFunctionMap.shadowName は「同じMBTIタイプの対抗機能の影」（v1の設計）を
// 指しており、v2で採用した「同じ機能の光/影表現」（例 Fi-光=求道者・Fi-影=頑固者）の概念とは
// 別物。両者は8機能中6機能で値がズレる（ENTJ/ENFJ/ESFP/ISFJ/INTP/INFPの表示名バグの原因）。
// 表示名は必ずこの JUNG_LABEL[jungTypeId] を正とする。cognitiveFunctionMap.shadowName を
// 直接表示に使わない（cognitiveFunctionMap.lightName は両モデルで一致するため実害なし）。
export const MBTI_TO_JUNG = {
  ESTJ: 'Te-光', ENTJ: 'Te-影', ESFJ: 'Fe-光', ENFJ: 'Fe-影',
  ESTP: 'Se-光', ESFP: 'Se-影', ENTP: 'Ne-光', ENFP: 'Ne-影',
  ISTJ: 'Si-光', ISFJ: 'Si-影', ISTP: 'Ti-光', INTP: 'Ti-影',
  INTJ: 'Ni-光', INFJ: 'Ni-影', ISFP: 'Fi-光', INFP: 'Fi-影',
};

export const JUNG_LABEL = {
  'Te-光': '指揮者',      'Te-影': '鉄砲玉',
  'Ti-光': '職人',        'Ti-影': '堂々巡り',
  'Fe-光': '聴き手',      'Fe-影': '八方美人',
  'Fi-光': '求道者',      'Fi-影': '頑固者',
  'Se-光': '今を楽しむ人', 'Se-影': '思いつき人',
  'Si-光': 'コツコツ人',  'Si-影': '現状維持人',
  'Ne-光': '発明家',      'Ne-影': '三日坊主',
  'Ni-光': '先読み人',    'Ni-影': '独走者',
};

export const famousPeople = {
  ENFP: { people: ['坂本龍馬', 'ウォルト・ディズニー'] },
  INFP: { people: ['宮崎駿', 'マイケル・ジャクソン'] },
  ENFJ: { people: ['松下幸之助', 'バラク・オバマ'] },
  INFJ: { people: ['村上春樹', 'マーティン・ルーサー・キング'] },
  ENTP: { people: ['手塚治虫', 'スティーブ・ジョブズ'] },
  INTP: { people: ['夏目漱石', 'アルベルト・アインシュタイン'] },
  ENTJ: { people: ['織田信長', 'ナポレオン・ボナパルト'] },
  INTJ: { people: ['羽生善治', 'イーロン・マスク'] },
  ESFP: { people: ['明石家さんま', 'マリリン・モンロー'] },
  ISFP: { people: ['坂本龍一', 'ボブ・ディラン'] },
  ESFJ: { people: ['吉永小百合', 'マザー・テレサ'] },
  ISFJ: { people: ['黒柳徹子', 'オードリー・ヘプバーン'] },
  ESTP: { people: ['本田圭佑', 'アーネスト・ヘミングウェイ'] },
  ISTP: { people: ['羽生結弦', 'クリント・イーストウッド'] },
  ESTJ: { people: ['渋沢栄一', 'ジョージ・ワシントン'] },
  ISTJ: { people: ['稲盛和夫', 'ウォーレン・バフェット'] },
};
