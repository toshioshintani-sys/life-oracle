// B5 過信バイアス
// 自分の能力や判断を平均より高く見積もる。「そう」でB5スコア上昇。

export const b05Overconfidence = [

  {
    id: 'B5_WORK_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B5',
    angle: 'work', pole: null, weight: 1.5,
    scene: 'overconfidence_better_than_average',
    tag: '自分がやったほうが',
    stem: '自分が担当すれば、たいていの人より上手くやれると思っている。',
  },
  {
    id: 'B5_WORK_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B5',
    angle: 'work', pole: null, weight: 1.0,
    scene: 'overconfidence_skip_instructions',
    tag: '説明は要らない',
    stem: '説明を最後まで聞かなくても、だいたい分かると感じることが多い。',
  },

  {
    id: 'B5_RELATION_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B5',
    angle: 'relation', pole: null, weight: 1.5,
    scene: 'overconfidence_read_others',
    tag: '読めているつもり',
    stem: '相手が何を考えているかは、だいたい読めているほうだと思う。',
  },
  {
    id: 'B5_RELATION_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B5',
    angle: 'relation', pole: null, weight: 1.0,
    scene: 'overconfidence_judge_people',
    tag: '人を見る目',
    stem: '自分は人を見る目があるほうだと思う。',
  },

  {
    id: 'B5_STRESS_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B5',
    angle: 'stress', pole: null, weight: 1.5,
    scene: 'overconfidence_take_on_more',
    tag: '何とか回せる',
    stem: '手一杯でも、自分ならこなせると思って引き受けてしまう。',
  },
  {
    id: 'B5_STRESS_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B5',
    angle: 'stress', pole: null, weight: 1.0,
    scene: 'overconfidence_push_through',
    tag: '気合いでどうにか',
    stem: '体調の悪さは、気合いでどうにかなると思っている節がある。',
  },

  {
    id: 'B5_CHOICE_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B5',
    angle: 'choice', pole: null, weight: 1.5,
    scene: 'overconfidence_gut_choice',
    tag: '直感で外さない',
    stem: '細かく調べなくても、自分の直感で選べば外さないと思う。',
  },
  {
    id: 'B5_CHOICE_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B5',
    angle: 'choice', pole: null, weight: 1.0,
    scene: 'overconfidence_learn_on_the_fly',
    tag: '本番で覚える',
    stem: '初めてのことでも、練習より本番でやったほうが早く覚えられると思う。',
  },
];
