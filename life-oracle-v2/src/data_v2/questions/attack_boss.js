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

];
