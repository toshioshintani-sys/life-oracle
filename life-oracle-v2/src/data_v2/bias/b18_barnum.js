// B18 バーナム効果
// 誰にでも当てはまる記述を、自分だけに向けられた言葉として受け取る。「そう」でB18スコア上昇。

export const b18Barnum = [

  {
    id: 'B18_WORK_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B18',
    angle: 'work', pole: null, weight: 1.5,
    scene: 'barnum_assessment_result',
    tag: '適性検査の結果',
    stem: '適性検査や研修の診断結果を読むと、よく当たっていると感じる。',
  },
  {
    id: 'B18_WORK_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B18',
    angle: 'work', pole: null, weight: 1.0,
    scene: 'barnum_generic_advice',
    tag: '一般論の助言',
    stem: '誰にでも言えるような助言でも、自分に向けられた言葉として受け取る。',
  },

  {
    id: 'B18_RELATION_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B18',
    angle: 'relation', pole: null, weight: 1.5,
    scene: 'barnum_blood_type',
    tag: '性格の分類',
    stem: '血液型や星座の性格分類を聞くと、思い当たる節を探してしまう。',
  },
  {
    id: 'B18_RELATION_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B18',
    angle: 'relation', pole: null, weight: 1.0,
    scene: 'barnum_said_about_me',
    tag: '言われた一言',
    stem: '「あなたって〇〇だよね」と言われると、そういう気がしてくる。',
  },

  {
    id: 'B18_STRESS_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B18',
    angle: 'stress', pole: null, weight: 1.5,
    scene: 'barnum_horoscope_check',
    tag: '落ち込んだ日の占い',
    stem: '落ち込んでいるときほど、占いやメッセージを確かめたくなる。',
  },
  {
    id: 'B18_STRESS_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B18',
    angle: 'stress', pole: null, weight: 1.0,
    scene: 'barnum_symptom_list',
    tag: '当てはまる項目',
    stem: 'チェックリストを見ると、当てはまる項目のほうに目が行く。',
  },

  {
    id: 'B18_CHOICE_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B18',
    angle: 'choice', pole: null, weight: 1.5,
    scene: 'barnum_diagnosis_share',
    tag: '診断を試す',
    stem: '性格診断の結果に納得すると、人にも伝えたくなる。',
  },
  {
    id: 'B18_CHOICE_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B18',
    angle: 'choice', pole: null, weight: 1.0,
    scene: 'barnum_believe_positive',
    tag: '良いほうを信じる',
    stem: '同じ診断でも、良いことが書かれているほうを信じたくなる。',
  },
];
