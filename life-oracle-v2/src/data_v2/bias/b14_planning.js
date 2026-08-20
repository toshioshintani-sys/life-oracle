// B14 計画錯誤
// 所要時間やコストを実際より少なく見積もる。「そう」でB14スコア上昇。

export const b14Planning = [

  {
    id: 'B14_WORK_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B14',
    angle: 'work', pole: null, weight: 1.5,
    scene: 'planning_deadline_slips',
    tag: '毎回押す予定',
    stem: '「これくらいで終わる」と見積もった作業が、毎回それより長くかかる。',
  },
  {
    id: 'B14_WORK_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B14',
    angle: 'work', pole: null, weight: 1.0,
    scene: 'planning_no_buffer',
    tag: '余白を入れない',
    stem: '予定を立てるとき、想定外のことが起きる余白を入れていない。',
  },

  {
    id: 'B14_RELATION_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B14',
    angle: 'relation', pole: null, weight: 1.5,
    scene: 'planning_promise_too_much',
    tag: '安請け合い',
    stem: '頼まれたとき、自分にこなせる量を多めに見積もって引き受けてしまう。',
  },
  {
    id: 'B14_RELATION_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B14',
    angle: 'relation', pole: null, weight: 1.0,
    scene: 'planning_late_reply',
    tag: 'あとで返す',
    stem: '「あとで返信する」と思ったまま、想定よりずっと遅れることがある。',
  },

  {
    id: 'B14_STRESS_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B14',
    angle: 'stress', pole: null, weight: 1.5,
    scene: 'planning_pile_up',
    tag: '積み上がる用事',
    stem: '一つひとつは短いはずの用事が、気づくと手に負えない量になっている。',
  },
  {
    id: 'B14_STRESS_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B14',
    angle: 'stress', pole: null, weight: 1.0,
    scene: 'planning_night_before',
    tag: '前日の誤算',
    stem: '締切の前日になってから、思っていた倍の作業量に気づく。',
  },

  {
    id: 'B14_CHOICE_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B14',
    angle: 'choice', pole: null, weight: 1.5,
    scene: 'planning_new_habit',
    tag: '始めるときの計画',
    stem: '新しく何かを始めるとき、続けられる頻度を高めに見積もってしまう。',
  },
  {
    id: 'B14_CHOICE_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B14',
    angle: 'choice', pole: null, weight: 1.0,
    scene: 'planning_budget_over',
    tag: '予算を超える',
    stem: '買い物や旅行の費用が、事前に考えていた額を上回りがちだ。',
  },
];
