// 攻略型・恋人未満友達以上カテゴリ（観察視点）
// この微妙な関係特有の観察ポイントに絞る

export const ATTACK_ALMOST_PARTNER_QUESTIONS = [

  {
    id: 'atk_ap_001',
    type: 'entry',
    order: 1,
    text: 'その人があなたに連絡してくるのは、どんなタイミングが多いですか？',
    discriminates: [],
    choices: [
      {
        id: 'when_lonely',
        label: '夜・休日・暇そうなとき',
        biasHints: { B2: 3, B8: 1 },
        jungShadowHints: { Se: 2, Fe: 1 },
        tags: ['lonely_contact'],
      },
      {
        id: 'share_moment',
        label: '何か面白いことがあったとき・すぐ共有したいとき',
        biasHints: { B2: 2, B8: 1 },
        jungShadowHints: { Ne: 2, Se: 1 },
        tags: ['share_moment'],
      },
      {
        id: 'need_advice',
        label: '困ったとき・相談したいとき',
        biasHints: { B1: 2, B4: 1 },
        jungShadowHints: { Fe: 2, Ni: 1 },
        tags: ['need_advice'],
      },
      {
        id: 'routine',
        label: '毎日のルーティンとして連絡がある',
        biasHints: { B6: 2, B4: 1 },
        jungShadowHints: { Si: 3, Fe: 1 },
        tags: ['routine'],
      },
    ],
  },

  {
    id: 'atk_ap_002',
    type: 'entry',
    order: 2,
    text: 'あなたが他の異性（友人）の話をしたとき、その人はどう反応しますか？',
    discriminates: [],
    choices: [
      {
        id: 'obvious_jealous',
        label: '明らかに態度が変わる・質問が増える',
        biasHints: { B9: 2, B8: 2 },
        jungShadowHints: { Fi: 2, Se: 1 },
        tags: ['obvious_jealous'],
      },
      {
        id: 'neutral',
        label: '特に反応が変わらない',
        biasHints: {},
        jungShadowHints: { Ti: 2, Se: 1 },
        tags: ['neutral'],
      },
      {
        id: 'cool_but_probe',
        label: '表面上は普通だが、さりげなく詳細を聞いてくる',
        biasHints: { B3: 2, B9: 1 },
        jungShadowHints: { Ni: 2, Fi: 1 },
        tags: ['cool_probe'],
      },
      {
        id: 'change_topic',
        label: 'すぐ自分の話に切り替える',
        biasHints: { B5: 2 },
        jungShadowHints: { Te: 1, Se: 1 },
        tags: ['deflect_topic'],
      },
    ],
  },

  {
    id: 'atk_ap_003',
    type: 'probe',
    text: 'その人が「友達として」と言いながらとる行動は、どちらに近いですか？',
    discriminates: [],
    choices: [
      {
        id: 'over_service',
        label: '友達には普通しないことをしてくれる（送り迎え・手伝いなど）',
        biasHints: { B8: 2, B11: 1 },
        jungShadowHints: { Fe: 2, Si: 1 },
        tags: ['over_service'],
      },
      {
        id: 'distance',
        label: '友達以上にはっきりラインを引いている感じがする',
        biasHints: { B6: 2, B9: 1 },
        jungShadowHints: { Ti: 2, Fi: 1 },
        tags: ['clear_distance'],
      },
      {
        id: 'inconsistent',
        label: '近づいたかと思えば引く、を繰り返す',
        biasHints: { B12: 3, B9: 1 },
        jungShadowHints: { Fi: 2, Ni: 1 },
        tags: ['hot_cold'],
      },
      {
        id: 'normal_friend',
        label: '他の友人と扱いが変わらない',
        biasHints: {},
        jungShadowHints: { Fe: 1, Se: 1 },
        tags: ['normal_friend'],
      },
    ],
  },

  {
    id: 'atk_ap_004',
    type: 'probe',
    text: 'その人は「好き」「気になっている」を言語化する人ですか？',
    discriminates: [],
    choices: [
      {
        id: 'verbal',
        label: '思ったことをすぐ言葉にする',
        biasHints: { B8: 1, B2: 1 },
        jungShadowHints: { Se: 2, Fe: 2 },
        tags: ['verbal'],
      },
      {
        id: 'action_only',
        label: '言葉より行動で示す',
        biasHints: {},
        jungShadowHints: { Se: 1, Te: 1, Si: 1 },
        tags: ['action_over_words'],
      },
      {
        id: 'neither',
        label: 'どちらも少ない・伝え方が不明瞭',
        biasHints: { B9: 2, B12: 1 },
        jungShadowHints: { Fi: 3, Ti: 1 },
        tags: ['unclear'],
      },
    ],
  },

  {
    id: 'atk_ap_005',
    type: 'probe',
    text: 'その人は、将来的に「付き合う」ことについてどんなスタンスをとっていますか？',
    discriminates: [],
    choices: [
      {
        id: 'avoid_topic',
        label: 'そういう話になると曖昧にしてかわす',
        biasHints: { B6: 2, B2: 2 },
        jungShadowHints: { Se: 2, Ne: 1 },
        tags: ['avoid_commitment'],
      },
      {
        id: 'positive_signal',
        label: '将来を一緒に話すシーンを作ろうとする',
        biasHints: { B8: 1 },
        jungShadowHints: { Ni: 2, Fe: 1 },
        tags: ['future_signal'],
      },
      {
        id: 'overthink',
        label: '「まだ早い」「ちゃんと考えたい」と慎重',
        biasHints: { B1: 2, B6: 1 },
        jungShadowHints: { Si: 2, Ni: 1, Ti: 1 },
        tags: ['cautious'],
      },
    ],
  },
];
