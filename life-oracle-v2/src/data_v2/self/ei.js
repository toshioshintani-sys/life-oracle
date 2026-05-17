// EI軸（外向 E ／ 内向 I）× 内省型（self）
// pole: 'E' → "そう"でEスコア上昇　pole: 'I' → "そう"でIスコア上昇
// weight: 1.5=強・1.0=標準・0.7=弱
// 7ゲート確認済み（G1行動場面・G2 80字・G3占いNG・G4軸バレNG・G5scene重複なし・G6pole明確・G7自己評価語なし）

export const eiSelf = [

  // ── work（仕事場面）──────────────────────────────────────

  {
    id: 'EI_SELF_WORK_01',
    kind: 'axis', perspective: 'self', axis: 'EI', bias: null,
    angle: 'work', pole: 'E', weight: 1.5,
    scene: 'meeting_start',
    tag: '会議の始まり',
    stem: '会議で誰かが発言しない空白ができたとき、自分が最初に口を開くことが多い。',
  },
  {
    id: 'EI_SELF_WORK_02',
    kind: 'axis', perspective: 'self', axis: 'EI', bias: null,
    angle: 'work', pole: 'I', weight: 1.5,
    scene: 'after_work_event',
    tag: '職場の懇親会',
    stem: '仕事帰りに突然「今日飲みに行こう」と誘われると、楽しみより先に疲れを感じる。',
  },
  {
    id: 'EI_SELF_WORK_03',
    kind: 'axis', perspective: 'self', axis: 'EI', bias: null,
    angle: 'work', pole: 'E', weight: 1.0,
    scene: 'team_brainstorm',
    tag: '複数人での議論',
    stem: '一人で考えるより、誰かと話しながらのほうがアイデアが出やすい。',
  },
  {
    id: 'EI_SELF_WORK_03_ALT',
    kind: 'axis', perspective: 'self', axis: 'EI', bias: null,
    angle: 'work', pole: 'I', weight: 1.0,
    scene: 'solo_concentration',
    tag: '集中して作業',
    stem: '大事な仕事は、できるだけ一人で静かに取り組みたい。',
    altOf: 'EI_SELF_WORK_03',
  },

  // ── relation（人間関係）──────────────────────────────────

  {
    id: 'EI_SELF_RELATION_01',
    kind: 'axis', perspective: 'self', axis: 'EI', bias: null,
    angle: 'relation', pole: 'E', weight: 1.5,
    scene: 'quiet_weekend_followup',
    tag: '誰とも話さない休日の翌朝',
    stem: '3日間誰とも話さない休日が続いた翌朝、自分から誰かに連絡したくなる。',
  },
  {
    id: 'EI_SELF_RELATION_02',
    kind: 'axis', perspective: 'self', axis: 'EI', bias: null,
    angle: 'relation', pole: 'I', weight: 1.5,
    scene: 'party_aftermath',
    tag: '人が集まる場の後',
    stem: '大勢で集まったイベントの翌日は、一人でいる時間が欲しくなる。',
  },
  {
    id: 'EI_SELF_RELATION_03',
    kind: 'axis', perspective: 'self', axis: 'EI', bias: null,
    angle: 'relation', pole: 'E', weight: 1.0,
    scene: 'stranger_talk',
    tag: '初対面の人と',
    stem: '初対面の場で、知らない人に自分から話しかけることに大きな抵抗はない。',
  },
  {
    id: 'EI_SELF_RELATION_03_ALT',
    kind: 'axis', perspective: 'self', axis: 'EI', bias: null,
    angle: 'relation', pole: 'I', weight: 1.0,
    scene: 'deep_one_on_one',
    tag: '1対1の会話',
    stem: '大人数の場より、1対1でじっくり話せる場のほうが心地よい。',
    altOf: 'EI_SELF_RELATION_03',
  },

  // ── stress（ストレス・限界時）────────────────────────────

  {
    id: 'EI_SELF_STRESS_01',
    kind: 'axis', perspective: 'self', axis: 'EI', bias: null,
    angle: 'stress', pole: 'E', weight: 1.5,
    scene: 'stress_relief_talk',
    tag: '嫌なことがあった日',
    stem: '嫌なことがあった日は、誰かに話を聞いてもらうことで気持ちが楽になる。',
  },
  {
    id: 'EI_SELF_STRESS_02',
    kind: 'axis', perspective: 'self', axis: 'EI', bias: null,
    angle: 'stress', pole: 'I', weight: 1.5,
    scene: 'stress_relief_alone',
    tag: '追い詰められたとき',
    stem: '仕事や人間関係で追い詰められたとき、まず一人になれる場所を探したくなる。',
  },
  {
    id: 'EI_SELF_STRESS_03',
    kind: 'axis', perspective: 'self', axis: 'EI', bias: null,
    angle: 'stress', pole: 'E', weight: 1.0,
    scene: 'weekend_recharge',
    tag: '疲れた週末',
    stem: '疲れた週末でも、誰かと会う予定があるほうが気持ちが切り替わりやすい。',
  },
  {
    id: 'EI_SELF_STRESS_03_ALT',
    kind: 'axis', perspective: 'self', axis: 'EI', bias: null,
    angle: 'stress', pole: 'I', weight: 1.0,
    scene: 'recharge_alone_activity',
    tag: '一人で回復',
    stem: '疲れを取るために一番効くのは、誰にも気を使わない一人の時間だ。',
    altOf: 'EI_SELF_STRESS_03',
  },

  // ── choice（選択・意思決定）──────────────────────────────

  {
    id: 'EI_SELF_CHOICE_01',
    kind: 'axis', perspective: 'self', axis: 'EI', bias: null,
    angle: 'choice', pole: 'E', weight: 1.0,
    scene: 'decision_by_talking',
    tag: '迷ったときの決め方',
    stem: '何かを決めるとき、誰かに話しながら考えた方が結論が出やすい。',
  },
  {
    id: 'EI_SELF_CHOICE_02',
    kind: 'axis', perspective: 'self', axis: 'EI', bias: null,
    angle: 'choice', pole: 'I', weight: 1.0,
    scene: 'decision_by_reflection',
    tag: '一人で考える決断',
    stem: '大事な決断をするときは、一人で静かに考える時間を取りたい。',
  },
];
