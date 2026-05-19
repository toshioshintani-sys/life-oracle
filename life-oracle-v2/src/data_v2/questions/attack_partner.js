// 攻略型・恋人カテゴリ（観察視点）

export const ATTACK_PARTNER_QUESTIONS = [

  {
    id: 'atk_pt_001',
    type: 'entry',
    order: 1,
    text: 'その人は、あなたが機嫌が悪いとき最初にどう動きますか？',
    discriminates: [],
    choices: [
      {
        id: 'fix',
        label: '原因を特定して解決策を出そうとする',
        biasHints: { B5: 2, B3: 1 },
        jungShadowHints: { Te: 3, Ti: 1 },
        tags: ['fix_mode'],
      },
      {
        id: 'comfort',
        label: '何も言わずそばにいる・共感しようとする',
        biasHints: {},
        jungShadowHints: { Fe: 3, Fi: 1 },
        tags: ['comfort'],
      },
      {
        id: 'retreat',
        label: '空気を読んで距離を置く・嵐が過ぎるのを待つ',
        biasHints: { B6: 2, B9: 1 },
        jungShadowHints: { Si: 2, Ti: 1 },
        tags: ['retreat'],
      },
      {
        id: 'distract',
        label: '違う話題や楽しいことを持ち出して気分を変えようとする',
        biasHints: { B2: 2, B8: 1 },
        jungShadowHints: { Se: 2, Ne: 2 },
        tags: ['distract'],
      },
    ],
  },

  {
    id: 'atk_pt_002',
    type: 'entry',
    order: 2,
    text: 'その人は不満があるとき、どう伝えてきますか？',
    discriminates: [],
    choices: [
      {
        id: 'direct_say',
        label: 'はっきり「〇〇がいやだった」と言う',
        biasHints: {},
        jungShadowHints: { Te: 2, Se: 1 },
        tags: ['direct'],
      },
      {
        id: 'hint',
        label: '言葉より態度・雰囲気で気づいてほしそう',
        biasHints: { B11: 2, B8: 2 },
        jungShadowHints: { Fe: 2, Fi: 2 },
        tags: ['hinting'],
      },
      {
        id: 'accumulate',
        label: '溜め込んで、ある日一気に出る',
        biasHints: { B9: 3, B8: 1 },
        jungShadowHints: { Fi: 3, Ni: 1 },
        tags: ['accumulate'],
      },
      {
        id: 'analytical',
        label: '「なぜそうなるのか」を論理的に説明してくる',
        biasHints: { B5: 1 },
        jungShadowHints: { Ti: 3, Te: 1 },
        tags: ['analytical_complaint'],
      },
    ],
  },

  {
    id: 'atk_pt_003',
    type: 'probe',
    text: 'その人は「将来の話」をするとき、どんな話し方をしますか？',
    discriminates: [],
    choices: [
      {
        id: 'concrete_plan',
        label: '具体的な時期・条件・段取りを考えながら話す',
        biasHints: { B6: 1, B7: 1 },
        jungShadowHints: { Te: 2, Si: 2, Ni: 1 },
        tags: ['concrete_plan'],
      },
      {
        id: 'vague_dream',
        label: 'ふわっとしたイメージや夢として話す',
        biasHints: { B2: 2, B5: 1 },
        jungShadowHints: { Ne: 3, Ni: 1 },
        tags: ['vague_dream'],
      },
      {
        id: 'avoid',
        label: 'あまり将来を決めたがらない・話題を変える',
        biasHints: { B2: 3, B6: 1 },
        jungShadowHints: { Se: 2, Ne: 1, Ti: 1 },
        tags: ['future_avoid'],
      },
      {
        id: 'feeling_first',
        label: 'まず「こんな気持ちになりたい」という感覚から話す',
        biasHints: { B8: 1 },
        jungShadowHints: { Fi: 3, Ni: 1 },
        tags: ['feeling_first'],
      },
    ],
  },

  {
    id: 'atk_pt_004',
    type: 'probe',
    text: 'ケンカの後、その人は仲直りをどう切り出しますか？',
    discriminates: [],
    choices: [
      {
        id: 'apologize',
        label: 'まず謝ってくる（内容より関係修復優先）',
        biasHints: { B4: 2, B8: 1 },
        jungShadowHints: { Fe: 3 },
        tags: ['apologize_first'],
      },
      {
        id: 'explain',
        label: '自分の言いたかったことを改めて説明してくる',
        biasHints: { B5: 2, B3: 1 },
        jungShadowHints: { Ti: 2, Te: 1 },
        tags: ['explain'],
      },
      {
        id: 'act_normal',
        label: '時間が経ったら何事もなかったように話しかけてくる',
        biasHints: { B6: 2, B2: 1 },
        jungShadowHints: { Se: 2, Si: 1 },
        tags: ['act_normal'],
      },
      {
        id: 'wait',
        label: 'こちらから動くまで待っている',
        biasHints: { B9: 2 },
        jungShadowHints: { Fi: 2, Ni: 1 },
        tags: ['wait'],
      },
    ],
  },

  {
    id: 'atk_pt_005',
    type: 'probe',
    text: 'その人があなたへの愛情を示すとき、一番多いパターンは？',
    discriminates: [],
    choices: [
      {
        id: 'action',
        label: '何かをしてくれる（料理・手伝い・調べてくれるなど）',
        biasHints: {},
        jungShadowHints: { Te: 2, Se: 2 },
        tags: ['acts_of_service'],
      },
      {
        id: 'words',
        label: '言葉にして「好き」「ありがとう」を伝えてくれる',
        biasHints: { B8: 1 },
        jungShadowHints: { Fe: 3 },
        tags: ['words_of_affirmation'],
      },
      {
        id: 'time',
        label: '一緒にいる時間を大事にする・予定を合わせてくれる',
        biasHints: { B4: 1 },
        jungShadowHints: { Fe: 1, Se: 1, Fi: 1 },
        tags: ['quality_time'],
      },
      {
        id: 'gifts',
        label: 'プレゼントや「これ好きかなと思って」という細かい気配り',
        biasHints: { B8: 1, B2: 1 },
        jungShadowHints: { Fe: 1, Ni: 2 },
        tags: ['gifts'],
      },
    ],
  },

  {
    id: 'atk_pt_006',
    type: 'probe',
    text: 'その人が「もう無理」と感じたとき、どんな行動をしますか？',
    discriminates: [],
    choices: [
      {
        id: 'express',
        label: 'はっきり「つらい」「限界」と伝えてくる',
        biasHints: { B8: 1 },
        jungShadowHints: { Se: 1, Te: 2 },
        tags: ['express_limit'],
      },
      {
        id: 'disappear',
        label: '急に連絡が減る・既読スルーが増える',
        biasHints: { B9: 2, B6: 1 },
        jungShadowHints: { Fi: 3, Ni: 1 },
        tags: ['disappear'],
      },
      {
        id: 'passive_signal',
        label: '態度が変わるが理由を聞いても「別に」と言う',
        biasHints: { B11: 3, B9: 1 },
        jungShadowHints: { Fe: 2, Fi: 1 },
        tags: ['passive_signal'],
      },
      {
        id: 'talk_request',
        label: '「ちゃんと話したい」と場を設ける',
        biasHints: {},
        jungShadowHints: { Fe: 1, Ti: 2 },
        tags: ['talk_request'],
      },
    ],
  },
];
