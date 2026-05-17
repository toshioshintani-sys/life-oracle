// B1 損失回避バイアス
// 得るより失う痛みを2倍重く感じる。「そう」でB1スコア上昇。

export const b01Loss = [

  {
    id: 'B1_WORK_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B1',
    angle: 'work', pole: null, weight: 1.5,
    scene: 'loss_avoid_new_project',
    tag: '新しい仕事の判断',
    stem: '魅力的な新プロジェクトの話が来ても、今の仕事が減るリスクを考えると踏み切れないことが多い。',
  },
  {
    id: 'B1_WORK_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B1',
    angle: 'work', pole: null, weight: 1.0,
    scene: 'loss_avoid_proposal_rejection',
    tag: '提案を出すとき',
    stem: '会議で提案が却下されそうだと感じると、言わずに黙っている選択をしがちだ。',
  },

  {
    id: 'B1_RELATION_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B1',
    angle: 'relation', pole: null, weight: 1.5,
    scene: 'loss_avoid_relationship_distance',
    tag: '関係が壊れるのが怖い',
    stem: '本音を言って関係が壊れるくらいなら、自分が我慢する方を選ぶことが多い。',
  },
  {
    id: 'B1_RELATION_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B1',
    angle: 'relation', pole: null, weight: 1.0,
    scene: 'loss_avoid_unfriend',
    tag: 'SNSのフォロー解除',
    stem: 'SNSでフォローを外すとき、相手に気づかれて関係が壊れないかが気になる。',
  },

  {
    id: 'B1_STRESS_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B1',
    angle: 'stress', pole: null, weight: 1.5,
    scene: 'loss_avoid_already_had',
    tag: '持っているものを失う恐怖',
    stem: '今持っているものを失う不安と、新しいものを得る期待を比べると、不安の方が大きく感じる。',
  },
  {
    id: 'B1_STRESS_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B1',
    angle: 'stress', pole: null, weight: 1.0,
    scene: 'loss_avoid_bet_feel',
    tag: '損と得が同じ金額のとき',
    stem: '5万円を得るチャンスより、5万円を失うリスクの方が頭から離れにくい。',
  },

  {
    id: 'B1_CHOICE_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B1',
    angle: 'choice', pole: null, weight: 1.5,
    scene: 'loss_avoid_cancel_subscription',
    tag: '契約を解約するとき',
    stem: 'あまり使っていないサービスでも、解約すると損する気がして、なかなか辞める決断ができない。',
  },
  {
    id: 'B1_CHOICE_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'B1',
    angle: 'choice', pole: null, weight: 1.0,
    scene: 'loss_avoid_downgrade_option',
    tag: '選択肢が減る選択',
    stem: 'どちらを選んでも同じ結果が得られるなら、何かを手放さなくて済む方を選ぶ。',
  },
];
