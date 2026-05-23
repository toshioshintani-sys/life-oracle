// B2 現在バイアス
// 将来の大きな利益より今すぐの小さな満足を優先する。「そう」でB2スコア上昇。

export const b02Present = [

  {
    id: 'B2_WORK_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B2',
    angle: 'work', pole: null, weight: 1.5,
    scene: 'present_procrastinate_report',
    tag: '締切前の先延ばし',
    stem: '締切まで日数があると、今日やるより「明日やればいい」と後回しにしてしまうことが多い。',
  },
  {
    id: 'B2_WORK_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B2',
    angle: 'work', pole: null, weight: 1.0,
    scene: 'present_urgent_vs_important',
    tag: '緊急と重要',
    stem: '重要だが急ぎでない仕事より、急いでいるが大して重要でない仕事を先に片づけることが多い。',
  },

  {
    id: 'B2_RELATION_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B2',
    angle: 'relation', pole: null, weight: 1.5,
    scene: 'present_reply_later',
    tag: '返信を後回しに',
    stem: '気の重いメッセージに「後で返そう」と思って、何日も未読のまま放置してしまうことがある。',
  },
  {
    id: 'B2_RELATION_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B2',
    angle: 'relation', pole: null, weight: 1.0,
    scene: 'present_short_fun_over_plan',
    tag: '今日の楽しさ優先',
    stem: '将来のための準備より、今日を楽しむことに時間を使う選択をしやすい。',
  },

  {
    id: 'B2_STRESS_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B2',
    angle: 'stress', pole: null, weight: 1.5,
    scene: 'present_stress_eat_or_spend',
    tag: 'ストレス発散の即時行動',
    stem: 'ストレスを感じると、後で後悔すると分かっていても、その場で食べたり買ったりして発散してしまう。',
  },
  {
    id: 'B2_STRESS_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B2',
    angle: 'stress', pole: null, weight: 1.0,
    scene: 'present_avoid_discomfort_now',
    tag: '不快を避ける即決',
    stem: '今すぐ不快な状況を終わらせるために、後で困ることになる選択をしてしまうことがある。',
  },

  {
    id: 'B2_CHOICE_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B2',
    angle: 'choice', pole: null, weight: 1.5,
    scene: 'present_impulse_buy',
    tag: '衝動買い',
    stem: '「必要かどうか」より「今欲しいかどうか」で買い物を決めてしまうことが多い。',
  },
  {
    id: 'B2_CHOICE_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B2',
    angle: 'choice', pole: null, weight: 1.0,
    scene: 'present_skip_exercise_today',
    tag: '習慣を今日だけ休む',
    stem: '「今日だけ特別」と言い訳して、決めていた習慣をやめてしまうことがしばしばある。',
  },
];
