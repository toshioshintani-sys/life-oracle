// 攻略型・親カテゴリ（観察視点）
// 「あなたの親はどうしますか」という観察質問プール

export const ATTACK_PARENT_QUESTIONS = [

  {
    id: 'atk_p_001',
    type: 'entry',
    order: 1,
    text: 'あなたが自分で決めた選択を親に話したとき、最初の反応は？',
    discriminates: [],
    choices: [
      {
        id: 'override',
        label: '自分の意見を上乗せして「こうしたほうがいい」と言い換える',
        biasHints: { B3: 2, B6: 2 },
        jungShadowHints: { Te: 2, Si: 1 },
        tags: ['override'],
      },
      {
        id: 'worry',
        label: 'まずリスクや失敗した場合の話をする',
        biasHints: { B1: 3, B6: 1 },
        jungShadowHints: { Si: 2, Ni: 1 },
        tags: ['loss_focus'],
      },
      {
        id: 'question',
        label: '「なんで？」「誰と決めたの？」と経緯を確認する',
        biasHints: { B3: 2, B4: 1 },
        jungShadowHints: { Fe: 2, Te: 1 },
        tags: ['process_check'],
      },
      {
        id: 'accept',
        label: '「あなたが決めたなら」とすぐ受け入れる',
        biasHints: {},
        jungShadowHints: { Fi: 1 },
        tags: ['accepting'],
      },
    ],
  },

  {
    id: 'atk_p_002',
    type: 'entry',
    order: 2,
    text: '親が「心配している」と言うとき、その心配はどんな形で出てきますか？',
    discriminates: [],
    choices: [
      {
        id: 'control',
        label: '連絡頻度が増え、行動を確認しようとする',
        biasHints: { B1: 2, B4: 2 },
        jungShadowHints: { Te: 1, Si: 2 },
        tags: ['surveillance'],
      },
      {
        id: 'lecture',
        label: '過去の失敗例や自分の経験談を持ち出す',
        biasHints: { B7: 2, B6: 2 },
        jungShadowHints: { Si: 3 },
        tags: ['past_reference'],
      },
      {
        id: 'silent_guilt',
        label: '「いいよ、いいよ」と言いながら雰囲気が重くなる',
        biasHints: { B8: 2, B11: 2 },
        jungShadowHints: { Fe: 3 },
        tags: ['passive_pressure'],
      },
      {
        id: 'direct',
        label: '「○○は危ない」「やめなさい」とはっきり言う',
        biasHints: { B1: 2, B5: 1 },
        jungShadowHints: { Te: 2, Fi: 1 },
        tags: ['direct_block'],
      },
    ],
  },

  {
    id: 'atk_p_003',
    type: 'probe',
    text: '親が「あなたのため」と言うとき、実際の動きはどちらに近いですか？',
    discriminates: [],
    choices: [
      {
        id: 'comparison',
        label: '兄弟・友達・近所の子と比較する',
        biasHints: { B4: 3, B7: 1 },
        jungShadowHints: { Fe: 2, Si: 1 },
        tags: ['comparison'],
      },
      {
        id: 'past_success',
        label: '自分が若いころにやってきた方法を勧める',
        biasHints: { B6: 3, B7: 2 },
        jungShadowHints: { Si: 3 },
        tags: ['past_method'],
      },
      {
        id: 'override_choice',
        label: '本人の希望を聞かずに手配や根回しをしてしまう',
        biasHints: { B5: 2, B3: 2 },
        jungShadowHints: { Te: 3 },
        tags: ['unilateral'],
      },
      {
        id: 'genuine',
        label: '希望を聞いて、一緒に考えようとする',
        biasHints: {},
        jungShadowHints: { Fi: 1, Fe: 1 },
        tags: ['collaborative'],
      },
    ],
  },

  {
    id: 'atk_p_004',
    type: 'probe',
    text: 'あなたが親に「ノー」を伝えたとき、その場の反応は？',
    discriminates: [],
    choices: [
      {
        id: 'silent_cold',
        label: '黙って会話が終わり、しばらく連絡が減る',
        biasHints: { B9: 2, B11: 2 },
        jungShadowHints: { Fi: 2, Fe: 1 },
        tags: ['withdrawal'],
      },
      {
        id: 'repeat',
        label: '日を変えてまた同じ提案を繰り返す',
        biasHints: { B6: 2, B3: 2 },
        jungShadowHints: { Si: 2, Te: 1 },
        tags: ['repeat_push'],
      },
      {
        id: 'guilt',
        label: '「親の気持ちもわかってほしい」と感情面で訴える',
        biasHints: { B8: 3, B11: 1 },
        jungShadowHints: { Fe: 3 },
        tags: ['guilt_trip'],
      },
      {
        id: 'ok',
        label: '「そうか」と受け入れて引く',
        biasHints: {},
        jungShadowHints: {},
        tags: ['respect'],
      },
    ],
  },

  {
    id: 'atk_p_005',
    type: 'probe',
    text: '親が「昔はよかった」と言うとき、話の向かい先は？',
    discriminates: [],
    choices: [
      {
        id: 'self_glory',
        label: '自分の若いころの苦労や成功体験',
        biasHints: { B5: 2, B7: 2 },
        jungShadowHints: { Si: 2, Te: 1 },
        tags: ['self_glory'],
      },
      {
        id: 'world_changed',
        label: '今の世の中や若者への不満',
        biasHints: { B6: 3, B3: 2 },
        jungShadowHints: { Si: 3, Te: 1 },
        tags: ['world_complaint'],
      },
      {
        id: 'family_bond',
        label: '家族がまとまっていた時代の話',
        biasHints: { B4: 2, B8: 2 },
        jungShadowHints: { Fe: 3, Si: 1 },
        tags: ['family_bond'],
      },
    ],
  },

  {
    id: 'atk_p_006',
    type: 'probe',
    text: '親がストレスを感じているとき、その出し方は？',
    discriminates: [],
    choices: [
      {
        id: 'irritable',
        label: '些細なことに当たりが強くなる・声のトーンが変わる',
        biasHints: { B8: 2, B2: 1 },
        jungShadowHints: { Te: 2, Se: 1 },
        tags: ['irritable'],
      },
      {
        id: 'martyrdom',
        label: '「私だけが頑張っている」という言葉が増える',
        biasHints: { B9: 3, B11: 2 },
        jungShadowHints: { Fe: 3 },
        tags: ['martyrdom'],
      },
      {
        id: 'busy_escape',
        label: '用事や掃除など、動き続けることで回避する',
        biasHints: { B2: 2, B6: 1 },
        jungShadowHints: { Si: 2, Se: 1 },
        tags: ['busy_escape'],
      },
      {
        id: 'silence',
        label: '黙って距離を置く',
        biasHints: { B9: 1 },
        jungShadowHints: { Ti: 2, Fi: 1 },
        tags: ['silent_withdrawal'],
      },
    ],
  },
];
