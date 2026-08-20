// B17 バンドワゴン効果
// 多くの人が選んでいること自体が、選ぶ理由になる。「そう」でB17スコア上昇。

export const b17Bandwagon = [

  {
    id: 'B17_WORK_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B17',
    angle: 'work', pole: null, weight: 1.5,
    scene: 'bandwagon_industry_trend',
    tag: '業界が動くと',
    stem: '同業他社が導入し始めたと聞くと、自社もやるべきだと感じる。',
  },
  {
    id: 'B17_WORK_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B17',
    angle: 'work', pole: null, weight: 1.0,
    scene: 'bandwagon_fear_of_missing',
    tag: '乗り遅れる感覚',
    stem: '新しい手法が話題になると、乗り遅れることのほうが不安になる。',
  },

  {
    id: 'B17_RELATION_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B17',
    angle: 'relation', pole: null, weight: 1.5,
    scene: 'bandwagon_everyone_watching',
    tag: 'みんな観ている',
    stem: '周りが話題にしている作品は、興味が薄くても観ておきたくなる。',
  },
  {
    id: 'B17_RELATION_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B17',
    angle: 'relation', pole: null, weight: 1.0,
    scene: 'bandwagon_group_opinion',
    tag: '多数派の意見',
    stem: '賛成が多い意見を見ると、自分もそう思えてくる。',
  },

  {
    id: 'B17_STRESS_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B17',
    angle: 'stress', pole: null, weight: 1.5,
    scene: 'bandwagon_left_behind',
    tag: '自分だけ遅れている',
    stem: '同年代の動きを見ると、自分だけ遅れているように感じて焦る。',
  },
  {
    id: 'B17_STRESS_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B17',
    angle: 'stress', pole: null, weight: 1.0,
    scene: 'bandwagon_sns_pressure',
    tag: 'SNSの流れ',
    stem: 'タイムラインで同じ話題が続くと、自分も何かしなければと思う。',
  },

  {
    id: 'B17_CHOICE_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B17',
    angle: 'choice', pole: null, weight: 1.5,
    scene: 'bandwagon_bestseller',
    tag: '売れているもの',
    stem: '売れ筋やランキング上位というだけで、そちらを選びたくなる。',
  },
  {
    id: 'B17_CHOICE_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B17',
    angle: 'choice', pole: null, weight: 1.0,
    scene: 'bandwagon_queue',
    tag: '並んでいる店',
    stem: '人が並んでいる店のほうが、間違いがないように思える。',
  },
];
