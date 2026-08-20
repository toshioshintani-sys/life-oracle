// B20 正常性バイアス
// 異常や警告を前にしても「自分は大丈夫」と平常の範囲に収めてしまう。「そう」でB20スコア上昇。

export const b20Normalcy = [

  {
    id: 'B20_WORK_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B20',
    angle: 'work', pole: null, weight: 1.5,
    scene: 'normalcy_warning_sign',
    tag: '見送る違和感',
    stem: '職場で気になる兆候があっても、大ごとにはならないと考えて様子を見る。',
  },
  {
    id: 'B20_WORK_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B20',
    angle: 'work', pole: null, weight: 1.0,
    scene: 'normalcy_deadline_ok',
    tag: 'まだ間に合う',
    stem: '遅れが出ていても、「まだ取り返せる範囲だ」と考えてしまう。',
  },

  {
    id: 'B20_RELATION_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B20',
    angle: 'relation', pole: null, weight: 1.5,
    scene: 'normalcy_relationship_signs',
    tag: '関係のほころび',
    stem: '相手の態度が変わっても、気のせいだろうと考えて確かめない。',
  },
  {
    id: 'B20_RELATION_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B20',
    angle: 'relation', pole: null, weight: 1.0,
    scene: 'normalcy_others_first',
    tag: '周りが動かないなら',
    stem: '周りが誰も動いていないと、自分も動かなくていいと感じる。',
  },

  {
    id: 'B20_STRESS_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B20',
    angle: 'stress', pole: null, weight: 1.5,
    scene: 'normalcy_body_signal',
    tag: '体のサイン',
    stem: '体調に変化があっても、休むほどではないと判断してしまう。',
  },
  {
    id: 'B20_STRESS_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B20',
    angle: 'stress', pole: null, weight: 1.0,
    scene: 'normalcy_limit_denial',
    tag: 'まだ平気',
    stem: '限界が近いと感じても、これまで何とかなったからと続けてしまう。',
  },

  {
    id: 'B20_CHOICE_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B20',
    angle: 'choice', pole: null, weight: 1.5,
    scene: 'normalcy_alert_ignored',
    tag: '警報が鳴っても',
    stem: '警報や注意喚起を見ても、自分に関係するとは考えにくい。',
  },
  {
    id: 'B20_CHOICE_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B20',
    angle: 'choice', pole: null, weight: 1.0,
    scene: 'normalcy_postpone_prep',
    tag: '備えを先送り',
    stem: '備えが必要だと分かっていても、いま急ぐことではないと思ってしまう。',
  },
];
