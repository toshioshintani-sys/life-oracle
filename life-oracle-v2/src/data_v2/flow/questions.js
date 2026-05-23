// Flow診断 質問データベース
// layer: 'behavior' → 'reason' → 'confirmation' → 'emotion'（深掘り）
// 各choiceのnextQuestionIdで分岐。nullなら終了判定へ。

export const FLOW_QUESTIONS = [

  // ═══ STARTING QUESTIONS（intentごとに入口が変わる）══════════════

  {
    id: 'work_behavior_001',
    startFor: 'work_stress',
    layer: 'behavior',
    text: '最近、仕事に取りかかる前に、気持ちが重くなることが増えましたか？',
    targetFlows: ['over_adaptation', 'stagnation', 'self_denial', 'avoidance'],
    purpose: '仕事場面での回避・重さの有無を確認する',
    choices: [
      { id: 'yes', label: 'ある', scores: {}, nextQuestionId: 'work_reason_001' },
      { id: 'no', label: 'あまりない', scores: { recovery: 1 }, nextQuestionId: null },
    ],
  },

  {
    id: 'contact_behavior_001',
    startFor: 'relation_conflict',
    layer: 'behavior',
    text: '最近、誰かに連絡するのが億劫になっていますか？',
    targetFlows: ['over_adaptation', 'avoidance', 'stagnation', 'self_denial'],
    purpose: '対人接触回避の有無を確認する',
    choices: [
      { id: 'yes', label: 'はい', scores: {}, nextQuestionId: 'contact_reason_001' },
      { id: 'no', label: 'いいえ', scores: { recovery: 1 }, nextQuestionId: null },
    ],
  },

  {
    id: 'self_behavior_001',
    startFor: 'self_understand',
    layer: 'behavior',
    text: '最近、自分がなぜそう感じているのか、うまく言葉にできないことが増えましたか？',
    targetFlows: ['stagnation', 'self_denial', 'avoidance', 'impulse'],
    purpose: '感情の言語化困難の有無を確認する',
    choices: [
      { id: 'yes', label: 'ある', scores: {}, nextQuestionId: 'self_reason_001' },
      { id: 'no', label: 'あまりない', scores: { recovery: 1 }, nextQuestionId: null },
    ],
  },

  {
    id: 'future_behavior_001',
    startFor: 'future_decision',
    layer: 'behavior',
    text: '最近、決めなければならないことを、後回しにしていますか？',
    targetFlows: ['stagnation', 'self_denial', 'over_adaptation', 'avoidance'],
    purpose: '意思決定回避の有無を確認する',
    choices: [
      { id: 'yes', label: 'ある', scores: {}, nextQuestionId: 'future_reason_001' },
      { id: 'no', label: 'あまりない', scores: { recovery: 1 }, nextQuestionId: null },
    ],
  },

  // ═══ REASON QUESTIONS（「なぜ」を切り分ける）═══════════════════

  {
    id: 'work_reason_001',
    layer: 'reason',
    text: '仕事が重く感じる理由として、一番近いものはどれですか？',
    targetFlows: ['over_adaptation', 'stagnation', 'self_denial', 'avoidance'],
    purpose: '同じ「重さ」の背景を切り分ける',
    choices: [
      {
        id: 'expectation',
        label: '誰かの期待に応え続けている気がする',
        scores: { over_adaptation: 2 },
        nextQuestionId: 'over_adaptation_confirm_001',
        tags: ['people_pleasing', 'expectation'],
      },
      {
        id: 'self_doubt',
        label: '結果に自信が持てない',
        scores: { self_denial: 2 },
        nextQuestionId: 'self_denial_confirm_001',
        tags: ['low_confidence'],
      },
      {
        id: 'exhausted',
        label: '疲れが取れていない',
        scores: { stagnation: 2 },
        nextQuestionId: 'stagnation_confirm_001',
        tags: ['low_energy'],
      },
      {
        id: 'meaningless',
        label: 'やっても意味があるか分からない',
        scores: { avoidance: 2 },
        nextQuestionId: 'avoidance_confirm_001',
        tags: ['withdrawal', 'meaninglessness'],
      },
    ],
  },

  {
    id: 'contact_reason_001',
    layer: 'reason',
    text: '連絡が億劫な理由に、一番近いものはどれですか？',
    targetFlows: ['over_adaptation', 'avoidance', 'stagnation', 'self_denial'],
    purpose: '同じ「連絡しない」行動の背景を切り分ける',
    choices: [
      {
        id: 'reaction_fear',
        label: '相手の反応を考えると疲れる',
        scores: { over_adaptation: 2 },
        nextQuestionId: 'over_adaptation_confirm_001',
        tags: ['fear_of_reaction', 'people_pleasing'],
      },
      {
        id: 'no_energy',
        label: '単純に気力がない',
        scores: { stagnation: 2 },
        nextQuestionId: 'stagnation_confirm_001',
        tags: ['low_energy'],
      },
      {
        id: 'want_alone',
        label: '一人でいたい',
        scores: { avoidance: 2 },
        nextQuestionId: 'avoidance_confirm_001',
        tags: ['withdrawal'],
      },
      {
        id: 'feel_disliked',
        label: '嫌われた気がしている',
        scores: { self_denial: 2 },
        nextQuestionId: 'self_denial_confirm_001',
        tags: ['rejection_sensitivity'],
      },
    ],
  },

  {
    id: 'self_reason_001',
    layer: 'reason',
    text: '感情を言葉にしにくい時、どちらに近いですか？',
    targetFlows: ['stagnation', 'self_denial', 'avoidance', 'impulse'],
    purpose: '感情の状態を切り分ける',
    choices: [
      {
        id: 'too_much',
        label: '感情が多すぎて整理できない',
        scores: { impulse: 2 },
        nextQuestionId: 'impulse_confirm_001',
        tags: ['emotional_overload'],
      },
      {
        id: 'numb',
        label: '感情が薄くなった感じがする',
        scores: { stagnation: 2 },
        nextQuestionId: 'stagnation_confirm_001',
        tags: ['emotional_numbness'],
      },
      {
        id: 'no_point',
        label: 'どうせ伝わらないと思っている',
        scores: { avoidance: 2 },
        nextQuestionId: 'avoidance_confirm_001',
        tags: ['withdrawal', 'hopelessness'],
      },
      {
        id: 'wrong_feeling',
        label: '自分の感情が正しいか不安になる',
        scores: { self_denial: 2 },
        nextQuestionId: 'self_denial_confirm_001',
        tags: ['self_doubt', 'validation_seeking'],
      },
    ],
  },

  {
    id: 'future_reason_001',
    layer: 'reason',
    text: '決断を後回しにする時、どちらに近い理由ですか？',
    targetFlows: ['self_denial', 'stagnation', 'over_adaptation', 'avoidance'],
    purpose: '決断回避の背景を切り分ける',
    choices: [
      {
        id: 'fear_regret',
        label: '決めた後で後悔するのが怖い',
        scores: { self_denial: 2 },
        nextQuestionId: 'self_denial_confirm_001',
        tags: ['fear_of_regret'],
      },
      {
        id: 'lose_something',
        label: '決めると何かを失う気がする',
        scores: { over_adaptation: 2 },
        nextQuestionId: 'over_adaptation_confirm_001',
        tags: ['loss_aversion'],
      },
      {
        id: 'no_energy_decide',
        label: 'そもそも考える気力がない',
        scores: { stagnation: 2 },
        nextQuestionId: 'stagnation_confirm_001',
        tags: ['low_energy'],
      },
      {
        id: 'no_point_decide',
        label: 'どうせ何も変わらない気がする',
        scores: { avoidance: 2 },
        nextQuestionId: 'avoidance_confirm_001',
        tags: ['hopelessness', 'withdrawal'],
      },
    ],
  },

  // ═══ CONFIRMATION QUESTIONS（Flowの確度を上げる）════════════════

  {
    id: 'over_adaptation_confirm_001',
    layer: 'confirmation',
    text: '何かを伝えたり返信したりする時、「どう思われるか」をかなり考えますか？',
    targetFlows: ['over_adaptation'],
    purpose: '過剰適応Flowの確度を上げる',
    choices: [
      { id: 'yes', label: 'かなり考える', scores: { over_adaptation: 3 }, nextQuestionId: 'over_adaptation_deep_001' },
      { id: 'somewhat', label: '少し考える', scores: { over_adaptation: 1 }, nextQuestionId: 'over_adaptation_deep_001' },
      { id: 'no', label: 'あまり考えない', scores: { over_adaptation: -1, stagnation: 1 }, nextQuestionId: 'over_adaptation_deep_001' },
    ],
  },

  {
    id: 'stagnation_confirm_001',
    layer: 'confirmation',
    text: '休んでも、気力が戻りにくい感じがありますか？',
    targetFlows: ['stagnation'],
    purpose: '一時的な疲れか、停滞Flowかを切り分ける',
    choices: [
      { id: 'yes', label: 'ある', scores: { stagnation: 3 }, nextQuestionId: 'stagnation_deep_001' },
      { id: 'sometimes', label: '時々ある', scores: { stagnation: 1 }, nextQuestionId: 'stagnation_deep_001' },
      { id: 'no', label: '休めば戻る', scores: { recovery: 1 }, nextQuestionId: 'stagnation_deep_001' },
    ],
  },

  {
    id: 'avoidance_confirm_001',
    layer: 'confirmation',
    text: '距離を置くことで、少し安心する感覚がありますか？',
    targetFlows: ['avoidance'],
    purpose: '回避による安心があるか確認する',
    choices: [
      { id: 'yes', label: 'ある', scores: { avoidance: 3 }, nextQuestionId: 'avoidance_deep_001' },
      { id: 'somewhat', label: '少しある', scores: { avoidance: 1 }, nextQuestionId: 'avoidance_deep_001' },
      { id: 'no', label: '安心というより、ただ面倒', scores: { stagnation: 1 }, nextQuestionId: 'avoidance_deep_001' },
    ],
  },

  {
    id: 'self_denial_confirm_001',
    layer: 'confirmation',
    text: '相手の反応が薄いと、「自分が悪かったのかも」と思いやすいですか？',
    targetFlows: ['self_denial'],
    purpose: '自己否定Flowの確度を上げる',
    choices: [
      { id: 'yes', label: '思いやすい', scores: { self_denial: 3 }, nextQuestionId: 'self_denial_deep_001' },
      { id: 'sometimes', label: '時々ある', scores: { self_denial: 1 }, nextQuestionId: 'self_denial_deep_001' },
      { id: 'no', label: 'あまり思わない', scores: { self_denial: -1 }, nextQuestionId: 'self_denial_deep_001' },
    ],
  },

  {
    id: 'impulse_confirm_001',
    layer: 'confirmation',
    text: '後で後悔するとわかっていても、その場の気持ちで動いてしまうことがありますか？',
    targetFlows: ['impulse'],
    purpose: '衝動Flowの確度を上げる',
    choices: [
      { id: 'yes', label: 'ある', scores: { impulse: 3 }, nextQuestionId: 'impulse_deep_001' },
      { id: 'sometimes', label: '時々ある', scores: { impulse: 1 }, nextQuestionId: 'impulse_deep_001' },
      { id: 'no', label: 'あまりない', scores: { stagnation: 1 }, nextQuestionId: 'impulse_deep_001' },
    ],
  },

  // ═══ Q4・Q5：各Flowの明示的な深掘りチェーン ════════════════════
  // confirmation → deep_001 → deep_002 の順で nextQuestionId で繋ぐ

  // ── 過剰適応Flow ─────────────────────────────────────────────

  {
    id: 'over_adaptation_deep_001',
    layer: 'emotion',
    text: '最近、誰かに頼まれると、断りにくいと感じることが増えましたか？',
    targetFlows: ['over_adaptation'],
    purpose: '過剰適応のパターンを行動レベルで確認する',
    choices: [
      { id: 'yes', label: 'ある', scores: { over_adaptation: 2 }, nextQuestionId: 'over_adaptation_deep_002', tags: ['cant_refuse'] },
      { id: 'somewhat', label: '時々ある', scores: { over_adaptation: 1 }, nextQuestionId: 'over_adaptation_deep_002' },
      { id: 'no', label: 'あまりない', scores: { over_adaptation: -1, stagnation: 1 }, nextQuestionId: 'over_adaptation_deep_002' },
    ],
  },

  {
    id: 'over_adaptation_deep_002',
    layer: 'emotion',
    text: '後で疲れるとわかっていても、その場の空気に合わせてしまうことがありますか？',
    targetFlows: ['over_adaptation', 'self_denial'],
    purpose: '過剰適応Flowの核心的なパターンを確認する',
    choices: [
      { id: 'yes', label: 'よくある', scores: { over_adaptation: 3 }, tags: ['situation_compliance'] },
      { id: 'sometimes', label: '時々ある', scores: { over_adaptation: 1, self_denial: 1 } },
      { id: 'no', label: 'あまりない', scores: { recovery: 1 } },
    ],
  },

  // ── 停滞Flow ─────────────────────────────────────────────────

  {
    id: 'stagnation_deep_001',
    layer: 'emotion',
    text: '最近、以前は楽しめていたことへの関心が、薄れていますか？',
    targetFlows: ['stagnation'],
    purpose: '停滞Flowの深さを確認する（興味喪失の有無）',
    choices: [
      { id: 'yes', label: 'ある', scores: { stagnation: 2 }, nextQuestionId: 'stagnation_deep_002', tags: ['anhedonia'] },
      { id: 'somewhat', label: '少しある', scores: { stagnation: 1 }, nextQuestionId: 'stagnation_deep_002' },
      { id: 'no', label: 'あまりない', scores: { recovery: 1 }, nextQuestionId: 'stagnation_deep_002' },
    ],
  },

  {
    id: 'stagnation_deep_002',
    layer: 'emotion',
    text: '「なんとなく過ごした」と感じる日が、増えていますか？',
    targetFlows: ['stagnation', 'avoidance'],
    purpose: '停滞Flowの継続性を確認する',
    choices: [
      { id: 'yes', label: '増えている', scores: { stagnation: 3 }, tags: ['drifting'] },
      { id: 'somewhat', label: '少し増えた', scores: { stagnation: 1 } },
      { id: 'no', label: 'あまり変わらない', scores: { recovery: 1 } },
    ],
  },

  // ── 回避Flow ─────────────────────────────────────────────────

  {
    id: 'avoidance_deep_001',
    layer: 'emotion',
    text: '最近、予定を入れることに、以前より抵抗を感じますか？',
    targetFlows: ['avoidance'],
    purpose: '回避行動が広がっているか確認する',
    choices: [
      { id: 'yes', label: '感じる', scores: { avoidance: 2 }, nextQuestionId: 'avoidance_deep_002', tags: ['schedule_avoidance'] },
      { id: 'somewhat', label: '少し感じる', scores: { avoidance: 1 }, nextQuestionId: 'avoidance_deep_002' },
      { id: 'no', label: 'あまり感じない', scores: { recovery: 1 }, nextQuestionId: 'avoidance_deep_002' },
    ],
  },

  {
    id: 'avoidance_deep_002',
    layer: 'emotion',
    text: '連絡を後回しにしているうちに、さらに連絡しにくくなった経験がありますか？',
    targetFlows: ['avoidance', 'self_denial'],
    purpose: '回避スパイラルのパターンを確認する',
    choices: [
      { id: 'yes', label: 'ある', scores: { avoidance: 3 }, tags: ['avoidance_spiral'] },
      { id: 'sometimes', label: '時々ある', scores: { avoidance: 1, self_denial: 1 } },
      { id: 'no', label: 'あまりない', scores: { recovery: 1 } },
    ],
  },

  // ── 自己否定Flow ─────────────────────────────────────────────

  {
    id: 'self_denial_deep_001',
    layer: 'emotion',
    text: 'うまくいった時も、「たまたまだ」「運が良かっただけ」と思いやすいですか？',
    targetFlows: ['self_denial'],
    purpose: '自己否定Flowの根深さを確認する（成功の内在化ができているか）',
    choices: [
      { id: 'yes', label: '思いやすい', scores: { self_denial: 2 }, nextQuestionId: 'self_denial_deep_002', tags: ['impostor'] },
      { id: 'somewhat', label: '時々思う', scores: { self_denial: 1 }, nextQuestionId: 'self_denial_deep_002' },
      { id: 'no', label: 'あまり思わない', scores: { recovery: 1 }, nextQuestionId: 'self_denial_deep_002' },
    ],
  },

  {
    id: 'self_denial_deep_002',
    layer: 'emotion',
    text: '誰かに褒められても、素直に受け取れないことが多いですか？',
    targetFlows: ['self_denial', 'over_adaptation'],
    purpose: '自己否定Flowの外部評価への反応を確認する',
    choices: [
      { id: 'yes', label: 'よくある', scores: { self_denial: 3 }, tags: ['cant_accept_praise'] },
      { id: 'sometimes', label: '時々ある', scores: { self_denial: 1 } },
      { id: 'no', label: 'わりと受け取れる', scores: { recovery: 1 } },
    ],
  },

  // ── 衝動Flow ─────────────────────────────────────────────────

  {
    id: 'impulse_deep_001',
    layer: 'emotion',
    text: '感情が動いた後、「なぜあんなことをしたんだろう」と後悔することが多いですか？',
    targetFlows: ['impulse', 'self_denial'],
    purpose: '衝動後の後悔パターンを確認する',
    choices: [
      { id: 'yes', label: '多い', scores: { impulse: 2, self_denial: 1 }, nextQuestionId: 'impulse_deep_002', tags: ['post_impulse_regret'] },
      { id: 'sometimes', label: '時々ある', scores: { impulse: 1 }, nextQuestionId: 'impulse_deep_002' },
      { id: 'no', label: 'あまりない', scores: { recovery: 1 }, nextQuestionId: 'impulse_deep_002' },
    ],
  },

  {
    id: 'impulse_deep_002',
    layer: 'emotion',
    text: '不安や焦りを感じると、何かを「すぐ決めたい」衝動に駆られますか？',
    targetFlows: ['impulse'],
    purpose: '衝動Flowの核心的なトリガーを確認する',
    choices: [
      { id: 'yes', label: 'よくある', scores: { impulse: 3 }, tags: ['anxiety_driven_impulse'] },
      { id: 'sometimes', label: '時々ある', scores: { impulse: 1 } },
      { id: 'no', label: 'あまりない', scores: { stagnation: 1 } },
    ],
  },

  // ═══ DEEPENING QUESTIONS（スコア差が小さい時に使う）════════════

  {
    id: 'morning_deep_001',
    layer: 'emotion',
    text: '朝、起きた時の気持ちはどちらに近いですか？',
    targetFlows: ['stagnation', 'over_adaptation', 'recovery'],
    purpose: '朝の状態でFlowを絞り込む',
    choices: [
      {
        id: 'heavy',
        label: '今日も頑張らないとという重さがある',
        scores: { over_adaptation: 2, stagnation: 1 },
        tags: ['morning_dread'],
      },
      {
        id: 'empty',
        label: '何も感じない・空っぽな感じ',
        scores: { stagnation: 3 },
        tags: ['morning_empty'],
      },
      {
        id: 'anxious',
        label: 'やることが頭を回り続けている',
        scores: { over_adaptation: 2, impulse: 1 },
        tags: ['morning_anxiety'],
      },
      {
        id: 'ok',
        label: '比較的落ち着いている',
        scores: { recovery: 2 },
        tags: ['morning_ok'],
      },
    ],
  },

  {
    id: 'reaction_deep_001',
    layer: 'emotion',
    text: '誰かの言葉や態度が気になった時、どうなりやすいですか？',
    targetFlows: ['over_adaptation', 'self_denial', 'avoidance', 'impulse'],
    purpose: '対人反応パターンでFlowを絞り込む',
    choices: [
      {
        id: 'replay',
        label: '何度も頭の中で繰り返す',
        scores: { self_denial: 2, over_adaptation: 1 },
        tags: ['rumination'],
      },
      {
        id: 'distance',
        label: '静かに距離を置く',
        scores: { avoidance: 3 },
        tags: ['withdrawal'],
      },
      {
        id: 'explode',
        label: '感情が急に出てしまうことがある',
        scores: { impulse: 3 },
        tags: ['emotional_explosion'],
      },
      {
        id: 'suppress',
        label: '気にしていないふりをする',
        scores: { over_adaptation: 2, avoidance: 1 },
        tags: ['suppression'],
      },
    ],
  },
];
