// B11 ハロー効果
// 一つの目立つ特徴が、他の側面の評価まで引っ張る。「そう」でB11スコア上昇。

export const b11Halo = [

  {
    id: 'B11_WORK_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B11',
    angle: 'work', pole: null, weight: 1.5,
    scene: 'halo_good_speaker',
    tag: '話し方が上手い人',
    stem: '話し方が上手い人は、仕事もできるように感じてしまう。',
  },
  {
    id: 'B11_WORK_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B11',
    angle: 'work', pole: null, weight: 1.0,
    scene: 'halo_title_authority',
    tag: '肩書きを聞くと',
    stem: '肩書きや経歴を聞くと、その人の意見が正しく思えてくる。',
  },

  {
    id: 'B11_RELATION_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B11',
    angle: 'relation', pole: null, weight: 1.5,
    scene: 'halo_appearance_to_character',
    tag: '見た目から性格へ',
    stem: '見た目や清潔感の印象が、その人の性格の評価にまで広がってしまう。',
  },
  {
    id: 'B11_RELATION_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B11',
    angle: 'relation', pole: null, weight: 1.0,
    scene: 'halo_flaws_as_charm',
    tag: '欠点が個性に見える',
    stem: '好意を持っている相手の欠点は、個性として受け取ってしまう。',
  },

  {
    id: 'B11_STRESS_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B11',
    angle: 'stress', pole: null, weight: 1.5,
    scene: 'halo_hard_to_refuse',
    tag: '感じの良い相手',
    stem: '感じの良い相手だと、無理な頼みでも断りにくい。',
  },
  {
    id: 'B11_STRESS_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B11',
    angle: 'stress', pole: null, weight: 1.0,
    scene: 'halo_ignore_red_flags',
    tag: '違和感を打ち消す',
    stem: '一度良い印象を持つと、違和感があってもそれを打ち消してしまう。',
  },

  {
    id: 'B11_CHOICE_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B11',
    angle: 'choice', pole: null, weight: 1.5,
    scene: 'halo_package_design',
    tag: '見た目が良い商品',
    stem: 'パッケージやデザインが良いと、中身も良さそうに思える。',
  },
  {
    id: 'B11_CHOICE_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B11',
    angle: 'choice', pole: null, weight: 1.0,
    scene: 'halo_brand_trust',
    tag: '有名なブランド',
    stem: '知っているブランドだと、細かく比べずに選んでしまう。',
  },
];
