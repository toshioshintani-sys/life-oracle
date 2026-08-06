// B7 アンカリング
// 最初に提示された情報を基準にして判断する。「そう」でB7スコア上昇。

export const b07Anchoring = [

  {
    id: 'B7_WORK_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B7',
    angle: 'work', pole: null, weight: 1.5,
    scene: 'anchoring_first_estimate',
    tag: '最初の見積もり',
    stem: '最初に出た数字や見積もりが、その後の判断の基準になっている。',
  },
  {
    id: 'B7_WORK_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B7',
    angle: 'work', pole: null, weight: 1.0,
    scene: 'anchoring_predecessor_way',
    tag: '前任者のやり方',
    stem: '前の人のやり方を基準にして、自分の進め方を決めてしまう。',
  },

  {
    id: 'B7_RELATION_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B7',
    angle: 'relation', pole: null, weight: 1.5,
    scene: 'anchoring_first_impression',
    tag: '第一印象のまま',
    stem: '第一印象で決めた相手の評価は、あとから会ってもあまり変わらない。',
  },
  {
    id: 'B7_RELATION_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B7',
    angle: 'relation', pole: null, weight: 1.0,
    scene: 'anchoring_first_rumor',
    tag: '先に聞いた話',
    stem: '本人に会う前に聞いた話が、その人を見るときの土台になっている。',
  },

  {
    id: 'B7_STRESS_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B7',
    angle: 'stress', pole: null, weight: 1.5,
    scene: 'anchoring_busiest_period',
    tag: '一番忙しかった頃',
    stem: '一番忙しかった時期と比べて、今の忙しさを「まだ平気」と判断してしまう。',
  },
  {
    id: 'B7_STRESS_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B7',
    angle: 'stress', pole: null, weight: 1.0,
    scene: 'anchoring_past_hardship',
    tag: 'あの時に比べれば',
    stem: '過去の一番つらかった経験を基準にして、今の負担を軽く見積もる。',
  },

  {
    id: 'B7_CHOICE_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B7',
    angle: 'choice', pole: null, weight: 1.5,
    scene: 'anchoring_strikethrough_price',
    tag: '定価と割引価格',
    stem: '定価の横に割引価格が並んでいると、安いと感じて手が伸びる。',
  },
  {
    id: 'B7_CHOICE_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B7',
    angle: 'choice', pole: null, weight: 1.0,
    scene: 'anchoring_first_option_seen',
    tag: '最初に見たもの',
    stem: '最初に見た一つが、そのあと比べるときの基準になっている。',
  },
];
