// B19 ダニング・クルーガー効果
// 知識や技能が浅い段階ほど、自分の理解度を高く見積もる。「そう」でB19スコア上昇。

export const b19Dunning = [

  {
    id: 'B19_WORK_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B19',
    angle: 'work', pole: null, weight: 1.5,
    scene: 'dunning_new_field_confidence',
    tag: '触りだけ知った分野',
    stem: '触りだけ学んだ分野について、もう分かったつもりで話してしまう。',
  },
  {
    id: 'B19_WORK_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B19',
    angle: 'work', pole: null, weight: 1.0,
    scene: 'dunning_underestimate_others',
    tag: '簡単そうに見える',
    stem: '他人の専門的な仕事を、思ったより簡単そうだと感じることがある。',
  },

  {
    id: 'B19_RELATION_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B19',
    angle: 'relation', pole: null, weight: 1.5,
    scene: 'dunning_advise_confidently',
    tag: '自信のある助言',
    stem: '経験が浅い話題ほど、迷いなく人に助言できてしまう。',
  },
  {
    id: 'B19_RELATION_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B19',
    angle: 'relation', pole: null, weight: 1.0,
    scene: 'dunning_expert_humble',
    tag: '詳しい人ほど慎重',
    stem: '詳しい人ほど断言しないのを見て、歯がゆく感じることがある。',
  },

  {
    id: 'B19_STRESS_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B19',
    angle: 'stress', pole: null, weight: 1.5,
    scene: 'dunning_learning_valley',
    tag: '学ぶほど自信が減る',
    stem: '学び進めるうちに、最初より自信がなくなっていくことがある。',
  },
  {
    id: 'B19_STRESS_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B19',
    angle: 'stress', pole: null, weight: 1.0,
    scene: 'dunning_skip_basics',
    tag: '基礎を飛ばす',
    stem: '基礎の確認は自分には必要ないと感じて、飛ばしてしまう。',
  },

  {
    id: 'B19_CHOICE_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B19',
    angle: 'choice', pole: null, weight: 1.5,
    scene: 'dunning_self_taught',
    tag: '独学で足りる',
    stem: '調べれば自分でできると考えて、人に聞かずに進めてしまう。',
  },
  {
    id: 'B19_CHOICE_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B19',
    angle: 'choice', pole: null, weight: 1.0,
    scene: 'dunning_quick_judgement',
    tag: '早い段階の判断',
    stem: '少し試しただけで、その分野の良し悪しを判断してしまう。',
  },
];
