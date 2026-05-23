// JP軸（判断 J ／ 知覚 P）× 内省型（self）
// pole: 'J' → "そう"でJスコア上昇　pole: 'P' → "そう"でPスコア上昇

export const jpSelf = [

  // ── work（仕事場面）──────────────────────────────────────

  {
    id: 'JP_SELF_WORK_01',
    kind: 'axis', perspective: 'self', axis: 'JP', bias: null,
    angle: 'work', pole: 'J', weight: 1.5,
    scene: 'deadline_ahead',
    tag: '締切のある仕事',
    stem: '締切のある仕事は、余裕を持って早めに終わらせないと落ち着かない。',
  },
  {
    id: 'JP_SELF_WORK_02',
    kind: 'axis', perspective: 'self', axis: 'JP', bias: null,
    angle: 'work', pole: 'P', weight: 1.5,
    scene: 'last_minute_surge',
    tag: '追い込まれると集中',
    stem: '締切の直前になって初めて本気で集中できることが多い。',
  },
  {
    id: 'JP_SELF_WORK_03',
    kind: 'axis', perspective: 'self', axis: 'JP', bias: null,
    angle: 'work', pole: 'J', weight: 1.0,
    scene: 'daily_task_list',
    tag: '1日のタスク',
    stem: '「今日これだけは終わらせる」というラインを、朝のうちに自分の中で決めている。',
  },
  {
    id: 'JP_SELF_WORK_03_ALT',
    kind: 'axis', perspective: 'self', axis: 'JP', bias: null,
    angle: 'work', pole: 'P', weight: 1.0,
    scene: 'flexible_task_flow',
    tag: 'その日の流れで動く',
    stem: 'その日の気分や状況を見ながら、やることの順番を変えながら進める方が合っている。',
    altOf: 'JP_SELF_WORK_03',
  },

  // ── relation（人間関係）──────────────────────────────────

  {
    id: 'JP_SELF_RELATION_01',
    kind: 'axis', perspective: 'self', axis: 'JP', bias: null,
    angle: 'relation', pole: 'J', weight: 1.5,
    scene: 'punctuality_stress',
    tag: '待ち合わせの時間',
    stem: '待ち合わせに遅れそうになると、内容より前から強いストレスを感じる。',
  },
  {
    id: 'JP_SELF_RELATION_02',
    kind: 'axis', perspective: 'self', axis: 'JP', bias: null,
    angle: 'relation', pole: 'P', weight: 1.5,
    scene: 'spontaneous_plan',
    tag: '急な誘い',
    stem: '「今から来られる？」という突然の誘いに、予定がなければ乗ることが多い。',
  },
  {
    id: 'JP_SELF_RELATION_03',
    kind: 'axis', perspective: 'self', axis: 'JP', bias: null,
    angle: 'relation', pole: 'J', weight: 1.0,
    scene: 'group_plan_organizer',
    tag: '集まりの段取り',
    stem: '友人との集まりを企画するとき、自分が率先して日時や場所を決めたくなる。',
  },
  {
    id: 'JP_SELF_RELATION_03_ALT',
    kind: 'axis', perspective: 'self', axis: 'JP', bias: null,
    angle: 'relation', pole: 'P', weight: 1.0,
    scene: 'open_schedule_preference',
    tag: '予定を空けておく',
    stem: '先の予定をびっしり埋めるより、何も決まっていない空白の時間を持っていたい。',
    altOf: 'JP_SELF_RELATION_03',
  },

  // ── stress（ストレス・限界時）────────────────────────────

  {
    id: 'JP_SELF_STRESS_01',
    kind: 'axis', perspective: 'self', axis: 'JP', bias: null,
    angle: 'stress', pole: 'J', weight: 1.5,
    scene: 'unexpected_change_stress',
    tag: '計画が崩れたとき',
    stem: '決まっていた予定が突然変わると、内容より先に段取りが崩れた不快感が来る。',
  },
  {
    id: 'JP_SELF_STRESS_02',
    kind: 'axis', perspective: 'self', axis: 'JP', bias: null,
    angle: 'stress', pole: 'P', weight: 1.5,
    scene: 'too_many_constraints',
    tag: '細かいルールが多い環境',
    stem: 'やり方が細かく決められている環境より、自分で決めながら進められる方が力が出る。',
  },
  {
    id: 'JP_SELF_STRESS_03',
    kind: 'axis', perspective: 'self', axis: 'JP', bias: null,
    angle: 'stress', pole: 'J', weight: 1.0,
    scene: 'uncertainty_discomfort',
    tag: '結果が決まっていない状況',
    stem: '結果がまだ決まっていない状態が続くと、何となく落ち着かない感じが続く。',
  },

  // ── choice（選択・意思決定）──────────────────────────────

  {
    id: 'JP_SELF_CHOICE_01',
    kind: 'axis', perspective: 'self', axis: 'JP', bias: null,
    angle: 'choice', pole: 'J', weight: 1.5,
    scene: 'shopping_list_prepared',
    tag: '買い物に行くとき',
    stem: '買い物に行く前に、買うものをある程度頭に入れてから出かけることが多い。',
  },
  {
    id: 'JP_SELF_CHOICE_02',
    kind: 'axis', perspective: 'self', axis: 'JP', bias: null,
    angle: 'choice', pole: 'P', weight: 1.5,
    scene: 'menu_decided_at_table',
    tag: 'メニュー選び',
    stem: '飲食店でメニューは着席してから初めてゆっくり選ぶ方で、事前に決めておかない。',
  },
];
