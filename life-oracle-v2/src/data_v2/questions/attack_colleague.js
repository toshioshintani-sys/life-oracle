// 攻略型・同僚プール（jin_ 19タイプを観察視点で弁別する質問）

export const ATTACK_COLLEAGUE_QUESTIONS = [

  // ── 入口：消耗の起き方で大まかな方向を分ける ────────────────
  {
    id: 'atk_c_001',
    type: 'entry',
    order: 1,
    text: 'その同僚との関係で、最も消耗するのはどんな瞬間ですか？',
    discriminates: ['jin_02', 'jin_07', 'jin_10', 'jin_12', 'jin_28', 'jin_55'],
    choices: [
      {
        id: 'comparison',
        label: '自分の成果や経験を小さく扱われる',
        attackTypeHints: { jin_02: 3, jin_07: 2, jin_18: 2, jin_22: 1 },
        biasHints: { B3: 2 },
        jungShadowHints: { Te: 1, Fi: 1 },
        tags: ['comparison_hit'],
      },
      {
        id: 'load_dumped',
        label: '仕事や責任が押しつけられる・拒否される',
        attackTypeHints: { jin_10: 3, jin_42: 3, jin_32: 1 },
        biasHints: { B8: 1, B1: 1 },
        jungShadowHints: { Te: 1 },
        tags: ['responsibility_load'],
      },
      {
        id: 'info_flow',
        label: '噂・情報の流れに巻き込まれる、または遮断される',
        attackTypeHints: { jin_12: 3, jin_54: 2, jin_56: 2 },
        biasHints: { B4: 2 },
        jungShadowHints: { Fe: 2, Ti: 1 },
        tags: ['info_problem'],
      },
      {
        id: 'rhythm',
        label: '会話のリズムや距離感が合わず疲れる',
        attackTypeHints: { jin_24: 3, jin_28: 2, jin_30: 2, jin_32: 2 },
        biasHints: { B2: 1, B6: 1 },
        jungShadowHints: { Ne: 1, Si: 1 },
        tags: ['rhythm_problem'],
      },
      {
        id: 'blocked',
        label: '提案や挑戦をいつもブロックされる',
        attackTypeHints: { jin_09: 3, jin_55: 3 },
        biasHints: { B9: 2, B3: 2 },
        jungShadowHints: { Fi: 1, Ni: 1 },
        tags: ['blocked'],
      },
      {
        id: 'emotional_unclear',
        label: '感情の出し方が読めず気を遣う',
        attackTypeHints: { jin_46: 3, jin_26: 2, jin_54: 2 },
        biasHints: { B12: 2 },
        jungShadowHints: { Fi: 2, Fe: 1 },
        tags: ['emotional_unclear'],
      },
    ],
  },

  // ── 成果・実績への反応 ──────────────────────────────────
  {
    id: 'atk_c_002',
    type: 'probe',
    text: 'あなたが成果を出したとき、その同僚はどう振る舞いますか？',
    discriminates: ['jin_02', 'jin_07', 'jin_18', 'jin_22', 'jin_12'],
    choices: [
      {
        id: 'overlay',
        label: '『自分のほうがもっと…』と被せてくる',
        attackTypeHints: { jin_02: 3, jin_07: 2 },
        biasHints: { B3: 2 },
        jungShadowHints: { Te: 2, Fi: 1 },
        tags: ['mount_overlay'],
      },
      {
        id: 'reattribute',
        label: '『あれは自分のアイデアだった』と書き換える',
        attackTypeHints: { jin_22: 3 },
        biasHints: { B5: 2 },
        jungShadowHints: { Fi: 2 },
        tags: ['credit_steal'],
      },
      {
        id: 'mock',
        label: '『運がよかった』『誰でもできる』と冷たく返す',
        attackTypeHints: { jin_18: 3 },
        biasHints: { B3: 2 },
        jungShadowHints: { Fi: 2 },
        tags: ['envy_freeze'],
      },
      {
        id: 'praise_face_gossip_back',
        label: '表向きは褒めるが裏で別の話を流す',
        attackTypeHints: { jin_54: 3, jin_12: 2 },
        biasHints: { B11: 2, B4: 1 },
        jungShadowHints: { Fe: 3 },
        tags: ['two_face'],
      },
    ],
  },

  // ── 責任の所在の扱い ───────────────────────────────────
  {
    id: 'atk_c_003',
    type: 'probe',
    text: '責任の所在で揉めたとき、その同僚は？',
    discriminates: ['jin_42', 'jin_35', 'jin_38', 'jin_32'],
    choices: [
      {
        id: 'not_my_job',
        label: '『それ私の仕事じゃない』と即拒否する',
        attackTypeHints: { jin_42: 3 },
        biasHints: { B1: 3 },
        jungShadowHints: { Te: 2 },
        tags: ['role_refuse'],
      },
      {
        id: 'no_apology',
        label: '謝罪せず『次気をつけます』だけで済ます',
        attackTypeHints: { jin_35: 3 },
        biasHints: { B12: 3 },
        jungShadowHints: { Fi: 2 },
        tags: ['no_apology'],
      },
      {
        id: 'busy_excuse',
        label: '『今ちょっと忙しくて』で常に逃げる',
        attackTypeHints: { jin_32: 3 },
        biasHints: { B11: 2 },
        jungShadowHints: { Fi: 2 },
        tags: ['busy_avoidance'],
      },
      {
        id: 'optimistic',
        label: '『大丈夫っしょ』と楽観して結局周囲を巻き込む',
        attackTypeHints: { jin_38: 3 },
        biasHints: { B5: 3, B2: 1 },
        jungShadowHints: { Si: 2 },
        tags: ['groundless_optimism'],
      },
    ],
  },

  // ── 提案・挑戦への反応 ──────────────────────────────────
  {
    id: 'atk_c_004',
    type: 'probe',
    text: 'あなたが新しい提案やアイデアを出したとき、その同僚は？',
    discriminates: ['jin_09', 'jin_55', 'jin_28', 'jin_10'],
    choices: [
      {
        id: 'but_first',
        label: 'まず『でも』『だけど』『ただ』から入る',
        attackTypeHints: { jin_09: 3 },
        biasHints: { B9: 2, B3: 2 },
        jungShadowHints: { Fi: 2 },
        tags: ['but_negation'],
      },
      {
        id: 'dohse',
        label: '『どうせ無理』『前にダメだった』と切る',
        attackTypeHints: { jin_55: 3 },
        biasHints: { B3: 3, B6: 2 },
        jungShadowHints: { Ni: 2, Si: 1 },
        tags: ['learned_helplessness'],
      },
      {
        id: 'silence',
        label: '黙ったまま反応しない・賛否を示さない',
        attackTypeHints: { jin_28: 3, jin_46: 1 },
        biasHints: { B6: 2 },
        jungShadowHints: { Si: 2 },
        tags: ['silent_meeting'],
      },
      {
        id: 'push_to_you',
        label: '採用するが実行は『あなたの方が詳しいから』と押しつける',
        attackTypeHints: { jin_10: 3 },
        biasHints: { B8: 2 },
        jungShadowHints: { Te: 1, Fe: 1 },
        tags: ['delegate_to_you'],
      },
    ],
  },

  // ── 情報・噂の流れ ─────────────────────────────────────
  {
    id: 'atk_c_005',
    type: 'probe',
    text: '情報や噂の扱い方の特徴は？',
    discriminates: ['jin_12', 'jin_56', 'jin_54', 'jin_26'],
    choices: [
      {
        id: 'gossip_carrier',
        label: '2人きりの瞬間に耳打ちで悪口を運んでくる',
        attackTypeHints: { jin_12: 3 },
        biasHints: { B4: 3 },
        jungShadowHints: { Fe: 3 },
        tags: ['gossip_delivery'],
      },
      {
        id: 'info_hoard',
        label: '重要情報を独占して優越感をにじませる',
        attackTypeHints: { jin_56: 3 },
        biasHints: { B1: 3 },
        jungShadowHints: { Ti: 2 },
        tags: ['info_hoarding'],
      },
      {
        id: 'two_faced',
        label: '上司の前と部下の前で言うことが違う',
        attackTypeHints: { jin_54: 3, jin_26: 2 },
        biasHints: { B11: 2, B4: 1 },
        jungShadowHints: { Fe: 3 },
        tags: ['inconsistency'],
      },
      {
        id: 'reads_room',
        label: 'その場の権力者に合わせて意見が180度変わる',
        attackTypeHints: { jin_26: 3 },
        biasHints: { B4: 3 },
        jungShadowHints: { Fe: 3 },
        tags: ['mood_reading_shift'],
      },
    ],
  },

  // ── 会話量と距離感 ─────────────────────────────────────
  {
    id: 'atk_c_006',
    type: 'probe',
    text: '会話量・社交への関わり方の特徴は？',
    discriminates: ['jin_24', 'jin_28', 'jin_30', 'jin_32'],
    choices: [
      {
        id: 'long_chat',
        label: '『5分だけ』が30分以上続く',
        attackTypeHints: { jin_24: 3 },
        biasHints: { B2: 2 },
        jungShadowHints: { Ne: 3 },
        tags: ['long_chat'],
      },
      {
        id: 'no_voice',
        label: '会議や打ち合わせで意見を言わず黙っている',
        attackTypeHints: { jin_28: 3 },
        biasHints: { B6: 2 },
        jungShadowHints: { Si: 2 },
        tags: ['silent_meeting'],
      },
      {
        id: 'social_skip',
        label: '飲み会・社交イベントをほぼ全て断る',
        attackTypeHints: { jin_30: 3 },
        biasHints: { B6: 2 },
        jungShadowHints: { Ti: 3 },
        tags: ['social_decline'],
      },
      {
        id: 'busy_persona',
        label: '『忙しい』が口癖で時間と仕事量の実態が見えない',
        attackTypeHints: { jin_32: 3 },
        biasHints: { B11: 2 },
        jungShadowHints: { Fi: 2 },
        tags: ['busy_persona'],
      },
    ],
  },

  // ── 感情・反応の出し方 ──────────────────────────────────
  {
    id: 'atk_c_007',
    type: 'probe',
    text: 'その同僚の感情や不満はどう外に出ますか？',
    discriminates: ['jin_46', 'jin_22', 'jin_18', 'jin_07'],
    choices: [
      {
        id: 'silent_attack',
        label: '無視や返信遅延などの無言で攻撃する',
        attackTypeHints: { jin_46: 3 },
        biasHints: { B12: 3 },
        jungShadowHints: { Fi: 3 },
        tags: ['passive_aggressive'],
      },
      {
        id: 'unhappy_compete',
        label: '『私のほうが大変』と不幸の比較に持ち込む',
        attackTypeHints: { jin_07: 3 },
        biasHints: { B3: 2 },
        jungShadowHints: { Fi: 3 },
        tags: ['victim_competition'],
      },
      {
        id: 'fragile_attack',
        label: '批判に過剰反発する・自分は常に正しいと主張する',
        attackTypeHints: { jin_22: 3 },
        biasHints: { B5: 3 },
        jungShadowHints: { Fi: 2 },
        tags: ['fragile_ego'],
      },
      {
        id: 'cold_envy',
        label: '褒められた直後に表情が曇り空気を変える',
        attackTypeHints: { jin_18: 3 },
        biasHints: { B3: 2 },
        jungShadowHints: { Fi: 3 },
        tags: ['envy_freeze'],
      },
    ],
  },


  // ── 反論・否定のパターン ─────────────────────────────
  {
    id: 'atk_c_008',
    type: 'probe',
    text: '議論や意見交換でその同僚はどう反応しますか？',
    discriminates: ['jin_09', 'jin_35', 'jin_38'],
    choices: [
      {
        id: 'but_reflex',
        label: '反射的に「でも」「だけど」「ただ」が出て肯定が来ない',
        attackTypeHints: { jin_09: 3 },
        biasHints: { B9: 3, B3: 1 },
        jungShadowHints: { Ti: 2, Fi: 1 },
        tags: ['but_reflex'],
      },
      {
        id: 'no_admit_wrong',
        label: '自分のミスや誤りを認めず言い方を変えて押し通す',
        attackTypeHints: { jin_35: 3 },
        biasHints: { B12: 3, B5: 1 },
        jungShadowHints: { Fi: 2 },
        tags: ['never_admit_error'],
      },
      {
        id: 'rose_tinted',
        label: '根拠なく「なんとかなる」「うまくいく」と楽観する',
        attackTypeHints: { jin_38: 3 },
        biasHints: { B5: 3, B2: 1 },
        jungShadowHints: { Se: 1 },
        tags: ['groundless_optimism'],
      },
      {
        id: 'asks_evidence',
        label: 'データや根拠を求めてくる・建設的に議論できる',
        attackTypeHints: { jin_28: 1 },
        tags: ['evidence_based'],
      },
    ],
  },

  // ── 謝罪・修復行動 ───────────────────────────────────
  {
    id: 'atk_c_009',
    type: 'probe',
    text: 'その同僚がトラブルを起こした後の行動は？',
    discriminates: ['jin_35', 'jin_38', 'jin_55'],
    choices: [
      {
        id: 'no_apology_detail',
        label: '謝罪の言葉がなく「対策します」だけで終わる',
        attackTypeHints: { jin_35: 3 },
        biasHints: { B12: 3 },
        jungShadowHints: { Fi: 2 },
        tags: ['no_apology'],
      },
      {
        id: 'optimistic_reframe',
        label: '「結果的によかった」「まあ大丈夫でしょ」と再フレーミング',
        attackTypeHints: { jin_38: 3 },
        biasHints: { B5: 2, B12: 1 },
        jungShadowHints: { Si: 1 },
        tags: ['reframe_avoid'],
      },
      {
        id: 'give_up_mode',
        label: '「どうせ何を言っても変わらない」と投げやりになる',
        attackTypeHints: { jin_55: 3 },
        biasHints: { B3: 3, B6: 2 },
        jungShadowHints: { Ni: 2 },
        tags: ['learned_helplessness'],
      },
      {
        id: 'genuine_repair',
        label: '謝罪して改善行動を取り関係を修復しようとする',
        attackTypeHints: { jin_09: 1 },
        tags: ['genuine_repair'],
      },
    ],
  },

  // ── 楽観・悲観のバランス ─────────────────────────────
  {
    id: 'atk_c_010',
    type: 'probe',
    text: 'プロジェクトのリスクを話し合うとき、その同僚は？',
    discriminates: ['jin_38', 'jin_55', 'jin_09'],
    choices: [
      {
        id: 'dismiss_risk',
        label: 'リスクを指摘すると「考えすぎ」「なんとかなる」と流す',
        attackTypeHints: { jin_38: 3 },
        biasHints: { B5: 3 },
        jungShadowHints: { Se: 1 },
        tags: ['risk_dismiss'],
      },
      {
        id: 'douhse_block',
        label: '「どうせうまくいかない」と試みる前から否定する',
        attackTypeHints: { jin_55: 3 },
        biasHints: { B3: 3, B6: 2 },
        jungShadowHints: { Ni: 2, Si: 1 },
        tags: ['pessimism_block'],
      },
      {
        id: 'but_what_about',
        label: '対策案を出すたびに別の懸念点を持ち出す',
        attackTypeHints: { jin_09: 3 },
        biasHints: { B9: 2 },
        jungShadowHints: { Ti: 2 },
        tags: ['endless_buts'],
      },
      {
        id: 'balanced_view',
        label: 'リスクも機会も両面から冷静に検討する',
        attackTypeHints: { jin_30: 1 },
        tags: ['balanced_risk'],
      },
    ],
  },

  // ── 諦め・無力感のパターン ───────────────────────────
  {
    id: 'atk_c_011',
    type: 'probe',
    text: 'その同僚はチームの改善提案にどう関わりますか？',
    discriminates: ['jin_55', 'jin_09', 'jin_35'],
    choices: [
      {
        id: 'wont_change',
        label: '「どうせ上は聞かない」「前もやって変わらなかった」と動かない',
        attackTypeHints: { jin_55: 3 },
        biasHints: { B3: 3, B6: 3 },
        jungShadowHints: { Ni: 2 },
        tags: ['systemic_helplessness'],
      },
      {
        id: 'counter_each_point',
        label: '提案の欠点を探し続けて前に進めない',
        attackTypeHints: { jin_09: 3 },
        biasHints: { B9: 2, B3: 1 },
        jungShadowHints: { Ti: 2 },
        tags: ['endless_critique'],
      },
      {
        id: 'deflect_accountability',
        label: '「それは私の担当外」「私には権限がない」と逃げる',
        attackTypeHints: { jin_35: 2, jin_42: 1 },
        biasHints: { B1: 2 },
        jungShadowHints: { Fi: 1 },
        tags: ['accountability_deflect'],
      },
      {
        id: 'takes_initiative',
        label: '積極的に関わって動こうとする',
        attackTypeHints: { jin_23: 1 },
        tags: ['initiative'],
      },
    ],
  },

  // ── 自己主張・マウンティング ─────────────────────────
  {
    id: 'atk_c_012',
    type: 'probe',
    text: '新しく入ってきた同僚・後輩の扱い方は？',
    discriminates: ['jin_23', 'jin_07', 'jin_02'],
    choices: [
      {
        id: 'orero_newcomer',
        label: '入って間もないのに「自分の経験では」と主導しようとする',
        attackTypeHints: { jin_23: 3 },
        biasHints: { B5: 3 },
        jungShadowHints: { Ne: 2 },
        tags: ['overconfident_newcomer'],
      },
      {
        id: 'victim_comparison',
        label: '「自分のほうが苦労した」と辛さを比べてくる',
        attackTypeHints: { jin_07: 3 },
        biasHints: { B3: 2 },
        jungShadowHints: { Fi: 2 },
        tags: ['victim_senior'],
      },
      {
        id: 'undercut_newcomer',
        label: '新入りの発言をさりげなく否定・過小評価する',
        attackTypeHints: { jin_02: 3, jin_18: 1 },
        biasHints: { B3: 2 },
        jungShadowHints: { Te: 1 },
        tags: ['undercut_newcomer'],
      },
      {
        id: 'mentor_mode',
        label: '積極的にフォローしようとする・助けようとする',
        attackTypeHints: { jin_24: 1 },
        tags: ['mentor_mode'],
      },
    ],
  },

];
