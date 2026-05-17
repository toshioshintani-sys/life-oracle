// B6 現状維持バイアス
// 変化より慣れ親しんだ状態を維持したがる。「そう」でB6スコア上昇。

export const b06StatusQuo = [

  {
    id: 'B6_WORK_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B6',
    angle: 'work', pole: null, weight: 1.5,
    scene: 'status_quo_tool_change',
    tag: 'ツールの切り替え',
    stem: '新しいツールに乗り換えると便利になると分かっていても、慣れた方法を続けてしまうことが多い。',
  },
  {
    id: 'B6_WORK_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B6',
    angle: 'work', pole: null, weight: 1.0,
    scene: 'status_quo_job_change_hesitate',
    tag: '転職の踏み出せなさ',
    stem: '今の職場より良い条件の話があっても、環境が変わることへの不安の方が先に来る。',
  },

  {
    id: 'B6_RELATION_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B6',
    angle: 'relation', pole: null, weight: 1.5,
    scene: 'status_quo_same_group',
    tag: '同じコミュニティに居続ける',
    stem: '新しいコミュニティに入るより、今のつながりの中でやりとりを続ける方が自然に選んでしまう。',
  },
  {
    id: 'B6_RELATION_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B6',
    angle: 'relation', pole: null, weight: 1.0,
    scene: 'status_quo_comfortable_distance',
    tag: '関係の距離感を変えない',
    stem: 'もっと仲良くなれそうな人がいても、今の距離感を変えずにいる方が楽に感じる。',
  },

  {
    id: 'B6_STRESS_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B6',
    angle: 'stress', pole: null, weight: 1.5,
    scene: 'status_quo_resist_change_under_pressure',
    tag: '変化を求められたとき',
    stem: '上から「やり方を変えよう」と言われると、改善点より先に抵抗感を感じる。',
  },
  {
    id: 'B6_STRESS_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B6',
    angle: 'stress', pole: null, weight: 1.0,
    scene: 'status_quo_familiar_routine',
    tag: 'ルーティンが崩れたとき',
    stem: '毎日のルーティンが崩れると、内容に関係なく落ち着かない感じが残る。',
  },

  {
    id: 'B6_CHOICE_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B6',
    angle: 'choice', pole: null, weight: 1.5,
    scene: 'status_quo_same_restaurant',
    tag: '行き慣れた店を選ぶ',
    stem: '新しいお店を探すより、知っているお店に行く方が気楽だと感じる。',
  },
  {
    id: 'B6_CHOICE_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B6',
    angle: 'choice', pole: null, weight: 1.0,
    scene: 'status_quo_default_option',
    tag: 'デフォルトをそのまま使う',
    stem: 'アプリや契約の初期設定は、変えると面倒そうだからとそのままにしがちだ。',
  },
];
