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

  // ── メッセージ・連絡への応答 ──────────────────────────────
  {
    id: 'atk_s_007',
    type: 'probe',
    text: 'その部下にチャットや連絡をしたとき、どう反応しますか？',
    discriminates: ['jin_13', 'jin_40', 'jin_50'],
    choices: [
      {
        id: 'read_no_reply',
        label: '既読になるが返信が来ない・来ても数時間後',
        attackTypeHints: { jin_13: 3 },
        biasHints: { B2: 2 },
        jungShadowHints: { Si: 2 },
        tags: ['ghost_read'],
      },
      {
        id: 'claim_not_seen',
        label: '後で『見ていませんでした』と言う',
        attackTypeHints: { jin_40: 3 },
        biasHints: { B3: 2, B12: 1 },
        jungShadowHints: { Fi: 2 },
        tags: ['didnt_see'],
      },
      {
        id: 'quick_confirm',
        label: 'すぐに確認の返信と追加質問が来る',
        attackTypeHints: { jin_50: 3 },
        biasHints: { B1: 2 },
        jungShadowHints: { Fe: 2 },
        tags: ['over_consult'],
      },
      {
        id: 'normal_reply',
        label: '適切なタイミングで内容のある返信が来る',
        attackTypeHints: { jin_23: 1 },
        tags: ['normal_reply'],
      },
    ],
  },

  // ── 自力で判断できる範囲 ──────────────────────────────────
  {
    id: 'atk_s_008',
    type: 'probe',
    text: 'その部下は自分の裁量でどこまで判断して動けますか？',
    discriminates: ['jin_50', 'jin_19', 'jin_27', 'jin_23'],
    choices: [
      {
        id: 'always_ask',
        label: '小さな判断でも必ず確認・許可を求めて来る',
        attackTypeHints: { jin_50: 3 },
        biasHints: { B1: 3 },
        jungShadowHints: { Fe: 3 },
        tags: ['needs_permission'],
      },
      {
        id: 'freeze_without_map',
        label: 'やり方が明示されないと立ち止まって動けない',
        attackTypeHints: { jin_19: 3 },
        biasHints: { B6: 2 },
        jungShadowHints: { Si: 2 },
        tags: ['no_start_path'],
      },
      {
        id: 'excuse_when_wrong',
        label: '自分で判断して失敗すると外部要因を並べる',
        attackTypeHints: { jin_27: 3 },
        biasHints: { B12: 3 },
        jungShadowHints: { Fi: 2 },
        tags: ['external_blame'],
      },
      {
        id: 'overreach',
        label: '裁量以上の判断をして事後報告になる',
        attackTypeHints: { jin_23: 3 },
        biasHints: { B5: 3 },
        jungShadowHints: { Ne: 2 },
        tags: ['overreach'],
      },
    ],
  },

  // ── 締切・期日への意識 ────────────────────────────────────
  {
    id: 'atk_s_009',
    type: 'probe',
    text: '締切が近づいたとき、その部下はどう動きますか？',
    discriminates: ['jin_45', 'jin_13', 'jin_27'],
    choices: [
      {
        id: 'last_minute_panic',
        label: '締切直前に『間に合いません』と突然報告してくる',
        attackTypeHints: { jin_45: 3 },
        biasHints: { B2: 3 },
        jungShadowHints: { Ni: 2 },
        tags: ['last_minute_bomb'],
      },
      {
        id: 'silent_until_late',
        label: '期日前も後も何も言わず、こちらから催促するまで動かない',
        attackTypeHints: { jin_13: 3 },
        biasHints: { B2: 2, B6: 1 },
        jungShadowHints: { Si: 2 },
        tags: ['silent_deadline'],
      },
      {
        id: 'blame_complexity',
        label: '「想定より複雑だった」「前提が変わった」と遅延を説明する',
        attackTypeHints: { jin_27: 3 },
        biasHints: { B12: 3 },
        jungShadowHints: { Fi: 2 },
        tags: ['complexity_excuse'],
      },
      {
        id: 'on_time',
        label: '余裕を持って完了・または早めに報告して調整する',
        attackTypeHints: { jin_41: 1 },
        tags: ['on_time'],
      },
    ],
  },

  // ── 指示内容の解釈・実行のズレ ───────────────────────────
  {
    id: 'atk_s_010',
    type: 'probe',
    text: '指示した内容と実際の成果物・行動にズレがあるとき、その部下は？',
    discriminates: ['jin_23', 'jin_40', 'jin_19'],
    choices: [
      {
        id: 'my_interpretation',
        label: '『自分なりに解釈してやりました』と独自路線を主張する',
        attackTypeHints: { jin_23: 3 },
        biasHints: { B5: 3 },
        jungShadowHints: { Ne: 2 },
        tags: ['self_interpretation'],
      },
      {
        id: 'didnt_understand',
        label: '『そういう意味だと思いませんでした』と言う',
        attackTypeHints: { jin_40: 3 },
        biasHints: { B3: 2 },
        jungShadowHints: { Fi: 2 },
        tags: ['misread_direction'],
      },
      {
        id: 'stuck_on_ambiguity',
        label: '曖昧な点があると確認せず止まっていた',
        attackTypeHints: { jin_19: 3 },
        biasHints: { B6: 2 },
        jungShadowHints: { Si: 2 },
        tags: ['ambiguity_freeze'],
      },
      {
        id: 'checked_carefully',
        label: '事前に確認を入れてズレを防いでいた',
        attackTypeHints: { jin_50: 1 },
        tags: ['proactive_check'],
      },
    ],
  },

  // ── 相談・質問の密度 ─────────────────────────────────────
  {
    id: 'atk_s_011',
    type: 'probe',
    text: 'タスク中の相談や質問の頻度はどのくらいですか？',
    discriminates: ['jin_50', 'jin_13', 'jin_45'],
    choices: [
      {
        id: 'too_frequent',
        label: '些細なことでも毎回確認が来てペースが乱れる',
        attackTypeHints: { jin_50: 3 },
        biasHints: { B1: 3 },
        jungShadowHints: { Fe: 3 },
        tags: ['over_consult'],
      },
      {
        id: 'no_report',
        label: '相談も報告も来ないので、いつ困っているかわからない',
        attackTypeHints: { jin_13: 3 },
        biasHints: { B2: 2 },
        jungShadowHints: { Si: 2 },
        tags: ['no_report'],
      },
      {
        id: 'late_consult',
        label: 'ギリギリになって「実は困っていました」と来る',
        attackTypeHints: { jin_45: 3 },
        biasHints: { B2: 2 },
        jungShadowHints: { Ni: 1 },
        tags: ['late_escalation'],
      },
      {
        id: 'appropriate',
        label: '必要なタイミングで要点を絞って相談してくる',
        attackTypeHints: { jin_19: 1 },
        tags: ['appropriate_consult'],
      },
    ],
  },

  // ── 成長意欲・フィードバックの受け取り方 ──────────────────
  {
    id: 'atk_s_012',
    type: 'probe',
    text: 'フィードバックや改善指摘をしたとき、その部下の反応は？',
    discriminates: ['jin_23', 'jin_27', 'jin_40', 'jin_45'],
    choices: [
      {
        id: 'argue_back',
        label: '『でも自分としては正しいと思いました』と反論してくる',
        attackTypeHints: { jin_23: 3 },
        biasHints: { B5: 3 },
        jungShadowHints: { Ne: 2, Fi: 1 },
        tags: ['pushback'],
      },
      {
        id: 'excuse_context',
        label: '改善より先に状況説明・言い訳が始まる',
        attackTypeHints: { jin_27: 3 },
        biasHints: { B12: 3 },
        jungShadowHints: { Fi: 2 },
        tags: ['excuse_first'],
      },
      {
        id: 'i_didnt_know_that_rule',
        label: '『そのルールは知りませんでした』と初めて聞いた顔をする',
        attackTypeHints: { jin_40: 3 },
        biasHints: { B3: 2 },
        jungShadowHints: { Fi: 2 },
        tags: ['rule_unknown'],
      },
      {
        id: 'nods_doesnt_change',
        label: '『わかりました』と言うが同じことを繰り返す',
        attackTypeHints: { jin_45: 3 },
        biasHints: { B2: 2, B6: 1 },
        jungShadowHints: { Ni: 1 },
        tags: ['nod_no_change'],
      },
    ],
  },

];
