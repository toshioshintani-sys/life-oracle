// B3 確証バイアス
// 自分の考えを支持する情報を無意識に優先する。「そう」でB3スコア上昇。

export const b03Confirmation = [

  {
    id: 'B3_WORK_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B3',
    angle: 'work', pole: null, weight: 1.5,
    scene: 'confirmation_supporting_evidence',
    tag: '裏づけばかり集まる',
    stem: '一度こうだと思うと、それを裏づける材料のほうばかり集めてしまう。',
  },
  {
    id: 'B3_WORK_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B3',
    angle: 'work', pole: null, weight: 1.0,
    scene: 'confirmation_agreeing_voices',
    tag: '賛成した人の声',
    stem: '会議のあと、自分の案に賛成してくれた人の発言のほうをよく覚えている。',
  },

  {
    id: 'B3_RELATION_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B3',
    angle: 'relation', pole: null, weight: 1.5,
    scene: 'confirmation_person_label',
    tag: 'そう見え始める',
    stem: '「この人はこういう人だ」と思うと、その通りの場面ばかり目に入るようになる。',
  },
  {
    id: 'B3_RELATION_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B3',
    angle: 'relation', pole: null, weight: 1.0,
    scene: 'confirmation_dismiss_good',
    tag: 'たまたま扱い',
    stem: '苦手な相手が良いことをしても、「たまたまだろう」と思ってしまう。',
  },

  {
    id: 'B3_STRESS_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B3',
    angle: 'stress', pole: null, weight: 1.5,
    scene: 'confirmation_anxious_search',
    tag: '不安を裏づける検索',
    stem: '不安なときほど、その不安が当たっていると分かる情報ばかり探してしまう。',
  },
  {
    id: 'B3_STRESS_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B3',
    angle: 'stress', pole: null, weight: 1.0,
    scene: 'confirmation_symptom_match',
    tag: '当てはまる記事だけ',
    stem: '体調が気になるとき、自分に当てはまる症状が書かれた記事のほうを読み進めてしまう。',
  },

  {
    id: 'B3_CHOICE_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B3',
    angle: 'choice', pole: null, weight: 1.5,
    scene: 'confirmation_review_after_decision',
    tag: '買うと決めた後',
    stem: '買うと決めた後は、悪い評価より良い評価のほうを信じたくなる。',
  },
  {
    id: 'B3_CHOICE_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B3',
    angle: 'choice', pole: null, weight: 1.0,
    scene: 'confirmation_defend_choice',
    tag: '選ばなかった方のあら',
    stem: '選んだ後で、選ばなかったほうの欠点を探してしまうことがある。',
  },
];
