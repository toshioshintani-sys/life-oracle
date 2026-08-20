// B16 スポットライト効果
// 自分が他人からどれだけ見られているかを過大に見積もる。「そう」でB16スコア上昇。

export const b16Spotlight = [

  {
    id: 'B16_WORK_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B16',
    angle: 'work', pole: null, weight: 1.5,
    scene: 'spotlight_meeting_mistake',
    tag: '会議での言い間違い',
    stem: '会議で言い間違えたことを、自分だけがずっと覚えている気がする。',
  },
  {
    id: 'B16_WORK_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B16',
    angle: 'work', pole: null, weight: 1.0,
    scene: 'spotlight_being_watched',
    tag: '見られている感覚',
    stem: '仕事の進み具合を、周りに見られているように感じることがある。',
  },

  {
    id: 'B16_RELATION_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B16',
    angle: 'relation', pole: null, weight: 1.5,
    scene: 'spotlight_appearance',
    tag: '見た目の粗',
    stem: '髪型や服のちょっとした乱れを、周りも気づいていると思ってしまう。',
  },
  {
    id: 'B16_RELATION_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B16',
    angle: 'relation', pole: null, weight: 1.0,
    scene: 'spotlight_replay_words',
    tag: '自分の発言の再生',
    stem: '自分が言ったことを、あとから何度も再生して気にしてしまう。',
  },

  {
    id: 'B16_STRESS_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B16',
    angle: 'stress', pole: null, weight: 1.5,
    scene: 'spotlight_fear_of_judgement',
    tag: '評価されている感じ',
    stem: '失敗すると、その場の全員から評価が下がったように感じる。',
  },
  {
    id: 'B16_STRESS_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B16',
    angle: 'stress', pole: null, weight: 1.0,
    scene: 'spotlight_leaving_early',
    tag: '先に帰る気まずさ',
    stem: '先に退社したり途中で抜けたりすると、目立っている気がする。',
  },

  {
    id: 'B16_CHOICE_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B16',
    angle: 'choice', pole: null, weight: 1.5,
    scene: 'spotlight_avoid_standing_out',
    tag: '目立たない選択',
    stem: '目立ちたくないという理由で、無難なほうを選ぶことがある。',
  },
  {
    id: 'B16_CHOICE_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B16',
    angle: 'choice', pole: null, weight: 1.0,
    scene: 'spotlight_photo_check',
    tag: '写真の自分',
    stem: '集合写真を見るとき、まず自分の写り方を確認してしまう。',
  },
];
