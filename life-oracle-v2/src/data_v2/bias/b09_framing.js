// B9 フレーミング効果
// 同じ内容でも表現の枠組みで受け取り方が変わる。「そう」でB9スコア上昇。

export const b09Framing = [

  {
    id: 'B9_WORK_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B9',
    angle: 'work', pole: null, weight: 1.5,
    scene: 'framing_achieved_vs_remaining',
    tag: '達成率と未達率',
    stem: '「達成率80%」と「未達20%」では、同じ数字でも受ける印象が変わる。',
  },
  {
    id: 'B9_WORK_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B9',
    angle: 'work', pole: null, weight: 1.0,
    scene: 'framing_risk_wording',
    tag: '言い方で慎重になる',
    stem: '「失敗する可能性がある」と言われると、確率が同じでも慎重になる。',
  },

  {
    id: 'B9_RELATION_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B9',
    angle: 'relation', pole: null, weight: 1.5,
    scene: 'framing_gentle_feedback',
    tag: '同じ指摘でも',
    stem: '同じ指摘でも、言い方がやわらかいほうが素直に受け取れる。',
  },
  {
    id: 'B9_RELATION_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B9',
    angle: 'relation', pole: null, weight: 1.0,
    scene: 'framing_request_positive',
    tag: '頼まれ方',
    stem: '「〜しないで」より「〜してくれると助かる」と言われたほうが動ける。',
  },

  {
    id: 'B9_STRESS_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B9',
    angle: 'stress', pole: null, weight: 1.5,
    scene: 'framing_days_left',
    tag: 'あと3日、もう3日',
    stem: '「あと3日ある」と考えるか「もう3日しかない」と考えるかで、気持ちが変わる。',
  },
  {
    id: 'B9_STRESS_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B9',
    angle: 'stress', pole: null, weight: 1.0,
    scene: 'framing_elapsed_time',
    tag: '過ぎた時間を数える',
    stem: '残り時間より、過ぎてしまった時間を数えるほうが焦る。',
  },

  {
    id: 'B9_CHOICE_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B9',
    angle: 'choice', pole: null, weight: 1.5,
    scene: 'framing_fat_free_label',
    tag: '表示の書き方',
    stem: '「脂肪10%」より「無脂肪90%」と書かれたほうを選びたくなる。',
  },
  {
    id: 'B9_CHOICE_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B9',
    angle: 'choice', pole: null, weight: 1.0,
    scene: 'framing_money_back',
    tag: '返金保証の一文',
    stem: '「返金保証あり」と書いてあるだけで、安心して選べる。',
  },
];
