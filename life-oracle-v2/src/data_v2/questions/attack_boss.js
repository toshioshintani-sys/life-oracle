// 攻略型・上司MVP（jin_01/03/04/06/08 を弁別する観察質問プール）
// 質問は観察視点。「あなたはどうですか」ではなく「その上司はどうしますか」。

export const ATTACK_BOSS_QUESTIONS = [

  // ── 入口：評価の更新の仕方で4タイプを粗く分ける ──────────────
  {
    id: 'atk_b_001',
    type: 'entry',
    order: 1,
    text: 'その上司は、あなたへの評価をどう更新しますか？',
    discriminates: ['jin_01', 'jin_03', 'jin_04', 'jin_08'],
    choices: [
      {
        id: 'fixed',
        label: '一度貼った印象が、まず変わらない',
        attackTypeHints: { jin_01: 3 },
        biasHints: { B3: 2 },
        jungShadowHints: { Si: 2 },
        tags: ['fixed_judgment'],
      },
      {
        id: 'ambiguous',
        label: '具体的に評価しない・抽象的な言葉で終わる',
        attackTypeHints: { jin_03: 3 },
        biasHints: { B6: 2 },
        jungShadowHints: { Fe: 2 },
        tags: ['ambiguous_judgment'],
      },
      {
        id: 'flip',
        label: '昨日と今日で違うことを言う',
        attackTypeHints: { jin_08: 3 },
        biasHints: { B2: 2 },
        jungShadowHints: { Te: 1 },
        tags: ['flip_judgment'],
      },
      {
        id: 'blame',
        label: '悪い結果が出ると評価が部下のせいに変わる',
        attackTypeHints: { jin_04: 3 },
        biasHints: { B5: 2 },
        jungShadowHints: { Fi: 1 },
        tags: ['blame_shift'],
      },
    ],
  },

  // ── 機嫌・感情の流れ方 ─────────────────────────────────────
  {
    id: 'atk_b_002',
    type: 'probe',
    text: 'その上司の機嫌は、その日のチームの空気にどう影響しますか？',
    discriminates: ['jin_06', 'jin_01', 'jin_08'],
    choices: [
      {
        id: 'weather',
        label: '朝の機嫌で1日のチームの空気が決まる',
        attackTypeHints: { jin_06: 3 },
        biasHints: { B7: 2 },
        jungShadowHints: { Te: 2 },
        tags: ['mood_anchor'],
      },
      {
        id: 'stable_fixed',
        label: '機嫌は安定しているが、評価や見方は固まっている',
        attackTypeHints: { jin_01: 2 },
        jungShadowHints: { Si: 1 },
        tags: ['stable_but_fixed'],
      },
      {
        id: 'stable_volatile',
        label: '機嫌は安定しているが、指示が変わる',
        attackTypeHints: { jin_08: 2 },
        biasHints: { B2: 1 },
        tags: ['stable_but_volatile'],
      },
      {
        id: 'unreadable',
        label: '機嫌も指示も読みにくく、何を考えているか不透明',
        attackTypeHints: { jin_03: 2 },
        biasHints: { B6: 1 },
        jungShadowHints: { Fe: 1 },
        tags: ['unreadable'],
      },
    ],
  },

  // ── 自分の判断ミスへの扱い方 ────────────────────────────────
  {
    id: 'atk_b_003',
    type: 'probe',
    text: 'その上司は、自分の判断ミスをどう扱いますか？',
    discriminates: ['jin_04', 'jin_08', 'jin_03', 'jin_01'],
    choices: [
      {
        id: 'shift',
        label: '『そっちの判断だ』『普通に考えたら』で部下に返す',
        attackTypeHints: { jin_04: 3 },
        biasHints: { B5: 2 },
        jungShadowHints: { Fi: 1 },
        tags: ['responsibility_shift'],
      },
      {
        id: 'forget',
        label: '忘れたかのように次の話を始める',
        attackTypeHints: { jin_08: 2 },
        biasHints: { B2: 2 },
        tags: ['memory_overwrite'],
      },
      {
        id: 'never_explicit',
        label: 'そもそも明確な判断を出していないので問えない',
        attackTypeHints: { jin_03: 3 },
        biasHints: { B6: 2 },
        jungShadowHints: { Fe: 2 },
        tags: ['no_explicit_decision'],
      },
      {
        id: 'attribute_to_subordinate',
        label: 'ミスは部下の能力不足として処理される',
        attackTypeHints: { jin_01: 2, jin_04: 1 },
        biasHints: { B3: 1 },
        tags: ['attribute_inward'],
      },
    ],
  },

  // ── 過去の発言との整合性 ──────────────────────────────────
  {
    id: 'atk_b_004',
    type: 'probe',
    text: '先週の指示と今週の指示が違ったとき、その上司は？',
    discriminates: ['jin_08', 'jin_03', 'jin_04', 'jin_01'],
    choices: [
      {
        id: 'rewrite',
        label: '『前にも言ったように』と過去の発言を上書きする',
        attackTypeHints: { jin_08: 3 },
        biasHints: { B2: 2 },
        jungShadowHints: { Te: 2 },
        tags: ['memory_rewrite'],
      },
      {
        id: 'no_diff',
        label: 'そもそも曖昧で違いが特定できない',
        attackTypeHints: { jin_03: 2 },
        biasHints: { B6: 1 },
        tags: ['ambiguous_indistinguishable'],
      },
      {
        id: 'deny',
        label: '違うと指摘すると『そうじゃない』と否定される',
        attackTypeHints: { jin_04: 2, jin_01: 1 },
        biasHints: { B5: 2, B3: 1 },
        tags: ['denial'],
      },
      {
        id: 'your_misunderstanding',
        label: '違いは認めるが『あなたが勘違いした』で片付ける',
        attackTypeHints: { jin_01: 2, jin_04: 1 },
        biasHints: { B3: 2 },
        tags: ['blame_perception'],
      },
    ],
  },

  // ── あなたの新しい動きへの反応 ──────────────────────────────
  {
    id: 'atk_b_005',
    type: 'probe',
    text: 'あなたが新しい提案や動きをしたとき、その上司は？',
    discriminates: ['jin_01', 'jin_03', 'jin_08'],
    choices: [
      {
        id: 'exception',
        label: '『あいつにしては珍しい』と例外として処理する',
        attackTypeHints: { jin_01: 3 },
        biasHints: { B3: 2 },
        jungShadowHints: { Si: 2 },
        tags: ['exception_processing'],
      },
      {
        id: 'noncommittal',
        label: '良いとも悪いとも言わず、そのまま流す',
        attackTypeHints: { jin_03: 2 },
        biasHints: { B6: 2 },
        jungShadowHints: { Fe: 1 },
        tags: ['noncommittal'],
      },
      {
        id: 'accept_then_change',
        label: '採用するが、翌週には別の方向に変わる',
        attackTypeHints: { jin_08: 3 },
        biasHints: { B2: 2 },
        jungShadowHints: { Te: 1 },
        tags: ['accept_then_flip'],
      },
      {
        id: 'mood_dependent',
        label: '反応がその日の機嫌に左右される',
        attackTypeHints: { jin_06: 3 },
        biasHints: { B7: 2 },
        tags: ['mood_dependent'],
      },
    ],
  },

  // ── あなたが消耗する瞬間（自己感覚側） ──────────────────────
  {
    id: 'atk_b_006',
    type: 'probe',
    text: 'その上司との関係であなたが最も消耗するのは？',
    discriminates: ['jin_01', 'jin_03', 'jin_04', 'jin_06', 'jin_08'],
    choices: [
      {
        id: 'no_update',
        label: '頑張っても評価が更新されないという無力感',
        attackTypeHints: { jin_01: 2 },
        tags: ['unfair_eval_exhaustion'],
      },
      {
        id: 'no_direction',
        label: '何を頑張ればいいのか方向性が見えない',
        attackTypeHints: { jin_03: 2 },
        tags: ['direction_lost'],
      },
      {
        id: 'unfair_blame',
        label: '言われた通りやったのに責任を取らされる理不尽さ',
        attackTypeHints: { jin_04: 2 },
        tags: ['unfair_blame_exhaustion'],
      },
      {
        id: 'mood_reading',
        label: '機嫌を読みながら仕事のタイミングを決める疲れ',
        attackTypeHints: { jin_06: 2 },
        tags: ['mood_reading_exhaustion'],
      },
      {
        id: 'redo',
        label: '差し戻しと方針変更で同じ仕事を何度もやる徒労感',
        attackTypeHints: { jin_08: 2 },
        tags: ['rework_exhaustion'],
      },
    ],
  },


  // ── 細かい監視・管理行動 ──────────────────────────────────
  {
    id: 'atk_b_007',
    type: 'probe',
    text: 'その上司は、あなたの業務進捗をどう把握しようとしますか？',
    discriminates: ['jin_11', 'jin_36', 'jin_44'],
    choices: [
      {
        id: 'constant_check',
        label: '1日に何度もチャットや声かけで状況を確認してくる',
        attackTypeHints: { jin_11: 3 },
        biasHints: { B3: 2 },
        jungShadowHints: { Te: 2, Si: 1 },
        tags: ['micromanage'],
      },
      {
        id: 'no_followup',
        label: '振った後はほぼ連絡なく、困っても助けが来ない',
        attackTypeHints: { jin_36: 3 },
        biasHints: { B2: 2 },
        jungShadowHints: { Te: 1 },
        tags: ['dump_forget'],
      },
      {
        id: 'no_reply',
        label: '報告しても返信や反応が来ない',
        attackTypeHints: { jin_44: 3 },
        biasHints: { B6: 2 },
        jungShadowHints: { Fi: 1 },
        tags: ['no_reply'],
      },
      {
        id: 'ask_others',
        label: '自分ではなく周囲の人に状況を聞き回る',
        attackTypeHints: { jin_39: 3, jin_11: 1 },
        biasHints: { B4: 2 },
        jungShadowHints: { Fe: 1 },
        tags: ['indirect_monitor'],
      },
    ],
  },

  // ── 過去の栄光・古い方法への言及 ─────────────────────────
  {
    id: 'atk_b_008',
    type: 'probe',
    text: 'その上司は、新しい手法や変化をどう受け止めますか？',
    discriminates: ['jin_17', 'jin_34', 'jin_29'],
    choices: [
      {
        id: 'past_glory',
        label: '『自分の若い頃は』『昔はこうやって乗り越えた』が出てくる',
        attackTypeHints: { jin_17: 3 },
        biasHints: { B6: 2, B7: 1 },
        jungShadowHints: { Si: 3 },
        tags: ['past_glory'],
      },
      {
        id: 'precedent_block',
        label: '『前例がない』『うちではそういうやり方はしない』と止める',
        attackTypeHints: { jin_34: 3 },
        biasHints: { B6: 3 },
        jungShadowHints: { Si: 2 },
        tags: ['precedent_block'],
      },
      {
        id: 'perfectionism_spread',
        label: '自分の高い基準を全員に求め始める',
        attackTypeHints: { jin_29: 3 },
        biasHints: { B3: 2, B5: 1 },
        jungShadowHints: { Te: 2 },
        tags: ['perfectionism_spread'],
      },
      {
        id: 'accepts_new',
        label: '新しい方法を試そうとする・あるいは中立',
        attackTypeHints: { jin_08: 1 },
        tags: ['open_to_change'],
      },
    ],
  },

  // ── 緊急度の扱い方 ──────────────────────────────────────
  {
    id: 'atk_b_009',
    type: 'probe',
    text: 'その上司から来る依頼や指示の緊急度は？',
    discriminates: ['jin_33', 'jin_11', 'jin_51'],
    choices: [
      {
        id: 'all_urgent',
        label: 'すべて「今すぐ」「急ぎ」で来て優先順位がつかない',
        attackTypeHints: { jin_33: 3 },
        biasHints: { B2: 3 },
        jungShadowHints: { Se: 2 },
        tags: ['all_urgent'],
      },
      {
        id: 'urgent_then_forgotten',
        label: '急かして頼んだのに、結果を使われないことが多い',
        attackTypeHints: { jin_33: 2, jin_44: 1 },
        biasHints: { B2: 2 },
        tags: ['fake_urgency'],
      },
      {
        id: 'moderate',
        label: '優先度に応じて依頼してくる',
        attackTypeHints: { jin_04: 1 },
        tags: ['reasonable_urgency'],
      },
      {
        id: 'slow_reply_urgent_demand',
        label: '返信は遅いのに要求だけは急ぎで来る',
        attackTypeHints: { jin_44: 3, jin_33: 1 },
        biasHints: { B7: 2 },
        tags: ['asymmetric_urgency'],
      },
    ],
  },

  // ── 報告ルート・情報の流し方 ────────────────────────────
  {
    id: 'atk_b_010',
    type: 'probe',
    text: 'その上司は、チームの情報をどう上に流しますか？',
    discriminates: ['jin_39', 'jin_11', 'jin_36'],
    choices: [
      {
        id: 'solo_report',
        label: '自分が窓口になり、チームの成果も自分の名前で上げる',
        attackTypeHints: { jin_39: 3 },
        biasHints: { B5: 2 },
        jungShadowHints: { Te: 2 },
        tags: ['credit_monopoly'],
      },
      {
        id: 'blocks_upward',
        label: '上司への直接報告を制限し、必ず自分を通すよう求める',
        attackTypeHints: { jin_39: 3 },
        biasHints: { B1: 2 },
        jungShadowHints: { Te: 1 },
        tags: ['route_monopoly'],
      },
      {
        id: 'transparent',
        label: '担当者が直接報告できる・情報は共有される',
        attackTypeHints: { jin_04: 1 },
        tags: ['transparent_flow'],
      },
      {
        id: 'dump_to_subordinate',
        label: '報告・調整もすべて部下に丸投げして自分は動かない',
        attackTypeHints: { jin_36: 3 },
        biasHints: { B2: 2 },
        jungShadowHints: { Te: 1 },
        tags: ['dump_reporting'],
      },
    ],
  },

  // ── 会議・打ち合わせの使い方 ────────────────────────────
  {
    id: 'atk_b_011',
    type: 'probe',
    text: 'その上司が主導する会議は、どんな展開になりますか？',
    discriminates: ['jin_51', 'jin_17', 'jin_34'],
    choices: [
      {
        id: 'no_end',
        label: '予定時間を過ぎても話が止まらず終わらない',
        attackTypeHints: { jin_51: 3 },
        biasHints: { B2: 2, B8: 1 },
        jungShadowHints: { Fe: 2 },
        tags: ['meeting_overrun'],
      },
      {
        id: 'nostalgia_detour',
        label: '昔の成功話や過去事例が脱線として入り込む',
        attackTypeHints: { jin_17: 3 },
        biasHints: { B6: 2 },
        jungShadowHints: { Si: 2 },
        tags: ['nostalgia_tangent'],
      },
      {
        id: 'precedent_agenda',
        label: '前回・前年と同じ議題・同じ結論になる',
        attackTypeHints: { jin_34: 3 },
        biasHints: { B6: 3 },
        jungShadowHints: { Si: 2 },
        tags: ['precedent_agenda'],
      },
      {
        id: 'efficient',
        label: '議題通りに進み、時間内に終わることが多い',
        attackTypeHints: { jin_04: 1 },
        tags: ['effective_meeting'],
      },
    ],
  },

  // ── 丸投げ・サポートのなさ ──────────────────────────────
  {
    id: 'atk_b_012',
    type: 'probe',
    text: 'あなたが困っているときの上司の動きは？',
    discriminates: ['jin_36', 'jin_44', 'jin_33'],
    choices: [
      {
        id: 'sink_or_swim',
        label: '『自分で考えて』で終わり、具体的な支援がない',
        attackTypeHints: { jin_36: 3 },
        biasHints: { B2: 2 },
        jungShadowHints: { Te: 1 },
        tags: ['sink_or_swim'],
      },
      {
        id: 'unreachable',
        label: '連絡しても反応がなく、孤立する',
        attackTypeHints: { jin_44: 3 },
        biasHints: { B6: 2 },
        tags: ['unreachable'],
      },
      {
        id: 'adds_urgency',
        label: '助けを求めると別の急ぎ案件を追加してくる',
        attackTypeHints: { jin_33: 3 },
        biasHints: { B2: 2 },
        tags: ['urgency_pile'],
      },
      {
        id: 'perfectionism_critique',
        label: '手伝うより先にやり方の細かい点を指摘する',
        attackTypeHints: { jin_29: 3, jin_11: 1 },
        biasHints: { B3: 2 },
        jungShadowHints: { Te: 2 },
        tags: ['critique_before_help'],
      },
    ],
  },

];
