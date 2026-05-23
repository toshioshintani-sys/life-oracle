// SN軸（感覚 S ／ 直観 N）× 内省型（self）
// pole: 'S' → "そう"でSスコア上昇　pole: 'N' → "そう"でNスコア上昇

export const snSelf = [

  // ── work（仕事場面）──────────────────────────────────────

  {
    id: 'SN_SELF_WORK_01',
    kind: 'axis', perspective: 'self', axis: 'SN', bias: null,
    angle: 'work', pole: 'S', weight: 1.5,
    scene: 'report_with_numbers',
    tag: '報告・説明の仕方',
    stem: '誰かに説明するとき、具体的な数字や事実の例を入れないと不安になる。',
  },
  {
    id: 'SN_SELF_WORK_02',
    kind: 'axis', perspective: 'self', axis: 'SN', bias: null,
    angle: 'work', pole: 'N', weight: 1.5,
    scene: 'meeting_future_ideas',
    tag: '会議でのアイデア',
    stem: '会議で今の問題より「3年後にどうなっているか」の話になると気持ちが乗ってくる。',
  },
  {
    id: 'SN_SELF_WORK_03',
    kind: 'axis', perspective: 'self', axis: 'SN', bias: null,
    angle: 'work', pole: 'S', weight: 1.0,
    scene: 'new_tool_manual',
    tag: '新しいツールを使うとき',
    stem: '新しいツールやシステムを使い始めるとき、マニュアルを一通り確認してから使いたい。',
  },
  {
    id: 'SN_SELF_WORK_03_ALT',
    kind: 'axis', perspective: 'self', axis: 'SN', bias: null,
    angle: 'work', pole: 'N', weight: 1.0,
    scene: 'pattern_recognition',
    tag: '状況を把握するとき',
    stem: '細かい事実を積み上げるより、まず全体の流れや構造を掴む方が理解が早い。',
    altOf: 'SN_SELF_WORK_03',
  },

  // ── relation（人間関係）──────────────────────────────────

  {
    id: 'SN_SELF_RELATION_01',
    kind: 'axis', perspective: 'self', axis: 'SN', bias: null,
    angle: 'relation', pole: 'S', weight: 1.5,
    scene: 'memory_details',
    tag: '思い出を話すとき',
    stem: '過去の出来事を話すとき、その時の天気や食べたものなど細かい場面が浮かびやすい。',
  },
  {
    id: 'SN_SELF_RELATION_02',
    kind: 'axis', perspective: 'self', axis: 'SN', bias: null,
    angle: 'relation', pole: 'N', weight: 1.5,
    scene: 'abstract_conversation',
    tag: '抽象的な話',
    stem: '「もし〜だったら」「なぜこうなのか」を掘り下げる会話が弾む。',
  },
  {
    id: 'SN_SELF_RELATION_03',
    kind: 'axis', perspective: 'self', axis: 'SN', bias: null,
    angle: 'relation', pole: 'S', weight: 1.0,
    scene: 'concrete_vs_abstract',
    tag: '話の好み',
    stem: '仮定の話より、実際に起きたことや具体的な体験談の方が話に入りやすい。',
  },
  {
    id: 'SN_SELF_RELATION_03_ALT',
    kind: 'axis', perspective: 'self', axis: 'SN', bias: null,
    angle: 'relation', pole: 'N', weight: 1.0,
    scene: 'future_imagination',
    tag: '未来の話',
    stem: '5年後・10年後の話をするとき、不安より先にわくわくした気持ちになる。',
    altOf: 'SN_SELF_RELATION_03',
  },

  // ── stress（ストレス・限界時）────────────────────────────

  {
    id: 'SN_SELF_STRESS_01',
    kind: 'axis', perspective: 'self', axis: 'SN', bias: null,
    angle: 'stress', pole: 'S', weight: 1.5,
    scene: 'proven_method_in_crisis',
    tag: '追い詰められたとき',
    stem: '追い詰められたとき、新しいやり方を試すより過去にうまくいった方法に戻る。',
  },
  {
    id: 'SN_SELF_STRESS_02',
    kind: 'axis', perspective: 'self', axis: 'SN', bias: null,
    angle: 'stress', pole: 'N', weight: 1.5,
    scene: 'problem_root_curiosity',
    tag: '問題が起きたとき',
    stem: '問題が起きたとき、対処するより先に「なぜこうなったのか」の原因が気になる。',
  },
  {
    id: 'SN_SELF_STRESS_03',
    kind: 'axis', perspective: 'self', axis: 'SN', bias: null,
    angle: 'stress', pole: 'N', weight: 1.0,
    scene: 'hunch_before_data',
    tag: '根拠より先に予感',
    stem: '理由はうまく説明できないが「これはこうなる」という予感が後から的中することがある。',
  },

  // ── choice（選択・意思決定）──────────────────────────────

  {
    id: 'SN_SELF_CHOICE_01',
    kind: 'axis', perspective: 'self', axis: 'SN', bias: null,
    angle: 'choice', pole: 'S', weight: 1.5,
    scene: 'restaurant_research',
    tag: '行くお店を選ぶとき',
    stem: '行くお店を決めるとき、口コミや評価を事前にある程度調べてから行きたい。',
  },
  {
    id: 'SN_SELF_CHOICE_02',
    kind: 'axis', perspective: 'self', axis: 'SN', bias: null,
    angle: 'choice', pole: 'N', weight: 1.5,
    scene: 'new_method_over_proven',
    tag: '新しいやり方と実績のある方法',
    stem: '今まで通りのやり方より、まだ試していない新しい方法を試したくなる。',
  },
];
