// B15 ツァイガルニク効果
// 完了したことより、途中で止まっていることのほうが頭に残る。「そう」でB15スコア上昇。

export const b15Zeigarnik = [

  {
    id: 'B15_WORK_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B15',
    angle: 'work', pole: null, weight: 1.5,
    scene: 'zeigarnik_unfinished_task',
    tag: '終わっていない仕事',
    stem: '終わった仕事より、途中で止まっている仕事のほうが頭から離れない。',
  },
  {
    id: 'B15_WORK_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B15',
    angle: 'work', pole: null, weight: 1.0,
    scene: 'zeigarnik_interrupted',
    tag: '中断された作業',
    stem: '作業を途中で中断されると、別のことをしていても気になり続ける。',
  },

  {
    id: 'B15_RELATION_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B15',
    angle: 'relation', pole: null, weight: 1.5,
    scene: 'zeigarnik_unresolved_talk',
    tag: '終わっていない話',
    stem: '言いかけてやめた話や、決着しなかったやり取りが後を引く。',
  },
  {
    id: 'B15_RELATION_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B15',
    angle: 'relation', pole: null, weight: 1.0,
    scene: 'zeigarnik_no_reply',
    tag: '返事が来ない',
    stem: '返事が来ていないやり取りのことを、何度も思い出してしまう。',
  },

  {
    id: 'B15_STRESS_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B15',
    angle: 'stress', pole: null, weight: 1.5,
    scene: 'zeigarnik_cant_sleep',
    tag: '寝る前に浮かぶ',
    stem: '寝る前に、やり残したことのリストが勝手に頭に浮かぶ。',
  },
  {
    id: 'B15_STRESS_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B15',
    angle: 'stress', pole: null, weight: 1.0,
    scene: 'zeigarnik_holiday_work',
    tag: '休みでも気になる',
    stem: '休みの日でも、片付いていない用事のことが気になってしまう。',
  },

  {
    id: 'B15_CHOICE_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B15',
    angle: 'choice', pole: null, weight: 1.5,
    scene: 'zeigarnik_cliffhanger',
    tag: '続きが気になる',
    stem: 'キリの悪いところで終わると、続きが気になって次に進めてしまう。',
  },
  {
    id: 'B15_CHOICE_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B15',
    angle: 'choice', pole: null, weight: 1.0,
    scene: 'zeigarnik_half_done',
    tag: '中途半端が苦しい',
    stem: '中途半端なまま放置するくらいなら、無理にでも終わらせたくなる。',
  },
];
