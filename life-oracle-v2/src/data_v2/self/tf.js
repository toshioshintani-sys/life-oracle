// TF軸（思考 T ／ 感情 F）× 内省型（self）
// pole: 'T' → "そう"でTスコア上昇　pole: 'F' → "そう"でFスコア上昇

export const tfSelf = [

  // ── work（仕事場面）──────────────────────────────────────

  {
    id: 'TF_SELF_WORK_01',
    kind: 'axis', perspective: 'self', axis: 'TF', bias: null,
    angle: 'work', pole: 'T', weight: 1.5,
    scene: 'colleague_wrong_approach',
    tag: '同僚の判断に疑問',
    stem: '同僚のやり方が明らかに非効率だと気づいたとき、その場で指摘したくなる。',
  },
  {
    id: 'TF_SELF_WORK_02',
    kind: 'axis', perspective: 'self', axis: 'TF', bias: null,
    angle: 'work', pole: 'F', weight: 1.5,
    scene: 'team_atmosphere_check',
    tag: 'チームの空気',
    stem: '会議でみんながしんどそうにしていると、内容より先に場の空気が気になる。',
  },
  {
    id: 'TF_SELF_WORK_03',
    kind: 'axis', perspective: 'self', axis: 'TF', bias: null,
    angle: 'work', pole: 'T', weight: 1.0,
    scene: 'evaluation_criteria',
    tag: '人を評価するとき',
    stem: '誰かの仕事を評価するとき、その人への好き嫌いより結果や事実を優先する。',
  },
  {
    id: 'TF_SELF_WORK_03_ALT',
    kind: 'axis', perspective: 'self', axis: 'TF', bias: null,
    angle: 'work', pole: 'F', weight: 1.0,
    scene: 'feedback_delivery',
    tag: 'フィードバックの伝え方',
    stem: '部下や後輩に改善点を伝えるとき、正確さより先に相手の気持ちへの影響を考える。',
    altOf: 'TF_SELF_WORK_03',
  },

  // ── relation（人間関係）──────────────────────────────────

  {
    id: 'TF_SELF_RELATION_01',
    kind: 'axis', perspective: 'self', axis: 'TF', bias: null,
    angle: 'relation', pole: 'T', weight: 1.5,
    scene: 'friend_complaint_response',
    tag: '友人の愚痴',
    stem: '友人が仕事の悩みを話してきたとき、共感より先に「どうすれば解決するか」を考える。',
  },
  {
    id: 'TF_SELF_RELATION_02',
    kind: 'axis', perspective: 'self', axis: 'TF', bias: null,
    angle: 'relation', pole: 'F', weight: 1.5,
    scene: 'others_sad_feeling',
    tag: '誰かの落ち込み',
    stem: '身近な人が落ち込んでいるのを見ると、自分まで気持ちが沈んでくる。',
  },
  {
    id: 'TF_SELF_RELATION_03',
    kind: 'axis', perspective: 'self', axis: 'TF', bias: null,
    angle: 'relation', pole: 'T', weight: 1.0,
    scene: 'opinion_disagreement',
    tag: '意見が合わないとき',
    stem: '大切な人と意見が違ったとき、関係よりも「どちらが正しいか」を確かめたくなる。',
  },
  {
    id: 'TF_SELF_RELATION_03_ALT',
    kind: 'axis', perspective: 'self', axis: 'TF', bias: null,
    angle: 'relation', pole: 'F', weight: 1.0,
    scene: 'harmony_over_truth',
    tag: '場の和を優先',
    stem: '自分が正しいと思っていても、その場の雰囲気が壊れそうなら言うのをためらう。',
    altOf: 'TF_SELF_RELATION_03',
  },

  // ── stress（ストレス・限界時）────────────────────────────

  {
    id: 'TF_SELF_STRESS_01',
    kind: 'axis', perspective: 'self', axis: 'TF', bias: null,
    angle: 'stress', pole: 'T', weight: 1.5,
    scene: 'calm_down_by_logic',
    tag: '感情が高ぶったとき',
    stem: '感情が高ぶっているとき、まず状況を整理して頭を冷やすことで落ち着く。',
  },
  {
    id: 'TF_SELF_STRESS_02',
    kind: 'axis', perspective: 'self', axis: 'TF', bias: null,
    angle: 'stress', pole: 'F', weight: 1.5,
    scene: 'unfair_treatment_feeling',
    tag: '不当な扱いを受けた',
    stem: '理不尽な対応をされたとき、事実関係より先に「なぜそんな扱いをするのか」と傷つく。',
  },
  {
    id: 'TF_SELF_STRESS_03',
    kind: 'axis', perspective: 'self', axis: 'TF', bias: null,
    angle: 'stress', pole: 'T', weight: 1.0,
    scene: 'problem_over_emotion',
    tag: '問題に直面したとき',
    stem: '問題が起きたとき、気持ちを後回しにしても先に何をすべきかを考えた方が楽になる。',
  },

  // ── choice（選択・意思決定）──────────────────────────────

  {
    id: 'TF_SELF_CHOICE_01',
    kind: 'axis', perspective: 'self', axis: 'TF', bias: null,
    angle: 'choice', pole: 'T', weight: 1.5,
    scene: 'purchase_decision',
    tag: '何かを買うとき',
    stem: '何かを買うかどうか決めるとき、気分や雰囲気よりコスパや数字で判断する。',
  },
  {
    id: 'TF_SELF_CHOICE_02',
    kind: 'axis', perspective: 'self', axis: 'TF', bias: null,
    angle: 'choice', pole: 'F', weight: 1.5,
    scene: 'gut_feeling_choice',
    tag: '直感と条件が逆のとき',
    stem: 'スペックは劣るが「なんか好き」と感じた方を選ぶことが多い。',
  },
];
