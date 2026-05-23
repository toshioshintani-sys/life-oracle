// 仕事ドメイン質問
// 原則：行動場面のみ。「〜と思いますか」禁止。答えが結論を予告しない。

export const WORK_QUESTIONS = [

  // ── 入口 ────────────────────────────────────────────────────────
  {
    id: 'w_entry_001',
    startFor: 'work_stress',
    type: 'entry',
    text: '最近、仕事の帰り道の気分はどちらに近いですか？',
    discriminates: ['w_work_overload', 'w_boss_power', 'w_work_empty', 'w_career_change'],
    choices: [
      {
        id: 'exhausted',
        label: '消耗した。疲れた、ではなく消えた感じ',
        situationScores: { w_work_overload: 2, w_boss_power: 1 },
        biasHints: { B8: 1 },
        jungHints: { Si: 1 },
        tags: ['exhaustion'],
      },
      {
        id: 'empty',
        label: '何も感じない。無感覚に帰っている',
        situationScores: { w_work_empty: 2, w_career_change: 1 },
        biasHints: { B6: 1 },
        jungHints: { Ni: 1 },
        tags: ['numbness'],
      },
      {
        id: 'tense',
        label: 'ほっとする。あの場から離れられた安堵',
        situationScores: { w_boss_power: 2, w_col_isolation: 1 },
        biasHints: { B1: 1 },
        jungHints: { Fe: 1 },
        tags: ['relief_escape'],
      },
    ],
  },

  // ── 上司 vs 同僚 vs 仕事内容 vs キャリアの識別 ──────────────────
  {
    id: 'w_source_001',
    type: 'probe',
    text: '職場で一番エネルギーを奪われているのは、どの場面ですか？',
    discriminates: ['w_boss_power', 'w_boss_unfair', 'w_col_isolation', 'w_work_overload', 'w_work_empty'],
    choices: [
      {
        id: 'specific_person',
        label: '特定の人と関わる時間',
        situationScores: { w_boss_power: 2, w_col_rivalry: 1 },
        jungHints: { Fe: 1 },
        tags: ['person_drain'],
      },
      {
        id: 'evaluation',
        label: '頑張っても報われない、評価される気がしない',
        situationScores: { w_boss_unfair: 2, w_career_stuck: 1 },
        biasHints: { B3: 1 },
        jungHints: { Te: 1 },
        tags: ['unfair_eval'],
      },
      {
        id: 'work_itself',
        label: 'この仕事を続けることへの意味が見えない',
        situationScores: { w_work_empty: 2, w_career_change: 1 },
        biasHints: { B8: 1 },
        jungHints: { Fi: 1 },
        tags: ['meaninglessness'],
      },
      {
        id: 'volume',
        label: '仕事量そのもの。終わりが見えない',
        situationScores: { w_work_overload: 3 },
        biasHints: { B4: 1 },
        jungHints: { Si: 1 },
        tags: ['overload'],
      },
    ],
  },

  {
    id: 'w_boss_001',
    type: 'probe',
    text: '上司から何か言われた後、どうなることが多いですか？',
    discriminates: ['w_boss_power', 'w_boss_unfair', 'w_boss_values'],
    choices: [
      {
        id: 'shrink',
        label: '委縮する。次の言葉を選ぶのに神経を使う',
        situationScores: { w_boss_power: 3 },
        biasHints: { B1: 2 },
        jungHints: { Fe: 2 },
        tags: ['intimidation'],
      },
      {
        id: 'frustration',
        label: '腑に落ちない。なぜそういう評価になるか分からない',
        situationScores: { w_boss_unfair: 3 },
        biasHints: { B3: 1 },
        jungHints: { Ti: 1 },
        tags: ['unfair'],
      },
      {
        id: 'direction_gap',
        label: 'やり方が自分の考えと違う。でも言えない',
        situationScores: { w_boss_values: 3 },
        biasHints: { B4: 2 },
        jungHints: { Te: 1 },
        tags: ['values_gap'],
      },
      {
        id: 'not_boss',
        label: '上司とのやり取りはそれほど問題じゃない',
        situationScores: { w_boss_power: -3, w_boss_unfair: -3 },
        tags: [],
      },
    ],
  },

  {
    id: 'w_career_001',
    type: 'probe',
    text: '1年後の自分の姿を、この会社の中で思い描けますか？',
    discriminates: ['w_career_change', 'w_career_stuck', 'w_career_indep', 'w_work_empty'],
    choices: [
      {
        id: 'cant_see',
        label: '思い描けない。想像しようとすると気が重い',
        situationScores: { w_career_change: 2, w_work_empty: 2 },
        biasHints: { B6: 1 },
        jungHints: { Ni: 1 },
        tags: ['no_future'],
      },
      {
        id: 'same_place',
        label: '同じ場所にいる気がする。それが嫌だ',
        situationScores: { w_career_stuck: 3 },
        biasHints: { B8: 1 },
        tags: ['stagnation'],
      },
      {
        id: 'different_path',
        label: '会社の外で動いている自分の方が見える',
        situationScores: { w_career_indep: 2, w_career_change: 1 },
        jungHints: { Ne: 2 },
        tags: ['outside_vision'],
      },
      {
        id: 'can_see',
        label: '一応見える。ただ、それが自分の望む姿かは分からない',
        situationScores: { w_work_empty: 1, w_career_stuck: 1 },
        tags: ['uncertain_future'],
      },
    ],
  },

  {
    id: 'w_recognition_001',
    type: 'probe',
    text: '今の職場で、最後に「やってよかった」と思ったのはいつですか？',
    discriminates: ['w_work_empty', 'w_boss_unfair', 'w_career_change', 'w_work_overload'],
    choices: [
      {
        id: 'cant_remember',
        label: '思い出せない。かなり前かもしれない',
        situationScores: { w_work_empty: 2, w_career_change: 1 },
        biasHints: { B8: 1 },
        tags: ['no_satisfaction'],
      },
      {
        id: 'work_itself_yes',
        label: '最近もある。でも誰にも気づかれない',
        situationScores: { w_boss_unfair: 2, w_career_stuck: 1 },
        biasHints: { B3: 1 },
        jungHints: { Fi: 1 },
        tags: ['invisible_effort'],
      },
      {
        id: 'not_work_people',
        label: '仕事の内容より、誰かに感謝された瞬間くらいしかない',
        situationScores: { w_work_empty: 1, w_col_isolation: 1 },
        jungHints: { Fe: 1 },
        tags: ['people_only'],
      },
      {
        id: 'recent_yes',
        label: '最近もある。ただ、疲れで帳消しになっている',
        situationScores: { w_work_overload: 2 },
        tags: ['overload_kills_joy'],
      },
    ],
  },

  {
    id: 'w_escape_001',
    type: 'probe',
    text: '転職サイトや求人を、最近見ましたか？',
    discriminates: ['w_career_change', 'w_career_stuck', 'w_work_empty', 'w_boss_power'],
    choices: [
      {
        id: 'actively',
        label: 'はい。定期的に見ている',
        situationScores: { w_career_change: 4 },
        biasHints: { B6: -1 },
        tags: ['job_searching'],
      },
      {
        id: 'sometimes',
        label: 'たまに。気になった時だけ',
        situationScores: { w_career_change: 2, w_career_stuck: 1 },
        tags: ['passive_searching'],
      },
      {
        id: 'not_yet',
        label: 'まだ見ていない。でも頭にはある',
        situationScores: { w_career_change: 1, w_work_empty: 1 },
        biasHints: { B6: 2 },
        tags: ['considering_not_acting'],
      },
      {
        id: 'no',
        label: '見ていない。転職は今のところ考えていない',
        situationScores: { w_career_change: -3 },
        tags: [],
      },
    ],
  },

  {
    id: 'w_colleague_001',
    type: 'probe',
    text: '職場で、気軽に話せる人はいますか？',
    discriminates: ['w_col_isolation', 'w_col_rivalry', 'w_boss_power'],
    choices: [
      {
        id: 'no_one',
        label: 'いない。孤立している感覚がある',
        situationScores: { w_col_isolation: 4 },
        biasHints: { B1: 1 },
        jungHints: { Fi: 1 },
        tags: ['isolation'],
      },
      {
        id: 'few',
        label: '一人か二人いる。でも全体的に息が詰まる',
        situationScores: { w_col_rivalry: 2, w_boss_power: 1 },
        tags: ['partial_connection'],
      },
      {
        id: 'yes_but',
        label: 'いる。ただ、本音は話せない',
        situationScores: { w_boss_values: 1, w_work_empty: 1 },
        jungHints: { Fi: 1 },
        tags: ['surface_only'],
      },
      {
        id: 'yes',
        label: '何人かいる。人間関係は比較的大丈夫',
        situationScores: { w_col_isolation: -3, w_boss_power: -2 },
        tags: [],
      },
    ],
  },

  {
    id: 'w_morning_001',
    type: 'probe',
    text: '月曜の朝、目が覚めた瞬間の感覚はどちらに近いですか？',
    discriminates: ['w_boss_power', 'w_work_overload', 'w_work_empty', 'w_career_change'],
    choices: [
      {
        id: 'dread',
        label: '今日も行かないといけないという重さが来る',
        situationScores: { w_boss_power: 2, w_work_overload: 1 },
        biasHints: { B1: 1 },
        jungHints: { Si: 1 },
        tags: ['monday_dread'],
      },
      {
        id: 'empty_monday',
        label: '特に感情がない。ただ起きるだけ',
        situationScores: { w_work_empty: 3 },
        biasHints: { B8: 1 },
        tags: ['emotional_numbness'],
      },
      {
        id: 'list',
        label: '今日やることが頭を回り始める。止まらない',
        situationScores: { w_work_overload: 3 },
        jungHints: { Te: 1 },
        tags: ['overload_mindrace'],
      },
      {
        id: 'okay',
        label: 'まあ、動ける。特別嫌ではない',
        situationScores: { w_boss_power: -2, w_work_empty: -2 },
        tags: [],
      },
    ],
  },

  {
    id: 'w_effort_001',
    type: 'probe',
    text: '今の仕事で努力しても、それが報われると感じていますか？',
    discriminates: ['w_boss_unfair', 'w_career_stuck', 'w_work_empty', 'w_boss_values'],
    choices: [
      {
        id: 'not_seen',
        label: '努力は見えていない。評価に反映されない',
        situationScores: { w_boss_unfair: 3, w_career_stuck: 1 },
        biasHints: { B3: 2 },
        jungHints: { Te: 1 },
        tags: ['effort_invisible'],
      },
      {
        id: 'wrong_direction',
        label: '評価される努力の方向が、自分のやりたいこととズレている',
        situationScores: { w_boss_values: 2, w_work_empty: 2 },
        jungHints: { Fi: 2 },
        tags: ['direction_mismatch'],
      },
      {
        id: 'ceiling',
        label: '頑張っても、ここでの上限が見えてきた',
        situationScores: { w_career_stuck: 3, w_career_change: 1 },
        biasHints: { B8: 1 },
        tags: ['ceiling_hit'],
      },
      {
        id: 'yes_rewarded',
        label: '一応報われている。ただ続けるモチベーションが薄い',
        situationScores: { w_work_empty: 2 },
        tags: ['rewarded_but_empty'],
      },
    ],
  },

  {
    id: 'w_decision_001',
    type: 'probe',
    text: '今の仕事を辞める理由があるとしたら、何が一番近いですか？',
    discriminates: ['w_boss_power', 'w_boss_unfair', 'w_work_empty', 'w_career_change', 'w_career_indep'],
    choices: [
      {
        id: 'run_from',
        label: 'あの人から離れたい。あの環境から逃げたい',
        situationScores: { w_boss_power: 3, w_col_isolation: 1 },
        biasHints: { B1: 2 },
        tags: ['escape_person'],
      },
      {
        id: 'go_toward',
        label: '別にやりたいことがある。そっちに向かいたい',
        situationScores: { w_career_indep: 2, w_career_change: 2 },
        jungHints: { Ne: 2, Ni: 1 },
        tags: ['toward_goal'],
      },
      {
        id: 'no_growth',
        label: 'ここではこれ以上成長できない',
        situationScores: { w_career_stuck: 2, w_career_change: 1 },
        jungHints: { Te: 1 },
        tags: ['no_growth'],
      },
      {
        id: 'wrong_place',
        label: 'そもそもこの仕事が自分に向いていない気がする',
        situationScores: { w_work_empty: 3 },
        jungHints: { Fi: 2 },
        tags: ['wrong_fit'],
      },
    ],
  },

  // ── 深掘り：キャリア系の識別 ────────────────────────────────────
  {
    id: 'w_career_history_001',
    type: 'probe',
    text: '今の会社に入る前、どんな気持ちで入りましたか？',
    discriminates: ['w_career_change', 'w_career_stuck', 'w_boss_values'],
    choices: [
      {
        id: 'high_hope',
        label: 'かなり期待していた。ここで頑張ろうと思っていた',
        situationScores: { w_boss_unfair: 1, w_career_stuck: 1 },
        biasHints: { B5: 1 },
        tags: ['high_entry_expectation'],
      },
      {
        id: 'just_job',
        label: '特にこだわりはなかった。選べる中で選んだ',
        situationScores: { w_work_empty: 1 },
        tags: ['neutral_entry'],
      },
      {
        id: 'compromise',
        label: '本当はもっと違うところに行きたかった',
        situationScores: { w_career_change: 2, w_work_empty: 1 },
        biasHints: { B8: 2 },
        jungHints: { Ni: 1 },
        tags: ['compromise_entry'],
      },
    ],
  },

  {
    id: 'w_transfer_count_001',
    type: 'probe',
    text: '転職は今まで何回しましたか？',
    discriminates: ['w_career_change', 'w_career_indep'],
    choices: [
      {
        id: 'first',
        label: 'これが初めて（今の会社が最初）',
        situationScores: { w_career_change: 1 },
        tags: ['first_job'],
      },
      {
        id: 'once',
        label: '1回ある',
        situationScores: { w_career_change: 1 },
        tags: ['one_change'],
      },
      {
        id: 'multiple',
        label: '2〜3回ある',
        situationScores: { w_career_change: 2 },
        biasHints: { B2: 1 },
        tags: ['multiple_changes'],
      },
      {
        id: 'many',
        label: '4回以上ある',
        situationScores: { w_career_change: 1, w_career_indep: 1 },
        biasHints: { B2: 2 },
        tags: ['serial_changer'],
      },
    ],
  },

  {
    id: 'w_indep_001',
    type: 'probe',
    text: '「会社を辞めて独立する」という選択肢が、頭に浮かんだことはありますか？',
    discriminates: ['w_career_indep', 'w_career_change'],
    choices: [
      {
        id: 'seriously',
        label: 'ある。かなり具体的に考えたことがある',
        situationScores: { w_career_indep: 4 },
        jungHints: { Ne: 2, Te: 1 },
        tags: ['indep_serious'],
      },
      {
        id: 'fantasy',
        label: 'ある。ただ「いつか」くらいの漠然とした話',
        situationScores: { w_career_indep: 2, w_career_change: 1 },
        biasHints: { B6: 1 },
        tags: ['indep_vague'],
      },
      {
        id: 'no',
        label: 'あまりない。会社員が自分には合っていると思う',
        situationScores: { w_career_indep: -3 },
        tags: [],
      },
    ],
  },

  // ── 深掘り：上司パターンの識別 ──────────────────────────────────
  {
    id: 'w_power_body_001',
    type: 'probe',
    text: '上司や先輩の前に立つ時、体に変化はありますか？',
    discriminates: ['w_boss_power', 'w_col_isolation'],
    choices: [
      {
        id: 'tense_body',
        label: '肩が上がる、声が小さくなる、頭が真っ白になる',
        situationScores: { w_boss_power: 4 },
        biasHints: { B1: 2 },
        jungHints: { Fe: 2 },
        tags: ['physical_intimidation'],
      },
      {
        id: 'careful_words',
        label: '言葉を選ぶのに時間がかかる。終わった後にどっと疲れる',
        situationScores: { w_boss_power: 2, w_boss_values: 1 },
        jungHints: { Fe: 1, Ti: 1 },
        tags: ['emotional_labor'],
      },
      {
        id: 'no_change',
        label: '特に変化はない',
        situationScores: { w_boss_power: -3 },
        tags: [],
      },
    ],
  },

  {
    id: 'w_mistake_001',
    type: 'probe',
    text: '職場でミスをした時、一番気になるのは何ですか？',
    discriminates: ['w_boss_power', 'w_boss_unfair', 'w_col_isolation'],
    choices: [
      {
        id: 'boss_reaction',
        label: '上司の顔色。どう言われるか',
        situationScores: { w_boss_power: 3 },
        biasHints: { B1: 2 },
        jungHints: { Fe: 2 },
        tags: ['boss_fear'],
      },
      {
        id: 'reputation',
        label: '評価が下がること。積み上げてきたものが崩れる',
        situationScores: { w_boss_unfair: 2, w_career_stuck: 1 },
        biasHints: { B8: 2 },
        jungHints: { Te: 1 },
        tags: ['reputation_loss'],
      },
      {
        id: 'colleague_eye',
        label: '周りの目。あの人にどう思われたか',
        situationScores: { w_col_isolation: 2, w_col_rivalry: 1 },
        biasHints: { B4: 1 },
        jungHints: { Fe: 1 },
        tags: ['peer_judgment'],
      },
      {
        id: 'recovery',
        label: 'どう立て直すか。原因と対策の方が気になる',
        situationScores: { w_boss_power: -2 },
        jungHints: { Te: 2 },
        tags: ['solution_focus'],
      },
    ],
  },

  // ── 深掘り：やりがい・意味系の識別 ────────────────────────────────
  {
    id: 'w_meaning_001',
    type: 'probe',
    text: '仕事をしていて「これは自分がやる必要があること」と思える瞬間がありますか？',
    discriminates: ['w_work_empty', 'w_career_indep', 'w_work_overload'],
    choices: [
      {
        id: 'never',
        label: 'ない。誰がやっても同じだと思っている',
        situationScores: { w_work_empty: 3 },
        biasHints: { B6: 1 },
        jungHints: { Ni: 1 },
        tags: ['replaceable_feeling'],
      },
      {
        id: 'rarely',
        label: 'あるにはある。ただその感覚がどんどん薄れている',
        situationScores: { w_work_empty: 2, w_career_change: 1 },
        biasHints: { B8: 1 },
        tags: ['fading_meaning'],
      },
      {
        id: 'yes_but_lost',
        label: 'かつてはあった。今は疲れてそれを感じる余裕がない',
        situationScores: { w_work_overload: 2 },
        tags: ['meaning_buried'],
      },
      {
        id: 'yes',
        label: 'ある。そこだけが今の職場での支えになっている',
        situationScores: { w_work_empty: -3 },
        tags: ['meaning_found'],
      },
    ],
  },

  {
    id: 'w_overload_001',
    type: 'probe',
    text: '仕事量について、どれが一番近いですか？',
    discriminates: ['w_work_overload', 'w_boss_unfair', 'w_col_rivalry'],
    choices: [
      {
        id: 'too_much',
        label: '明らかに多い。体が限界に来ていると感じる',
        situationScores: { w_work_overload: 4 },
        biasHints: { B8: 1, B4: 1 },
        tags: ['physical_limit'],
      },
      {
        id: 'pushed',
        label: '断れなくて増えた。自分だけが引き受けている',
        situationScores: { w_work_overload: 2, w_col_rivalry: 1 },
        biasHints: { B4: 2 },
        jungHints: { Fe: 2 },
        tags: ['cant_refuse'],
      },
      {
        id: 'recognition',
        label: '量より、やっても評価されないことの方がきつい',
        situationScores: { w_boss_unfair: 2, w_work_overload: 1 },
        biasHints: { B3: 1 },
        tags: ['effort_unrecognized'],
      },
      {
        id: 'manageable',
        label: '量自体はそれほど問題ではない',
        situationScores: { w_work_overload: -3 },
        tags: [],
      },
    ],
  },

  // ── クロスカット：深層を拾う質問 ───────────────────────────────────
  {
    id: 'w_cross_001',
    type: 'probe',
    text: '今の職場に来る前の自分と比べて、変わったと感じることはありますか？',
    discriminates: ['w_boss_power', 'w_work_empty', 'w_career_change', 'w_work_overload'],
    choices: [
      {
        id: 'lost_voice',
        label: '言いたいことを言えなくなった',
        situationScores: { w_boss_power: 2, w_col_isolation: 1 },
        biasHints: { B4: 2 },
        jungHints: { Fe: 1, Fi: -1 },
        tags: ['lost_assertiveness'],
      },
      {
        id: 'lost_interest',
        label: '仕事以外のことへの興味が薄れた',
        situationScores: { w_work_overload: 2, w_work_empty: 1 },
        biasHints: { B8: 1 },
        tags: ['life_narrowing'],
      },
      {
        id: 'lost_ambition',
        label: '将来への期待や野心が消えた',
        situationScores: { w_work_empty: 2, w_career_stuck: 1 },
        jungHints: { Ni: -1 },
        tags: ['lost_ambition'],
      },
      {
        id: 'not_changed',
        label: '特に大きくは変わっていない',
        situationScores: {},
        tags: [],
      },
    ],
  },

  {
    id: 'w_cross_002',
    type: 'probe',
    text: '友人や家族に、今の職場の話をしますか？',
    discriminates: ['w_boss_power', 'w_col_isolation', 'w_work_empty'],
    choices: [
      {
        id: 'hide',
        label: '話さない。話すと心配されるから',
        situationScores: { w_boss_power: 2, w_work_overload: 1 },
        biasHints: { B4: 1 },
        jungHints: { Fe: 1 },
        tags: ['hiding_truth'],
      },
      {
        id: 'cant_explain',
        label: '話そうとするが、うまく説明できない。理解されない',
        situationScores: { w_work_empty: 2, w_boss_values: 1 },
        jungHints: { Fi: 1 },
        tags: ['inexpressible'],
      },
      {
        id: 'vent',
        label: 'たまに愚痴る。でもすっきりしない',
        situationScores: { w_boss_power: 1, w_col_rivalry: 1 },
        tags: ['venting'],
      },
      {
        id: 'talk',
        label: '普通に話す。深刻なことにはなっていない',
        situationScores: { w_boss_power: -2, w_work_empty: -2 },
        tags: [],
      },
    ],
  },

  {
    id: 'w_cross_003',
    type: 'probe',
    text: '「もし明日から別の仕事ができる」として、それが今と全く違う仕事だった場合、どう感じますか？',
    discriminates: ['w_career_change', 'w_career_indep', 'w_work_empty'],
    choices: [
      {
        id: 'relief',
        label: 'ほっとする。今すぐでもいい',
        situationScores: { w_career_change: 3, w_work_empty: 1 },
        biasHints: { B1: 1 },
        tags: ['escape_desire'],
      },
      {
        id: 'excited',
        label: 'ワクワクする。やってみたいことがある',
        situationScores: { w_career_indep: 2, w_career_change: 1 },
        jungHints: { Ne: 2 },
        tags: ['open_to_change'],
      },
      {
        id: 'anxious',
        label: '不安が先に来る。今のキャリアが無駄になる気がする',
        situationScores: { w_career_stuck: 1 },
        biasHints: { B8: 2, B1: 2 },
        jungHints: { Si: 1 },
        tags: ['sunk_cost_fear'],
      },
      {
        id: 'no_need',
        label: '仕事の種類より、今の職場環境が変わればいい',
        situationScores: { w_boss_power: 1, w_boss_unfair: 1, w_col_isolation: 1 },
        tags: ['env_change_needed'],
      },
    ],
  },
];
