// 攻略型・きょうだいカテゴリ（観察視点）

export const ATTACK_SIBLING_QUESTIONS = [

  {
    id: 'atk_sb_001',
    type: 'entry',
    order: 1,
    text: 'きょうだい間で意見が食い違ったとき、その人はどうしますか？',
    discriminates: [],
    choices: [
      {
        id: 'argue',
        label: '自分の正しさを証明しようと話し続ける',
        biasHints: { B5: 2, B3: 2 },
        jungShadowHints: { Te: 2, Ti: 1 },
        tags: ['argue'],
      },
      {
        id: 'withdraw_sulk',
        label: '黙って引いて、あとで機嫌が悪い',
        biasHints: { B9: 2, B11: 1 },
        jungShadowHints: { Fi: 2, Fe: 1 },
        tags: ['sulk_withdraw'],
      },
      {
        id: 'parent_appeal',
        label: '親や第三者を巻き込む',
        biasHints: { B4: 2, B8: 1 },
        jungShadowHints: { Fe: 2, Si: 1 },
        tags: ['third_party'],
      },
      {
        id: 'compromise',
        label: 'すぐ「まあいいか」と流せる',
        biasHints: { B6: 1, B2: 1 },
        jungShadowHints: { Se: 1, Ne: 1 },
        tags: ['easy_going'],
      },
    ],
  },

  {
    id: 'atk_sb_002',
    type: 'entry',
    order: 2,
    text: 'そのきょうだいは、あなたの成功や良いニュースにどう反応しますか？',
    discriminates: [],
    choices: [
      {
        id: 'compare',
        label: '自分の話に切り替える・「私も実は〜」と並列にする',
        biasHints: { B5: 2, B9: 2 },
        jungShadowHints: { Te: 1, Fe: 2 },
        tags: ['compare_self'],
      },
      {
        id: 'genuine_happy',
        label: '素直に喜んでくれる',
        biasHints: {},
        jungShadowHints: { Fe: 1, Fi: 1 },
        tags: ['genuine_joy'],
      },
      {
        id: 'practical',
        label: '「それで何か変わるの？」と実利を聞く',
        biasHints: { B1: 1, B7: 1 },
        jungShadowHints: { Te: 2, Si: 1 },
        tags: ['practical_check'],
      },
      {
        id: 'downplay_praise',
        label: '「すごいね」と言いながら少しだけ棘がある',
        biasHints: { B9: 3, B11: 1 },
        jungShadowHints: { Fi: 2, Fe: 2 },
        tags: ['backhanded'],
      },
    ],
  },

  {
    id: 'atk_sb_003',
    type: 'probe',
    text: '家族の集まりで、そのきょうだいが取る役割は？',
    discriminates: [],
    choices: [
      {
        id: 'organizer',
        label: '仕切りたがる・段取りを決める',
        biasHints: { B5: 2, B6: 1 },
        jungShadowHints: { Te: 3, Si: 1 },
        tags: ['organizer'],
      },
      {
        id: 'peacemaker',
        label: '空気を読んで場をつなぐ',
        biasHints: { B4: 2, B8: 1 },
        jungShadowHints: { Fe: 3 },
        tags: ['peacemaker'],
      },
      {
        id: 'background',
        label: '端のほうで静かにしている',
        biasHints: { B6: 1 },
        jungShadowHints: { Ti: 2, Fi: 1, Si: 1 },
        tags: ['background'],
      },
      {
        id: 'entertainer',
        label: '場を盛り上げる・話題を作る',
        biasHints: { B2: 1, B5: 1 },
        jungShadowHints: { Se: 2, Ne: 2, Fe: 1 },
        tags: ['entertainer'],
      },
    ],
  },

  {
    id: 'atk_sb_004',
    type: 'probe',
    text: 'そのきょうだいが「貸して」「助けて」と言ってくるとき、どんな状況が多いですか？',
    discriminates: [],
    choices: [
      {
        id: 'emergency',
        label: '急場しのぎ・今すぐ困ったときだけ',
        biasHints: { B2: 3, B1: 1 },
        jungShadowHints: { Se: 2, Ne: 1 },
        tags: ['emergency_only'],
      },
      {
        id: 'routine',
        label: 'いつも同じパターンで頼んでくる',
        biasHints: { B6: 2, B9: 1 },
        jungShadowHints: { Si: 2, Fe: 1 },
        tags: ['routine_help'],
      },
      {
        id: 'emotional',
        label: '感情的に落ち込んでいるとき',
        biasHints: { B8: 2, B11: 1 },
        jungShadowHints: { Fe: 3 },
        tags: ['emotional_support'],
      },
      {
        id: 'plan',
        label: '大きな決断や計画のとき',
        biasHints: { B1: 2, B7: 1 },
        jungShadowHints: { Ni: 2, Te: 1 },
        tags: ['big_decision'],
      },
    ],
  },
];
