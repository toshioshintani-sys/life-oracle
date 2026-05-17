// B8 サンクコスト効果
// すでに使った時間・お金・労力に引きずられて見切りが遅れる。「そう」でB8スコア上昇。

export const b08SunkCost = [

  {
    id: 'B8_WORK_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B8',
    angle: 'work', pole: null, weight: 1.5,
    scene: 'sunk_cost_failing_project',
    tag: '上手くいかないプロジェクト',
    stem: '成果が出ていないプロジェクトに、ここまで時間をかけたからと続けてしまうことがある。',
  },
  {
    id: 'B8_WORK_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B8',
    angle: 'work', pole: null, weight: 1.0,
    scene: 'sunk_cost_studying_quit',
    tag: '取り組んだ勉強・資格',
    stem: '途中まで進めた勉強や資格試験、向いていないと思っても「ここまでやったから」と辞めにくい。',
  },

  {
    id: 'B8_RELATION_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B8',
    angle: 'relation', pole: null, weight: 1.5,
    scene: 'sunk_cost_long_relationship',
    tag: '長く続いた関係',
    stem: '一緒にいる時間が長い相手との関係が合わなくなっても、長さを考えると距離を置きにくい。',
  },
  {
    id: 'B8_RELATION_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B8',
    angle: 'relation', pole: null, weight: 1.0,
    scene: 'sunk_cost_gift_obligation',
    tag: '贈り物の重み',
    stem: '相手にプレゼントを贈った後、もらったものへの感謝より先に「見返り」を期待してしまうことがある。',
  },

  {
    id: 'B8_STRESS_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B8',
    angle: 'stress', pole: null, weight: 1.5,
    scene: 'sunk_cost_money_already_spent',
    tag: 'もう使ってしまったお金',
    stem: '払ってしまったお金は取り返せないと分かっていても、その分を元手に行動し続けてしまう。',
  },
  {
    id: 'B8_STRESS_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B8',
    angle: 'stress', pole: null, weight: 1.0,
    scene: 'sunk_cost_time_invested',
    tag: '費やした時間が惜しい',
    stem: '何時間もかけて考えたアイデアに欠陥が見つかっても、捨てることへの抵抗感が強い。',
  },

  {
    id: 'B8_CHOICE_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B8',
    angle: 'choice', pole: null, weight: 1.5,
    scene: 'sunk_cost_movie_hall',
    tag: '見続けてしまう映画・本',
    stem: '面白くないと思っても、「ここまで観たから」とそのまま最後まで見続けることがある。',
  },
  {
    id: 'B8_CHOICE_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B8',
    angle: 'choice', pole: null, weight: 1.0,
    scene: 'sunk_cost_subscription_keep',
    tag: '使っていないサービスを続ける',
    stem: '年間契約を先払いしたサービスをほぼ使っていなくても、解約よりも「元を取ろう」と思い続ける。',
  },
];
