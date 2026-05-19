// 攻略型・部下プール（jin_ 8タイプを観察視点で弁別する質問）

export const ATTACK_SUBORDINATE_QUESTIONS = [

  // ── 入口：着手の仕方で大まかな方向を分ける ──────────────
  {
    id: 'atk_s_001',
    type: 'entry',
    order: 1,
    text: 'その部下に新しいタスクを振ったとき、最初の反応は？',
    discriminates: ['jin_13', 'jin_19', 'jin_23', 'jin_41', 'jin_45'],
    choices: [
      {
        id: 'will_do_no_action',
        label: '『やります』と言うが翌日も着手していない',
        attackTypeHints: { jin_45: 3, jin_13: 1 },
        biasHints: { B2: 3 },
        jungShadowHints: { Ni: 2 },
        tags: ['procrastinate'],
      },
      {
        id: 'preparation_forever',
        label: '『もう少し情報を集めてから』と着手しない',
        attackTypeHints: { jin_41: 3 },
        biasHints: { B1: 3, B6: 1 },
        jungShadowHints: { Ti: 2 },
        tags: ['perfectionism_paralysis'],
      },
      {
        id: 'ambiguous_freeze',
        label: '『どこから手をつければ？』と曖昧な指示で止まる',
        attackTypeHints: { jin_19: 3 },
        biasHints: { B6: 3, B1: 1 },
        jungShadowHints: { Si: 2 },
        tags: ['choice_paralysis'],
      },
      {
        id: 'better_method',
        label: 'すぐに『前職ではこうしてた』と改善案を出す',
        attackTypeHints: { jin_23: 3 },
        biasHints: { B5: 3 },
        jungShadowHints: { Ne: 2 },
        tags: ['dunning_kruger'],
      },
      {
        id: 'over_consult',
        label: '一日に何度も『ちょっとよろしいですか』と確認に来る',
        attackTypeHints: { jin_50: 3 },
        biasHints: { B1: 3 },
        jungShadowHints: { Fe: 2 },
        tags: ['over_consult'],
      },
    ],
  },

  // ── 進捗・状況の伝え方 ─────────────────────────────────
  {
    id: 'atk_s_002',
    type: 'probe',
    text: '進捗を聞いたとき、その部下は？',
    discriminates: ['jin_13', 'jin_45', 'jin_27', 'jin_41', 'jin_50'],
    choices: [
      {
        id: 'no_issue_lie',
        label: '『特に問題ありません』と言うが手遅れ寸前に発覚する',
        attackTypeHints: { jin_13: 3 },
        biasHints: { B2: 2, B6: 1 },
        jungShadowHints: { Si: 2 },
        tags: ['silent_failure'],
      },
      {
        id: 'still_preparing',
        label: '『まだ準備中です』が2週間続く',
        attackTypeHints: { jin_41: 3 },
        biasHints: { B1: 2 },
        jungShadowHints: { Ti: 2 },
        tags: ['stuck_preparing'],
      },
      {
        id: 'tomorrow_promise',
        label: '『明日やります』が毎日繰り返される',
        attackTypeHints: { jin_45: 3 },
        biasHints: { B2: 3 },
        jungShadowHints: { Ni: 2 },
        tags: ['tomorrow_loop'],
      },
      {
        id: 'external_reason',
        label: '遅延の理由として外的要因を毎回列挙する',
        attackTypeHints: { jin_27: 3 },
        biasHints: { B12: 3 },
        jungShadowHints: { Fi: 2 },
        tags: ['external_attribution'],
      },
      {
        id: 'micro_check',
        label: '小さな判断ごとに『確認したい』と来る',
        attackTypeHints: { jin_50: 3 },
        biasHints: { B1: 2 },
        jungShadowHints: { Fe: 2 },
        tags: ['needs_reassurance'],
      },
    ],
  },

  // ── 情報受信のしかた ────────────────────────────────
  {
    id: 'atk_s_003',
    type: 'probe',
    text: '全体共有で伝えた内容について、その部下は？',
    discriminates: ['jin_13', 'jin_40', 'jin_23'],
    choices: [
      {
        id: 'didnt_know',
        label: '後で『聞いていません』『知らなかった』と言う',
        attackTypeHints: { jin_40: 3 },
        biasHints: { B3: 2, B12: 1 },
        jungShadowHints: { Fi: 2 },
        tags: ['didnt_know_loop'],
      },
      {
        id: 'seen_no_reply',
        label: '既読はついたが返信や反応がない',
        attackTypeHints: { jin_13: 3 },
        biasHints: { B2: 2 },
        jungShadowHints: { Si: 2 },
        tags: ['ghost_read'],
      },
      {
        id: 'own_way',
        label: '自分流に解釈して別の方向に進める',
        attackTypeHints: { jin_23: 2 },
        biasHints: { B5: 2 },
        jungShadowHints: { Ne: 1 },
        tags: ['self_interpretation'],
      },
      {
        id: 'asks_again',
        label: 'もう一度説明を求めてくる（聞いたはずなのに）',
        attackTypeHints: { jin_50: 2, jin_40: 1 },
        biasHints: { B1: 1 },
        jungShadowHints: { Fe: 1 },
        tags: ['needs_repeat'],
      },
    ],
  },

  // ── 動けない／停滞の背景 ──────────────────────────────
  {
    id: 'atk_s_004',
    type: 'probe',
    text: 'その部下が動けない・停滞する一番の背景は？',
    discriminates: ['jin_41', 'jin_19', 'jin_45', 'jin_50'],
    choices: [
      {
        id: 'fear_imperfect',
        label: '完璧でないと出せない・失敗の恐れが強い',
        attackTypeHints: { jin_41: 3 },
        biasHints: { B1: 3 },
        jungShadowHints: { Ti: 2 },
        tags: ['fear_imperfect'],
      },
      {
        id: 'no_start_path',
        label: '始め方がわからず固まる（選択肢が多すぎる）',
        attackTypeHints: { jin_19: 3 },
        biasHints: { B6: 2 },
        jungShadowHints: { Si: 2 },
        tags: ['no_start_path'],
      },
      {
        id: 'present_pleasure',
        label: '今やることのコストが重く感じられ後回しになる',
        attackTypeHints: { jin_45: 3 },
        biasHints: { B2: 3 },
        jungShadowHints: { Ni: 2 },
        tags: ['present_avoid'],
      },
      {
        id: 'no_confidence',
        label: '自分の判断に自信がなく確認なしで進めない',
        attackTypeHints: { jin_50: 3 },
        biasHints: { B1: 2 },
        jungShadowHints: { Fe: 2 },
        tags: ['needs_validation'],
      },
    ],
  },

  // ── 自信・主張の出方 ───────────────────────────────────
  {
    id: 'atk_s_005',
    type: 'probe',
    text: 'その部下の自信や主張の出方は？',
    discriminates: ['jin_23', 'jin_41', 'jin_50', 'jin_19'],
    choices: [
      {
        id: 'overconfident',
        label: '過信気味で前職や知識を絶対視する',
        attackTypeHints: { jin_23: 3 },
        biasHints: { B5: 3 },
        jungShadowHints: { Ne: 2 },
        tags: ['overconfident'],
      },
      {
        id: 'self_doubt',
        label: '常に自信なさげで判断を委ねたがる',
        attackTypeHints: { jin_50: 3, jin_41: 1 },
        biasHints: { B1: 2 },
        jungShadowHints: { Fe: 2 },
        tags: ['self_doubt'],
      },
      {
        id: 'quiet_compliance',
        label: '黙々と動くが必要最低限以上に踏み込まない',
        attackTypeHints: { jin_19: 2, jin_13: 1 },
        biasHints: { B6: 2 },
        jungShadowHints: { Si: 2 },
        tags: ['minimal_engagement'],
      },
      {
        id: 'perfectionism_freeze',
        label: '高い水準を掲げるが完成前で止まる',
        attackTypeHints: { jin_41: 3 },
        biasHints: { B1: 2 },
        jungShadowHints: { Ti: 2 },
        tags: ['perfectionism_freeze'],
      },
    ],
  },

  // ── ミス・遅延の説明 ──────────────────────────────────
  {
    id: 'atk_s_006',
    type: 'probe',
    text: 'ミスや遅延が起きたとき、その部下の説明は？',
    discriminates: ['jin_27', 'jin_40', 'jin_45', 'jin_19'],
    choices: [
      {
        id: 'external_chain',
        label: '外的要因の連鎖を丁寧に並べる',
        attackTypeHints: { jin_27: 3 },
        biasHints: { B12: 3 },
        jungShadowHints: { Fi: 2 },
        tags: ['external_chain'],
      },
      {
        id: 'not_told',
        label: '『教えてもらっていない』『指示が不明確』と言う',
        attackTypeHints: { jin_40: 3 },
        biasHints: { B3: 2 },
        jungShadowHints: { Fi: 2 },
        tags: ['not_told'],
      },
      {
        id: 'time_ran_out',
        label: '『時間がなくて』『気がついたら締切だった』',
        attackTypeHints: { jin_45: 3 },
        biasHints: { B2: 2 },
        jungShadowHints: { Ni: 2 },
        tags: ['ran_out_of_time'],
      },
      {
        id: 'directive_unclear',
        label: '『どう進めればよかったかわからなかった』',
        attackTypeHints: { jin_19: 3 },
        biasHints: { B6: 2 },
        jungShadowHints: { Si: 2 },
        tags: ['unclear_direction'],
      },
    ],
  },

];
