// B4 同調バイアス
// 多数派の意見や行動に合わせようとする。「そう」でB4スコア上昇。

export const b04Conformity = [

  {
    id: 'B4_WORK_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B4',
    angle: 'work', pole: null, weight: 1.5,
    scene: 'conformity_all_agreed',
    tag: '全員が賛成した会議',
    stem: '全員が賛成している場では、違う考えがあっても言い出せなくなる。',
  },
  {
    id: 'B4_WORK_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B4',
    angle: 'work', pole: null, weight: 1.0,
    scene: 'conformity_leaving_office',
    tag: '席を立てない',
    stem: '用が済んでも、周りがまだ残っていると席を立ちにくい。',
  },

  {
    id: 'B4_RELATION_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B4',
    angle: 'relation', pole: null, weight: 1.5,
    scene: 'conformity_nodding_along',
    tag: '思っていないのに頷く',
    stem: 'その場の空気に合わせて、思っていないことにも頷いてしまう。',
  },
  {
    id: 'B4_RELATION_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B4',
    angle: 'relation', pole: null, weight: 1.0,
    scene: 'conformity_group_order',
    tag: '多数派に寄せる',
    stem: '大勢でいるときは、自分の好みより多数派の選択に寄せてしまう。',
  },

  {
    id: 'B4_STRESS_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B4',
    angle: 'stress', pole: null, weight: 1.5,
    scene: 'conformity_guilty_rest',
    tag: '自分だけ休めない',
    stem: '周りが忙しそうにしていると、自分だけ休むことに後ろめたさがある。',
  },
  {
    id: 'B4_STRESS_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B4',
    angle: 'stress', pole: null, weight: 1.0,
    scene: 'conformity_everyone_enduring',
    tag: '皆が我慢している',
    stem: '皆が我慢している状況では、つらいと口に出しにくい。',
  },

  {
    id: 'B4_CHOICE_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B4',
    angle: 'choice', pole: null, weight: 1.5,
    scene: 'conformity_popular_ranking',
    tag: '行列と人気No.1',
    stem: '行列ができていたり「人気No.1」と書かれていると、そちらを選びたくなる。',
  },
  {
    id: 'B4_CHOICE_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B4',
    angle: 'choice', pole: null, weight: 1.0,
    scene: 'conformity_review_count',
    tag: 'レビュー件数',
    stem: '評価の件数が多い商品のほうが、安心して選べる。',
  },
];
