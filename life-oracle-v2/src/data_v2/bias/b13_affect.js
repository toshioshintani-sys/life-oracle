// B13 感情ヒューリスティック
// 「なんとなく好き／嫌い」が論理より先に判断を決める。「そう」でB13スコア上昇。

export const b13Affect = [

  {
    id: 'B13_WORK_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B13',
    angle: 'work', pole: null, weight: 1.5,
    scene: 'affect_gut_feeling_first',
    tag: 'なんとなく嫌',
    stem: '理屈では問題ないのに、「なんとなく嫌だ」という感覚のほうを優先してしまう。',
  },
  {
    id: 'B13_WORK_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B13',
    angle: 'work', pole: null, weight: 1.0,
    scene: 'affect_mood_decides',
    tag: 'その日の気分',
    stem: '同じ提案でも、その日の機嫌によって評価が変わっている気がする。',
  },

  {
    id: 'B13_RELATION_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B13',
    angle: 'relation', pole: null, weight: 1.5,
    scene: 'affect_dislike_then_reason',
    tag: '苦手が先',
    stem: '苦手だと感じた相手には、あとから理由を見つけて納得している。',
  },
  {
    id: 'B13_RELATION_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B13',
    angle: 'relation', pole: null, weight: 1.0,
    scene: 'affect_likeable_forgiven',
    tag: '好きな人は許せる',
    stem: '好意を持っている相手のミスは、寛容に受け止められる。',
  },

  {
    id: 'B13_STRESS_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B13',
    angle: 'stress', pole: null, weight: 1.5,
    scene: 'affect_tired_pessimism',
    tag: '疲れている日',
    stem: '疲れている日は、同じ状況でも悪いほうに考えてしまう。',
  },
  {
    id: 'B13_STRESS_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B13',
    angle: 'stress', pole: null, weight: 1.0,
    scene: 'affect_anxious_avoid',
    tag: '不安だと避ける',
    stem: '不安が強いときは、確認するより先に距離を置いてしまう。',
  },

  {
    id: 'B13_CHOICE_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B13',
    angle: 'choice', pole: null, weight: 1.5,
    scene: 'affect_first_impression_buy',
    tag: '直感で決める',
    stem: '比較して選んだつもりでも、最後は「こっちのほうが好き」で決めている。',
  },
  {
    id: 'B13_CHOICE_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B13',
    angle: 'choice', pole: null, weight: 1.0,
    scene: 'affect_reject_by_feel',
    tag: '感じで却下',
    stem: '条件は良いのに、雰囲気が合わないという理由で見送ることがある。',
  },
];
