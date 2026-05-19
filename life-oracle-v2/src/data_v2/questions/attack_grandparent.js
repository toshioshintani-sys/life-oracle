// 攻略型・祖父母カテゴリ（観察視点）

export const ATTACK_GRANDPARENT_QUESTIONS = [

  {
    id: 'atk_gp_001',
    type: 'entry',
    order: 1,
    text: 'その祖父母は、あなたの生活ルートについてどんな反応をしますか？',
    discriminates: [],
    choices: [
      {
        id: 'compare_era',
        label: '「昔はそんな選択肢はなかった」と時代の話をする',
        biasHints: { B7: 3, B6: 2 },
        jungShadowHints: { Si: 3 },
        tags: ['era_compare'],
      },
      {
        id: 'worry_health',
        label: '体への影響・健康面の心配をする',
        biasHints: { B1: 3, B6: 1 },
        jungShadowHints: { Si: 2, Fe: 1 },
        tags: ['health_worry'],
      },
      {
        id: 'proud',
        label: '何をしていても誇らしそうに聞いてくれる',
        biasHints: {},
        jungShadowHints: { Fe: 2, Fi: 1 },
        tags: ['proud_support'],
      },
      {
        id: 'traditional',
        label: '「結婚は？」「家族はいつ？」と伝統的な順番を確認する',
        biasHints: { B6: 3, B4: 2 },
        jungShadowHints: { Si: 3, Fe: 1 },
        tags: ['traditional_order'],
      },
    ],
  },

  {
    id: 'atk_gp_002',
    type: 'entry',
    order: 2,
    text: '久しぶりに会ったとき、その祖父母が最初にすることは？',
    discriminates: [],
    choices: [
      {
        id: 'feed',
        label: '食べ物を出す・「食べたか？」から始まる',
        biasHints: { B8: 1, B4: 2 },
        jungShadowHints: { Fe: 3, Si: 1 },
        tags: ['nurture'],
      },
      {
        id: 'health_check',
        label: '顔色や体型をチェックして健康を確認する',
        biasHints: { B1: 2, B6: 1 },
        jungShadowHints: { Si: 2, Te: 1 },
        tags: ['health_check'],
      },
      {
        id: 'story',
        label: 'すぐ昔話や最近の出来事を話し始める',
        biasHints: { B7: 2, B5: 1 },
        jungShadowHints: { Si: 2, Se: 1 },
        tags: ['story_telling'],
      },
      {
        id: 'practical',
        label: '「何か困ってることある？」と実用的なことを聞く',
        biasHints: {},
        jungShadowHints: { Te: 2, Ti: 1 },
        tags: ['practical'],
      },
    ],
  },

  {
    id: 'atk_gp_003',
    type: 'probe',
    text: 'その祖父母が怒るとき、どんな形で表れますか？',
    discriminates: [],
    choices: [
      {
        id: 'long_lecture',
        label: '昔話を交えた長い説教',
        biasHints: { B7: 3, B5: 1 },
        jungShadowHints: { Si: 3, Te: 1 },
        tags: ['lecture'],
      },
      {
        id: 'silent_cold',
        label: '無言になって距離を置く',
        biasHints: { B9: 2, B11: 1 },
        jungShadowHints: { Fi: 2, Fe: 1 },
        tags: ['silent_cold'],
      },
      {
        id: 'worry_expression',
        label: '怒りより「心配している」という形で出てくる',
        biasHints: { B1: 2, B8: 2 },
        jungShadowHints: { Fe: 3 },
        tags: ['worry_anger'],
      },
      {
        id: 'direct_short',
        label: '短く直接「それはいかん」と言う',
        biasHints: { B6: 1 },
        jungShadowHints: { Te: 2, Se: 1 },
        tags: ['direct'],
      },
    ],
  },

  {
    id: 'atk_gp_004',
    type: 'probe',
    text: 'その祖父母が「昔は良かった」と感じているのは、どんな場面ですか？',
    discriminates: [],
    choices: [
      {
        id: 'community',
        label: '近所づきあい・人との結びつきが薄くなったこと',
        biasHints: { B4: 3, B8: 1 },
        jungShadowHints: { Fe: 3, Si: 1 },
        tags: ['community'],
      },
      {
        id: 'values',
        label: '礼儀・敬意・価値観が変わってきたこと',
        biasHints: { B6: 3, B3: 2 },
        jungShadowHints: { Si: 3, Fi: 1 },
        tags: ['values'],
      },
      {
        id: 'simple_life',
        label: '物が少なくても豊かだった時代のこと',
        biasHints: { B7: 2, B6: 1 },
        jungShadowHints: { Si: 2, Fi: 1 },
        tags: ['simple_life'],
      },
    ],
  },
];
