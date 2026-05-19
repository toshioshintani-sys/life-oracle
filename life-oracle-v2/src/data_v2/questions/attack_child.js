// 攻略型・子供カテゴリ（観察視点）
// 「あなたのお子さんはどうしますか」という観察質問プール

export const ATTACK_CHILD_QUESTIONS = [

  {
    id: 'atk_c_001',
    type: 'entry',
    order: 1,
    text: 'その子は「やりたくないこと」をどう断りますか？',
    discriminates: [],
    choices: [
      {
        id: 'ignore',
        label: '返事をしない・聞こえていないふりをする',
        biasHints: { B6: 2, B9: 2 },
        jungShadowHints: { Fi: 2, Si: 1 },
        tags: ['passive_ignore'],
      },
      {
        id: 'reason',
        label: 'ちゃんと理由を説明して断る',
        biasHints: {},
        jungShadowHints: { Ti: 2, Te: 1 },
        tags: ['logical_refusal'],
      },
      {
        id: 'cry_tantrum',
        label: '泣いたり「いやだ」を繰り返す',
        biasHints: { B8: 3, B1: 1 },
        jungShadowHints: { Fe: 2, Se: 1 },
        tags: ['emotional_protest'],
      },
      {
        id: 'deflect',
        label: '別のことを提案して話をそらす',
        biasHints: { B2: 2, B6: 1 },
        jungShadowHints: { Ne: 2, Se: 1 },
        tags: ['deflect'],
      },
    ],
  },

  {
    id: 'atk_c_002',
    type: 'entry',
    order: 2,
    text: '友達との関係で困ったとき、その子はどうしますか？',
    discriminates: [],
    choices: [
      {
        id: 'report',
        label: 'すぐ親や先生に報告する',
        biasHints: { B4: 2, B8: 1 },
        jungShadowHints: { Fe: 2, Si: 1 },
        tags: ['report_adult'],
      },
      {
        id: 'self_solve',
        label: '自分でなんとかしようとする（黙って耐える含む）',
        biasHints: { B6: 1, B9: 2 },
        jungShadowHints: { Fi: 2, Ti: 1 },
        tags: ['self_solve'],
      },
      {
        id: 'explode',
        label: '感情的になって相手に直接ぶつかる',
        biasHints: { B8: 3, B2: 1 },
        jungShadowHints: { Se: 2, Te: 1 },
        tags: ['direct_conflict'],
      },
      {
        id: 'withdraw',
        label: 'その友達から距離を置く',
        biasHints: { B9: 2, B6: 1 },
        jungShadowHints: { Fi: 2, Ni: 1 },
        tags: ['withdraw'],
      },
    ],
  },

  {
    id: 'atk_c_003',
    type: 'probe',
    text: 'その子はほめられたとき、どんな反応をしますか？',
    discriminates: [],
    choices: [
      {
        id: 'excited',
        label: '目に見えてうれしそうになり、もっとやろうとする',
        biasHints: { B8: 1, B2: 2 },
        jungShadowHints: { Fe: 2, Se: 2 },
        tags: ['validation_seeking'],
      },
      {
        id: 'downplay',
        label: 'はずかしがって「そんなことない」と否定する',
        biasHints: { B9: 2 },
        jungShadowHints: { Fi: 2, Si: 1 },
        tags: ['downplay'],
      },
      {
        id: 'analyze',
        label: '「なんで？どこが？」と聞き返す',
        biasHints: {},
        jungShadowHints: { Ti: 2, Ne: 1 },
        tags: ['analytical'],
      },
      {
        id: 'next',
        label: 'すぐ「次はこれやる」と動く',
        biasHints: { B2: 2, B5: 1 },
        jungShadowHints: { Se: 2, Te: 1 },
        tags: ['action_driven'],
      },
    ],
  },

  {
    id: 'atk_c_004',
    type: 'probe',
    text: 'その子が集中しているとき、邪魔されたらどうなりますか？',
    discriminates: [],
    choices: [
      {
        id: 'strong_anger',
        label: '怒って作業をやめてしまう',
        biasHints: { B8: 2, B2: 1 },
        jungShadowHints: { Fi: 2, Se: 2 },
        tags: ['anger_stop'],
      },
      {
        id: 'ignore_continue',
        label: '気にせず続けられる',
        biasHints: {},
        jungShadowHints: { Ti: 2, Ni: 1 },
        tags: ['focused'],
      },
      {
        id: 'sulk',
        label: 'しばらくすねる・機嫌が悪くなる',
        biasHints: { B9: 2, B11: 1 },
        jungShadowHints: { Fi: 2, Fe: 1 },
        tags: ['sulk'],
      },
      {
        id: 'distracted',
        label: 'そのまま違うことへ興味が移る',
        biasHints: { B2: 2, B12: 1 },
        jungShadowHints: { Ne: 3, Se: 1 },
        tags: ['distracted'],
      },
    ],
  },

  {
    id: 'atk_c_005',
    type: 'probe',
    text: 'その子は「なんで？」を何回くらい聞いてきますか？',
    discriminates: [],
    choices: [
      {
        id: 'many',
        label: '答えるたびにまた「なんで？」が来る',
        biasHints: { B5: 1 },
        jungShadowHints: { Ne: 3, Ti: 1 },
        tags: ['why_chain'],
      },
      {
        id: 'once',
        label: '一回聞いたら納得して終わる',
        biasHints: { B4: 1 },
        jungShadowHints: { Si: 2, Fe: 1 },
        tags: ['single_why'],
      },
      {
        id: 'rarely',
        label: 'あまり聞かない・自分で考える',
        biasHints: {},
        jungShadowHints: { Ti: 2, Fi: 1 },
        tags: ['self_think'],
      },
    ],
  },
];
