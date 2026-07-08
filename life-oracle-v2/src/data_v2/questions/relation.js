// 人間関係ドメイン質問
// 原則：行動場面のみ。答えが結論を予告しない。

export const RELATION_QUESTIONS = [

  // ── 入口 ────────────────────────────────────────────────────────
  {
    id: 'r_entry_001',
    startFor: 'relation_conflict',
    type: 'entry',
    text: '今、誰かとの関係で一番消耗しているのはどれですか？',
    discriminates: ['r_partner_drift', 'r_parent_pressure', 'r_friend_isolation', 'r_friend_toxic'],
    choices: [
      {
        id: 'partner',
        label: 'パートナー・恋人',
        situationScores: { r_partner_drift: 2 },
        tags: ['partner_domain'],
      },
      {
        id: 'parent',
        label: '親・家族',
        situationScores: { r_parent_pressure: 2, r_parent_care: 1 },
        demographicHints: { age_40s: 1, age_50s: 1, age_60s: 1 },
        tags: ['parent_domain'],
      },
      {
        id: 'friend',
        label: '友人・知人',
        situationScores: { r_friend_isolation: 1, r_friend_toxic: 1 },
        tags: ['friend_domain'],
      },
      {
        id: 'general',
        label: '特定の誰かというより、人間関係全体が重い',
        situationScores: { r_friend_isolation: 2 },
        biasHints: { B6: 1 },
        jungHints: { Fi: 1 },
        tags: ['general_drain'],
      },
      {
        // 2026-07-09追加：困っていない人の逃げ場（分岐ゲート）。
        // 選択時はApp.jsx側でAkinatorループに入らずトピック選択へ戻す。
        id: 'relation_ok',
        label: '今日も誰かとぶつかることなく、いつも通り過ごせている',
        tags: ['topic_ok'],
      },
    ],
  },

  // ── パートナー系 ─────────────────────────────────────────────────
  {
    id: 'r_partner_talk_001',
    type: 'probe',
    text: 'パートナーに何か伝えようとした時、最近どうなることが多いですか？',
    discriminates: ['r_partner_drift', 'r_partner_divorce'],
    choices: [
      {
        id: 'no_response',
        label: '反応が薄い。聞いているのかいないのか分からない',
        situationScores: { r_partner_drift: 3 },
        jungHints: { Fe: 1 },
        tags: ['partner_unresponsive'],
      },
      {
        id: 'conflict',
        label: 'すぐ言い合いになる。話すたびに疲れる',
        situationScores: { r_partner_drift: 2, r_partner_divorce: 1 },
        biasHints: { B8: 1 },
        tags: ['partner_conflict'],
      },
      {
        id: 'gave_up',
        label: 'もう言うのをやめた。何を言っても変わらないから',
        situationScores: { r_partner_divorce: 3 },
        biasHints: { B6: 1 },
        jungHints: { Fi: 1 },
        tags: ['partner_gave_up'],
      },
      {
        id: 'no_opportunity',
        label: '話す機会がそもそもない。すれ違いが続いている',
        situationScores: { r_partner_drift: 3 },
        tags: ['partner_no_time'],
      },
    ],
  },

  {
    id: 'r_partner_when_001',
    type: 'probe',
    text: 'この関係が「よかった」と感じていたのは、いつ頃ですか？',
    discriminates: ['r_partner_drift', 'r_partner_divorce'],
    choices: [
      {
        id: 'recent',
        label: '最近も良い時はある。ただ悪い時が増えた',
        situationScores: { r_partner_drift: 3 },
        tags: ['partner_fluctuating'],
      },
      {
        id: 'long_ago',
        label: 'だいぶ前。1年以上前かもしれない',
        situationScores: { r_partner_divorce: 2, r_partner_drift: 1 },
        biasHints: { B8: 2 },
        tags: ['partner_long_bad'],
      },
      {
        id: 'cant_remember',
        label: '思い出せない。最初からこうだったかもしれない',
        situationScores: { r_partner_divorce: 3 },
        biasHints: { B8: 2, B3: 1 },
        tags: ['partner_no_memory'],
      },
    ],
  },

  {
    id: 'r_partner_end_001',
    type: 'probe',
    text: '関係を終わらせることを、頭に置いたことはありますか？',
    discriminates: ['r_partner_divorce', 'r_partner_drift'],
    choices: [
      {
        id: 'seriously',
        label: 'ある。かなり具体的に考えたことがある',
        situationScores: { r_partner_divorce: 4 },
        biasHints: { B1: 1 },
        tags: ['divorce_serious'],
      },
      {
        id: 'sometimes',
        label: '頭をよぎることはある。でも踏み切れない',
        situationScores: { r_partner_divorce: 2, r_partner_drift: 1 },
        biasHints: { B1: 2, B8: 1 },
        tags: ['divorce_considering'],
      },
      {
        id: 'no',
        label: 'ない。続けたいとは思っている',
        situationScores: { r_partner_drift: 2, r_partner_divorce: -1 },
        tags: ['want_to_continue'],
      },
    ],
  },

  {
    id: 'r_partner_self_001',
    type: 'probe',
    text: 'この関係の中で、「我慢していること」はありますか？',
    discriminates: ['r_partner_drift', 'r_partner_divorce'],
    choices: [
      {
        id: 'a_lot',
        label: 'かなりある。言いたいことの半分も言えていない',
        situationScores: { r_partner_divorce: 2, r_partner_drift: 2 },
        biasHints: { B4: 2 },
        jungHints: { Fe: 2, Fi: -1 },
        tags: ['suppressing_needs'],
      },
      {
        id: 'some',
        label: '多少はある。でもお互い様だとも思っている',
        situationScores: { r_partner_drift: 2 },
        tags: ['mutual_tolerance'],
      },
      {
        id: 'no',
        label: '我慢というより、もう期待していない',
        situationScores: { r_partner_divorce: 3 },
        biasHints: { B6: 2 },
        tags: ['no_expectation'],
      },
    ],
  },

  // ── 親・家族系 ───────────────────────────────────────────────────
  {
    id: 'r_parent_contact_001',
    type: 'probe',
    text: '親から連絡が来た時、最初に感じるのはどちらですか？',
    discriminates: ['r_parent_pressure', 'r_parent_care'],
    choices: [
      {
        id: 'dread',
        label: 'また何か言われる、という身構え',
        situationScores: { r_parent_pressure: 4 },
        biasHints: { B1: 2 },
        jungHints: { Fe: 1 },
        tags: ['parent_dread'],
      },
      {
        id: 'guilt',
        label: 'ちゃんとしなければ、という義務感',
        situationScores: { r_parent_pressure: 2, r_parent_care: 2 },
        biasHints: { B4: 1 },
        jungHints: { Fe: 2 },
        tags: ['parent_guilt'],
      },
      {
        id: 'burden',
        label: '対応しなければならない用件が増える、という重さ',
        situationScores: { r_parent_care: 3 },
        biasHints: { B8: 1 },
        demographicHints: { age_50s: 2, age_60s: 2 },
        tags: ['parent_care_burden'],
      },
      {
        id: 'normal',
        label: '特に何も感じない。普通に出る',
        situationScores: { r_parent_pressure: -2, r_parent_care: -2 },
        tags: [],
      },
    ],
  },

  {
    id: 'r_parent_control_001',
    type: 'probe',
    text: '親との会話の中で、自分の意見や選択を否定されることがありますか？',
    discriminates: ['r_parent_pressure'],
    choices: [
      {
        id: 'always',
        label: 'よくある。反論すると関係が悪化するので黙っている',
        situationScores: { r_parent_pressure: 4 },
        biasHints: { B4: 2, B1: 1 },
        jungHints: { Fe: 2 },
        tags: ['parent_silenced'],
      },
      {
        id: 'sometimes',
        label: 'たまにある。その後しばらく引きずる',
        situationScores: { r_parent_pressure: 2 },
        jungHints: { Fi: 1 },
        tags: ['parent_lingers'],
      },
      {
        id: 'not_that',
        label: '否定というより、心配・干渉の形で来る',
        situationScores: { r_parent_pressure: 2 },
        biasHints: { B4: 1 },
        tags: ['parent_intrusive'],
      },
      {
        id: 'no',
        label: 'あまりない',
        situationScores: { r_parent_pressure: -2 },
        tags: [],
      },
    ],
  },

  {
    id: 'r_parent_care_001',
    type: 'probe',
    text: '親や家族（配偶者・兄弟姉妹など）の世話に、時間や体力を使っていますか？',
    discriminates: ['r_parent_care'],
    choices: [
      {
        id: 'main',
        label: 'かなり使っている。自分の生活が犠牲になっていると感じる',
        situationScores: { r_parent_care: 4 },
        biasHints: { B8: 1 },
        demographicHints: { age_50s: 2, age_60s: 2 },
        tags: ['care_heavy'],
      },
      {
        id: 'some',
        label: '少しある。これからもっと増えそうで不安',
        situationScores: { r_parent_care: 2 },
        jungHints: { Ni: 1 },
        demographicHints: { age_40s: 1, age_50s: 2, age_60s: 1 },
        tags: ['care_increasing'],
      },
      {
        id: 'not_yet',
        label: '今はまだないが、頭の中にはある',
        situationScores: { r_parent_care: 1 },
        demographicHints: { age_40s: 1, age_50s: 1 },
        tags: ['care_anticipating'],
      },
      {
        id: 'no',
        label: 'ない',
        situationScores: { r_parent_care: -2 },
        tags: [],
      },
    ],
  },

  {
    id: 'r_care_who_001',
    type: 'probe',
    text: '世話をしている（または一番心配している）相手は誰ですか？',
    discriminates: ['r_parent_care'],
    choices: [
      {
        id: 'parent',
        label: '親（実父母・義父母）',
        situationScores: { r_parent_care: 2 },
        demographicHints: { age_40s: 1, age_50s: 2, age_60s: 1 },
        tags: ['care_parent'],
      },
      {
        id: 'spouse',
        label: '配偶者・パートナー',
        situationScores: { r_parent_care: 3, r_partner_drift: 1 },
        demographicHints: { age_50s: 1, age_60s: 3 },
        tags: ['care_spouse'],
      },
      {
        id: 'sibling_other',
        label: '兄弟姉妹・その他の家族',
        situationScores: { r_parent_care: 2 },
        demographicHints: { age_40s: 1, age_50s: 1, age_60s: 1 },
        tags: ['care_other_family'],
      },
      {
        id: 'multiple',
        label: '複数が重なっている',
        situationScores: { r_parent_care: 3 },
        biasHints: { B8: 1 },
        demographicHints: { age_50s: 2, age_60s: 2 },
        tags: ['care_multiple'],
      },
    ],
  },

  {
    id: 'r_parent_guilt_001',
    type: 'probe',
    text: '親に対して「十分にできていない」という罪悪感を感じることがありますか？',
    discriminates: ['r_parent_pressure', 'r_parent_care'],
    choices: [
      {
        id: 'always',
        label: 'よくある。何をしても足りない気がする',
        situationScores: { r_parent_pressure: 2, r_parent_care: 2 },
        biasHints: { B3: 2 },
        jungHints: { Fe: 2 },
        demographicHints: { age_50s: 1, age_60s: 1 },
        tags: ['guilt_chronic'],
      },
      {
        id: 'sometimes',
        label: '時々ある。特に親が不満を口にした後',
        situationScores: { r_parent_pressure: 3 },
        biasHints: { B4: 1 },
        tags: ['guilt_triggered'],
      },
      {
        id: 'no',
        label: 'あまりない',
        situationScores: { r_parent_pressure: -2 },
        tags: [],
      },
    ],
  },

  // ── 友人系 ───────────────────────────────────────────────────────
  {
    id: 'r_friend_contact_001',
    type: 'probe',
    text: '友人に自分から連絡することが、最近どれくらいありますか？',
    discriminates: ['r_friend_isolation', 'r_friend_toxic'],
    choices: [
      {
        id: 'rarely',
        label: 'ほとんどない。気づいたら連絡しなくなっていた',
        situationScores: { r_friend_isolation: 3 },
        biasHints: { B6: 1 },
        jungHints: { Fi: 1 },
        tags: ['friend_withdrawing'],
      },
      {
        id: 'one_way',
        label: '自分からばかり。相手から来ることはほぼない',
        situationScores: { r_friend_toxic: 2, r_friend_isolation: 1 },
        biasHints: { B4: 1 },
        tags: ['one_sided'],
      },
      {
        id: 'obligated',
        label: '義務感でしている。本音は静かにしていたい',
        situationScores: { r_friend_toxic: 2 },
        biasHints: { B8: 1 },
        jungHints: { Fe: 1 },
        tags: ['obligated_contact'],
      },
      {
        id: 'natural',
        label: '普通にある。特に問題はない',
        situationScores: { r_friend_isolation: -2, r_friend_toxic: -2 },
        tags: [],
      },
    ],
  },

  {
    id: 'r_friend_after_001',
    type: 'probe',
    text: '誰かと会った後、どうなることが多いですか？',
    discriminates: ['r_friend_isolation', 'r_friend_toxic'],
    choices: [
      {
        id: 'drained',
        label: 'どっと疲れる。会わなければよかったと思うことがある',
        situationScores: { r_friend_toxic: 3 },
        biasHints: { B8: 1 },
        jungHints: { Fi: 1 },
        tags: ['social_drain'],
      },
      {
        id: 'empty',
        label: '楽しかったはずなのに、帰るとなぜか空虚',
        situationScores: { r_friend_isolation: 2 },
        jungHints: { Fi: 1, Fe: -1 },
        tags: ['post_social_empty'],
      },
      {
        id: 'fine',
        label: '普通。ただ誘われる機会が少なくなった',
        situationScores: { r_friend_isolation: 2 },
        tags: ['declining_invites'],
      },
    ],
  },

  {
    id: 'r_friend_honest_001',
    type: 'probe',
    text: '本当に困った時に、連絡できる人がいますか？',
    discriminates: ['r_friend_isolation', 'r_friend_toxic'],
    choices: [
      {
        id: 'no_one',
        label: 'いない。または思い浮かばない',
        situationScores: { r_friend_isolation: 4 },
        biasHints: { B1: 1 },
        jungHints: { Fi: 2 },
        tags: ['no_support'],
      },
      {
        id: 'hesitate',
        label: '一応いるが、迷惑をかけたくなくて連絡できない',
        situationScores: { r_friend_isolation: 2 },
        biasHints: { B4: 2 },
        jungHints: { Fe: 2 },
        tags: ['cant_reach_out'],
      },
      {
        id: 'specific',
        label: 'いるにはいる。ただその人との関係も少し疲れる',
        situationScores: { r_friend_toxic: 2 },
        tags: ['support_but_draining'],
      },
    ],
  },

  // ── クロスカット ─────────────────────────────────────────────────
  {
    id: 'r_cross_giver_001',
    type: 'probe',
    text: '人間関係の中で、どちら側にいることが多いですか？',
    discriminates: ['r_friend_toxic', 'r_parent_care', 'r_partner_drift'],
    choices: [
      {
        id: 'giving',
        label: '聞く・助ける・合わせる側が多い',
        situationScores: { r_friend_toxic: 2, r_parent_care: 1 },
        biasHints: { B4: 2 },
        jungHints: { Fe: 3 },
        tags: ['chronic_giver'],
      },
      {
        id: 'balanced',
        label: 'わりとバランスが取れている',
        situationScores: {},
        tags: [],
      },
      {
        id: 'receiving',
        label: '受け取る・頼る側が多いと思う',
        situationScores: { r_friend_toxic: -1 },
        tags: ['receiver'],
      },
    ],
  },

  {
    id: 'r_cross_alone_001',
    type: 'probe',
    text: '一人でいる時と、誰かといる時、どちらが「楽」ですか？',
    discriminates: ['r_friend_isolation', 'r_partner_drift'],
    choices: [
      {
        id: 'alone',
        label: '圧倒的に一人。人といると気を使って消耗する',
        situationScores: { r_friend_isolation: 2, r_partner_drift: 1 },
        biasHints: { B6: 1 },
        jungHints: { Fi: 2 },
        tags: ['prefer_alone'],
      },
      {
        id: 'depends',
        label: '相手による。特定の人といると楽、そうでない人は疲れる',
        situationScores: { r_friend_toxic: 1 },
        tags: ['person_dependent'],
      },
      {
        id: 'neither',
        label: '一人も寂しい、誰かといても疲れる。どちらも辛い',
        situationScores: { r_friend_isolation: 2, r_partner_drift: 1 },
        biasHints: { B3: 1 },
        jungHints: { Fi: 1, Fe: 1 },
        tags: ['both_hard'],
      },
    ],
  },

  {
    id: 'r_cross_unsaid_001',
    type: 'probe',
    text: 'その人（関係で一番消耗している人）に、言えていないことはありますか？',
    discriminates: ['r_partner_divorce', 'r_parent_pressure', 'r_friend_toxic'],
    choices: [
      {
        id: 'a_lot',
        label: 'かなりある。言ったら関係が壊れると思っている',
        situationScores: { r_partner_divorce: 1, r_parent_pressure: 2, r_friend_toxic: 1 },
        biasHints: { B1: 2, B4: 2 },
        jungHints: { Fe: 2 },
        tags: ['fear_of_breaking'],
      },
      {
        id: 'gave_up',
        label: '言おうとしたが伝わらなかった。もう言うのをやめた',
        situationScores: { r_partner_divorce: 2, r_friend_toxic: 1 },
        biasHints: { B6: 2 },
        tags: ['gave_up_saying'],
      },
      {
        id: 'self_unclear',
        label: '自分でも何を伝えたいか整理できていない',
        situationScores: { r_partner_drift: 1, r_friend_isolation: 1 },
        jungHints: { Fi: 1 },
        tags: ['unclear_feelings'],
      },
    ],
  },

  {
    id: 'r_cross_changed_001',
    type: 'probe',
    text: 'その関係が始まった頃の自分と、今の自分を比べると？',
    discriminates: ['r_partner_drift', 'r_parent_pressure', 'r_friend_toxic'],
    choices: [
      {
        id: 'lost_self',
        label: '言いたいことが言えなくなった。自分が薄まった感じがする',
        situationScores: { r_parent_pressure: 2, r_friend_toxic: 2 },
        biasHints: { B4: 2 },
        jungHints: { Fi: -1, Fe: 2 },
        tags: ['lost_self'],
      },
      {
        id: 'tired',
        label: '最初は頑張れたが、今は疲れた',
        situationScores: { r_partner_drift: 2, r_friend_toxic: 1 },
        biasHints: { B8: 1 },
        tags: ['effort_faded'],
      },
      {
        id: 'not_changed',
        label: '自分はあまり変わっていない。関係が変わった',
        situationScores: { r_partner_drift: 2 },
        tags: ['relationship_changed'],
      },
    ],
  },

  {
    id: 'r_cross_future_001',
    type: 'probe',
    text: '5年後、この関係はどうなっていると思いますか？',
    discriminates: ['r_partner_divorce', 'r_friend_isolation', 'r_parent_care'],
    choices: [
      {
        id: 'ended',
        label: '終わっているか、大きく変わっていると思う',
        situationScores: { r_partner_divorce: 2, r_friend_isolation: 1 },
        jungHints: { Ni: 1 },
        tags: ['anticipating_end'],
      },
      {
        id: 'worse',
        label: 'このままだと悪くなっていると思う',
        situationScores: { r_parent_care: 2, r_partner_drift: 1 },
        biasHints: { B1: 1 },
        demographicHints: { age_50s: 1, age_60s: 1 },
        tags: ['anticipating_worse'],
      },
      {
        id: 'same',
        label: '何も変わらず、このまま続くと思う。それが怖い',
        situationScores: { r_friend_isolation: 2, r_partner_drift: 1 },
        biasHints: { B6: 2 },
        tags: ['fear_of_stagnation'],
      },
    ],
  },
];
