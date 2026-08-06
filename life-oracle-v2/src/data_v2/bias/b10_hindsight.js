// B10 後知恵バイアス
// 結末を知った後で、前から予測できていたように感じる。「そう」でB10スコア上昇。

export const b10Hindsight = [

  {
    id: 'B10_WORK_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B10',
    angle: 'work', pole: null, weight: 1.5,
    scene: 'hindsight_knew_it',
    tag: 'やっぱりと思う',
    stem: '結果が出たあとで「やっぱりこうなると思っていた」と感じることがある。',
  },
  {
    id: 'B10_WORK_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B10',
    angle: 'work', pole: null, weight: 1.0,
    scene: 'hindsight_doomed_project',
    tag: '振り返ると無理筋',
    stem: '失敗した企画を振り返ると、最初から無理があったように見える。',
  },

  {
    id: 'B10_RELATION_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B10',
    angle: 'relation', pole: null, weight: 1.5,
    scene: 'hindsight_signs_were_there',
    tag: '兆候はあった',
    stem: '関係が終わったあとで、うまくいかない兆候は前からあったと思う。',
  },
  {
    id: 'B10_RELATION_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B10',
    angle: 'relation', pole: null, weight: 1.0,
    scene: 'hindsight_pinpoint_cause',
    tag: 'あの一言が原因',
    stem: '揉めごとのあと、あのときの一言が原因だったと決めつけてしまう。',
  },

  {
    id: 'B10_STRESS_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B10',
    angle: 'stress', pole: null, weight: 1.5,
    scene: 'hindsight_knew_i_was_pushing',
    tag: '無理の自覚',
    stem: '体調を崩したあと、無理をしていた自覚は前からあったと思う。',
  },
  {
    id: 'B10_STRESS_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B10',
    angle: 'stress', pole: null, weight: 1.0,
    scene: 'hindsight_obvious_signals',
    tag: '分かりやすいサイン',
    stem: 'あとから振り返ると、限界のサインは分かりやすかったように思える。',
  },

  {
    id: 'B10_CHOICE_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B10',
    angle: 'choice', pole: null, weight: 1.5,
    scene: 'hindsight_other_option_right',
    tag: '選ばなかった方',
    stem: '選ばなかったほうが正解だったと分かると、最初から分かっていた気がする。',
  },
  {
    id: 'B10_CHOICE_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B10',
    angle: 'choice', pole: null, weight: 1.0,
    scene: 'hindsight_should_have_bought',
    tag: '予感はあった',
    stem: '値上がりしたあとで「買っておけばよかった、予感はあった」と思う。',
  },
];
