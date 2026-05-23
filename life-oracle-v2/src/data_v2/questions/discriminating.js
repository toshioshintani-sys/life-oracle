// 切り分け質問（discriminating questions）
// 上位2候補のスコア差が小さい時に優先して出す
// pair: 切り分けたい2状況のキー
// 各選択肢の reasonText → result画面の「私はこう読みました」に使う

export const DISCRIMINATING_QUESTIONS = [

  // ── Pair 1: 上司パワハラ vs 評価不満 ────────────────────────────────
  {
    id: 'disc_001',
    type: 'discriminating',
    pair: ['w_boss_power', 'w_boss_unfair'],
    text: 'つらさの中心は、どちらに近いですか？',
    discriminates: ['w_boss_power', 'w_boss_unfair'],
    choices: [
      {
        id: 'disc_001_a',
        label: 'その人の言動・雰囲気が、体に直接来る',
        situationScores: { w_boss_power: 3, w_boss_unfair: -3 },
        reasonText: 'その場にいること自体が苦痛——これは評価の問題より、相手の言動への身体反応が主軸にある。',
      },
      {
        id: 'disc_001_b',
        label: '努力や実力が、正当に扱われていない',
        situationScores: { w_boss_unfair: 3, w_boss_power: -3 },
        reasonText: '理不尽さへの怒り——相手が怖いのではなく、正当に扱われていないことへの反応が中心にある。',
      },
      {
        id: 'disc_001_c',
        label: 'どちらも同じくらい重い',
        situationScores: { w_boss_power: 1, w_boss_unfair: 1 },
        reasonText: null,
      },
    ],
  },

  // ── Pair 2: 仕事量 vs 燃え尽き ──────────────────────────────────────
  {
    id: 'disc_002',
    type: 'discriminating',
    pair: ['w_work_overload', 's_burnout'],
    text: '疲れ方に近いのは、どちらですか？',
    discriminates: ['w_work_overload', 's_burnout'],
    choices: [
      {
        id: 'disc_002_a',
        label: 'こなすべきことが多すぎる。具体的なタスクに追われている',
        situationScores: { w_work_overload: 3, s_burnout: -2 },
        reasonText: 'タスクが問題——疲れの原因がまだ具体的に見えている。戦えている状態と見ました。',
      },
      {
        id: 'disc_002_b',
        label: 'やることの量より、何もやる気が起きない。体が動かない',
        situationScores: { s_burnout: 3, w_work_overload: -2 },
        reasonText: '動けない——これは量の問題ではない。何かが根本から枯れているサインを見ました。',
      },
      {
        id: 'disc_002_c',
        label: '量もあるし、気力もない。両方が重なっている',
        situationScores: { w_work_overload: 1, s_burnout: 2 },
        reasonText: null,
      },
    ],
  },

  // ── Pair 3: 転職 vs 独立 ────────────────────────────────────────────
  {
    id: 'disc_003',
    type: 'discriminating',
    pair: ['w_career_change', 'w_career_indep'],
    text: '「今を変える」としたら、どちらのイメージが先に来ますか？',
    discriminates: ['w_career_change', 'w_career_indep'],
    choices: [
      {
        id: 'disc_003_a',
        label: '別の会社・職種・環境へ移る',
        situationScores: { w_career_change: 3, w_career_indep: -3 },
        reasonText: '環境を変えたい——これはまだ「組織の中でやり直す」という選択肢です。',
      },
      {
        id: 'disc_003_b',
        label: '自分でやる。組織の外に出る',
        situationScores: { w_career_indep: 3, w_career_change: -3 },
        reasonText: '構造を変えたい——環境ではなく、「誰かの下で働く」という形そのものを変えようとしている。',
      },
      {
        id: 'disc_003_c',
        label: 'まだどちらも具体的ではない',
        situationScores: { w_career_change: 1, w_career_indep: 1 },
        reasonText: null,
      },
    ],
  },

  // ── Pair 4: キャリアの頭打ち vs やりがい喪失 ─────────────────────────
  {
    id: 'disc_004',
    type: 'discriminating',
    pair: ['w_career_stuck', 'w_work_empty'],
    text: '今の仕事を続けるのがしんどい理由は、どちらに近いですか？',
    discriminates: ['w_career_stuck', 'w_work_empty'],
    choices: [
      {
        id: 'disc_004_a',
        label: '頑張っても上に行けない。天井が見えている',
        situationScores: { w_career_stuck: 3, w_work_empty: -2 },
        reasonText: '天井が見えている——上に行きたいという意欲はまだある。行き先が塞がれているだけ。',
      },
      {
        id: 'disc_004_b',
        label: '上に行きたいかどうかすら、分からなくなった',
        situationScores: { w_work_empty: 3, w_career_stuck: -2 },
        reasonText: '意欲より先に意味が消えている——これは成長の壁ではなく、仕事そのものへの問いが来ている。',
      },
      {
        id: 'disc_004_c',
        label: '天井もあるし、やりがいもない。どちらも来ている',
        situationScores: { w_career_stuck: 1, w_work_empty: 2 },
        reasonText: null,
      },
    ],
  },

  // ── Pair 5: パートナーとの距離感 vs 別れへの迷い ─────────────────────
  {
    id: 'disc_005',
    type: 'discriminating',
    pair: ['r_partner_drift', 'r_partner_divorce'],
    text: 'パートナーとの関係に、今どちらの気持ちが強いですか？',
    discriminates: ['r_partner_drift', 'r_partner_divorce'],
    choices: [
      {
        id: 'disc_005_a',
        label: '関係は続けたい。ただ、今の状態を変えたい',
        situationScores: { r_partner_drift: 3, r_partner_divorce: -2 },
        reasonText: '続けたいという意志がある——これは「距離が縮まれば解決する」という問題の形を見ています。',
      },
      {
        id: 'disc_005_b',
        label: 'このまま続けることへの疑問が、頭の中にある',
        situationScores: { r_partner_divorce: 3, r_partner_drift: -2 },
        reasonText: '終わりを考えている——これは単なる距離感の問題では収まらない段階にある。',
      },
      {
        id: 'disc_005_c',
        label: '続けたい気持ちも、終わらせたい気持ちも、両方ある',
        situationScores: { r_partner_drift: 1, r_partner_divorce: 2 },
        reasonText: null,
      },
    ],
  },

  // ── Pair 6: 親からのプレッシャー vs 親の介護 ─────────────────────────
  {
    id: 'disc_006',
    type: 'discriminating',
    pair: ['r_parent_pressure', 'r_parent_care'],
    text: '親のことで、今一番エネルギーを使っているのはどちらですか？',
    discriminates: ['r_parent_pressure', 'r_parent_care'],
    choices: [
      {
        id: 'disc_006_a',
        label: '親の言葉・期待・干渉への対応',
        situationScores: { r_parent_pressure: 3, r_parent_care: -2 },
        reasonText: '関係性の重さ——これは「何を言われるか」「どう思われるか」への消耗が中心にある。',
      },
      {
        id: 'disc_006_b',
        label: '親の体・生活・世話への対応',
        situationScores: { r_parent_care: 3, r_parent_pressure: -2 },
        reasonText: '物理的な負担——これは時間・体力・お金という現実の消耗が中心にある。',
      },
      {
        id: 'disc_006_c',
        label: 'どちらも重なっている',
        situationScores: { r_parent_pressure: 1, r_parent_care: 1 },
        reasonText: null,
      },
    ],
  },

  // ── Pair 7: 友人関係での孤立 vs 自己肯定感 ──────────────────────────
  {
    id: 'disc_007',
    type: 'discriminating',
    pair: ['r_friend_isolation', 's_self_esteem'],
    text: '孤立している感覚があるとしたら、その中心はどちらに近いですか？',
    discriminates: ['r_friend_isolation', 's_self_esteem'],
    choices: [
      {
        id: 'disc_007_a',
        label: '周りとのつながりが、そもそも少ない',
        situationScores: { r_friend_isolation: 3, s_self_esteem: -1 },
        reasonText: '環境の問題——つながりの機会が足りていない。外側に原因がある。',
      },
      {
        id: 'disc_007_b',
        label: 'つながりはある。でも自分だけがどこかズレている気がする',
        situationScores: { s_self_esteem: 2, r_friend_isolation: -1 },
        reasonText: '内側の問題——孤立というより、自分への評価が低いことが先にある。',
      },
      {
        id: 'disc_007_c',
        label: 'つながりも少ないし、自分への自信もない。両方来ている',
        situationScores: { r_friend_isolation: 1, s_self_esteem: 2 },
        reasonText: null,
      },
    ],
  },

  // ── Pair 8: 自己肯定感 vs 感情コントロール ──────────────────────────
  {
    id: 'disc_008',
    type: 'discriminating',
    pair: ['s_self_esteem', 's_emotion_control'],
    text: '自分自身でいちばん困っているのは、どちらですか？',
    discriminates: ['s_self_esteem', 's_emotion_control'],
    choices: [
      {
        id: 'disc_008_a',
        label: '自分への評価が低い。「どうせ」「無理」が先に来る',
        situationScores: { s_self_esteem: 3, s_emotion_control: -2 },
        reasonText: '自己評価が主軸——感情の波より先に、「自分はダメだ」という声が来ている。',
      },
      {
        id: 'disc_008_b',
        label: '感情の波が激しく、自分でもコントロールできない',
        situationScores: { s_emotion_control: 3, s_self_esteem: -2 },
        reasonText: '感情の制御が主軸——自信の問題より、感情そのものの扱い方が難しくなっている。',
      },
      {
        id: 'disc_008_c',
        label: '自信がないから感情も不安定。両方つながっている',
        situationScores: { s_self_esteem: 2, s_emotion_control: 1 },
        reasonText: null,
      },
    ],
  },

  // ── Pair 9: 燃え尽き vs 方向性が見えない ────────────────────────────
  {
    id: 'disc_009',
    type: 'discriminating',
    pair: ['s_burnout', 's_no_direction'],
    text: '今の状態に近いのはどちらですか？',
    discriminates: ['s_burnout', 's_no_direction'],
    choices: [
      {
        id: 'disc_009_a',
        label: '何もやる気が起きない。疲れ切って、動けない',
        situationScores: { s_burnout: 3, s_no_direction: -2 },
        reasonText: '動けない——エネルギーが枯れている。これは燃え尽きのサインと見ました。',
      },
      {
        id: 'disc_009_b',
        label: '動く意欲はある。でもどこに向かえばいいか分からない',
        situationScores: { s_no_direction: 3, s_burnout: -2 },
        reasonText: '火はある——疲れているのではなく、行き先が見えていない。これはまだ動ける状態です。',
      },
      {
        id: 'disc_009_c',
        label: '疲れてもいるし、方向も見えない。どちらもある',
        situationScores: { s_burnout: 2, s_no_direction: 2 },
        reasonText: null,
      },
    ],
  },

  // ── Pair 10: 職場孤立 vs 友人関係の孤立 ────────────────────────────
  {
    id: 'disc_010',
    type: 'discriminating',
    pair: ['w_col_isolation', 'r_friend_isolation'],
    text: '孤立している感覚があるとしたら、どちらで強いですか？',
    discriminates: ['w_col_isolation', 'r_friend_isolation'],
    choices: [
      {
        id: 'disc_010_a',
        label: '職場・仕事の場での人間関係',
        situationScores: { w_col_isolation: 3, r_friend_isolation: -2 },
        reasonText: '職場での孤立——今いる場所の問題が中心にある。',
      },
      {
        id: 'disc_010_b',
        label: 'プライベートや友人関係の場',
        situationScores: { r_friend_isolation: 3, w_col_isolation: -2 },
        reasonText: 'プライベートでの孤立——仕事の外で、つながりが薄くなっている。',
      },
      {
        id: 'disc_010_c',
        label: 'どちらでも同じように感じる',
        situationScores: { w_col_isolation: 1, r_friend_isolation: 1 },
        reasonText: null,
      },
    ],
  },

  // ── Pair 11: キャリアの決断 vs 人生の転換点 ─────────────────────────
  {
    id: 'disc_011',
    type: 'discriminating',
    pair: ['f_job_decision', 'f_life_change'],
    text: '今の「迷い」に近いのはどちらですか？',
    discriminates: ['f_job_decision', 'f_life_change'],
    choices: [
      {
        id: 'disc_011_a',
        label: '転職・独立など、仕事上の具体的な選択肢があって決められない',
        situationScores: { f_job_decision: 3, f_life_change: -2 },
        reasonText: '選択肢は具体的にある——これは「何を選ぶか」の問いであって、人生全体の問いではない。',
      },
      {
        id: 'disc_011_b',
        label: '仕事というより、もっと大きく「このままでいいのか」という感覚',
        situationScores: { f_life_change: 3, f_job_decision: -2 },
        reasonText: '転換点——これは仕事の問題だけではなく、人生のフェーズが変わろうとしているサインと見ました。',
      },
      {
        id: 'disc_011_c',
        label: '仕事の選択肢も、人生全体への疑問も、両方ある',
        situationScores: { f_job_decision: 1, f_life_change: 2 },
        reasonText: null,
      },
    ],
  },

  // ── Pair 12: 自立への迷い vs 人生の転換点 ───────────────────────────
  {
    id: 'disc_012',
    type: 'discriminating',
    pair: ['f_independence', 'f_life_change'],
    text: '今の状態に近いのはどちらですか？',
    discriminates: ['f_independence', 'f_life_change'],
    choices: [
      {
        id: 'disc_012_a',
        label: '「自分だけでやっていけるか」という不安が先にある',
        situationScores: { f_independence: 3, f_life_change: -2 },
        reasonText: '能力への問い——転換への感覚より先に、「一人でやれるか」という自己への疑問が来ている。',
      },
      {
        id: 'disc_012_b',
        label: '「このままでいいのか」という感覚が先にある',
        situationScores: { f_life_change: 3, f_independence: -2 },
        reasonText: '転換点——自立の不安より先に、今の状態への疑問が来ている。人生のフェーズの問いと見ました。',
      },
      {
        id: 'disc_012_c',
        label: '自立の不安も、人生全体への問いも、両方ある',
        situationScores: { f_independence: 2, f_life_change: 1 },
        reasonText: null,
      },
    ],
  },

  // ── Pair 13: 上司の方針不一致 vs パワハラ ────────────────────────────
  {
    id: 'disc_013',
    type: 'discriminating',
    pair: ['w_boss_values', 'w_boss_power'],
    text: '上司との関係で、今一番消耗しているのはどちらですか？',
    discriminates: ['w_boss_values', 'w_boss_power'],
    choices: [
      {
        id: 'disc_013_a',
        label: 'やり方や方向性が合わない。「なぜこうするのか」が腑に落ちない',
        situationScores: { w_boss_values: 3, w_boss_power: -2 },
        reasonText: '方針への違和感——これは「人が怖い」ではなく「この組織の向かう先を信じられない」という問題と見ました。',
      },
      {
        id: 'disc_013_b',
        label: 'その人の言動そのものが精神的に重い。存在が圧力になっている',
        situationScores: { w_boss_power: 3, w_boss_values: -2 },
        reasonText: '人そのものの問題——方針より先に、その人との関係が消耗の中心にある。',
      },
      {
        id: 'disc_013_c',
        label: '方針も合わないし、その人自体も重い。両方来ている',
        situationScores: { w_boss_values: 1, w_boss_power: 1 },
        reasonText: null,
      },
    ],
  },

  // ── Pair 14: 職場での孤立 vs 同僚との摩擦 ───────────────────────────
  {
    id: 'disc_014',
    type: 'discriminating',
    pair: ['w_col_isolation', 'w_col_rivalry'],
    text: '職場の人間関係でつらいのは、どちらに近いですか？',
    discriminates: ['w_col_isolation', 'w_col_rivalry'],
    choices: [
      {
        id: 'disc_014_a',
        label: '誰ともつながれていない。輪の外にいる感覚がある',
        situationScores: { w_col_isolation: 3, w_col_rivalry: -2 },
        reasonText: '孤立——関係がないことが問題。距離があって、入れない。',
      },
      {
        id: 'disc_014_b',
        label: 'ぶつかる・張り合う・敵意を感じる相手がいる',
        situationScores: { w_col_rivalry: 3, w_col_isolation: -2 },
        reasonText: '摩擦——関係はある。でもその関係が消耗する方向に働いている。',
      },
      {
        id: 'disc_014_c',
        label: '孤立もしているし、特定の相手との摩擦もある',
        situationScores: { w_col_isolation: 1, w_col_rivalry: 1 },
        reasonText: null,
      },
    ],
  },

  // ── Pair 15: 消耗する人間関係 vs 友人関係での孤立 ────────────────────
  {
    id: 'disc_015',
    type: 'discriminating',
    pair: ['r_friend_toxic', 'r_friend_isolation'],
    text: 'プライベートの人間関係で今感じていることに近いのはどちらですか？',
    discriminates: ['r_friend_toxic', 'r_friend_isolation'],
    choices: [
      {
        id: 'disc_015_a',
        label: '関係はある。でも会うと疲れる。エネルギーが取られる',
        situationScores: { r_friend_toxic: 3, r_friend_isolation: -2 },
        reasonText: '消耗する関係——孤独ではない。ただその関係が、プラスではなくマイナスに働いている。',
      },
      {
        id: 'disc_015_b',
        label: 'そもそも話せる人がいない。つながりが薄い、または少ない',
        situationScores: { r_friend_isolation: 3, r_friend_toxic: -2 },
        reasonText: '孤立——関係の質より先に、関係そのものが足りていない。',
      },
      {
        id: 'disc_015_c',
        label: '消耗する関係もあるし、全体的につながりも薄い',
        situationScores: { r_friend_toxic: 1, r_friend_isolation: 1 },
        reasonText: null,
      },
    ],
  },

  // ── Pair 16: 方向性が見えない vs 人生の転換点 ───────────────────────
  {
    id: 'disc_016',
    type: 'discriminating',
    pair: ['s_no_direction', 'f_life_change'],
    text: '今の「迷い」の感触に近いのはどちらですか？',
    discriminates: ['s_no_direction', 'f_life_change'],
    choices: [
      {
        id: 'disc_016_a',
        label: '何がしたいのか、何に向かえばいいのか、自分の中でわからない',
        situationScores: { s_no_direction: 3, f_life_change: -1 },
        reasonText: '内なる問い——外側に何かが起きているのではなく、自分の中の方向感覚が見えなくなっている。',
      },
      {
        id: 'disc_016_b',
        label: '今の生活・状況そのものが、変わり目に来ている感覚がある',
        situationScores: { f_life_change: 3, s_no_direction: -1 },
        reasonText: '転換点——何をしたいかより先に、今のフェーズ自体が終わりに来ている感覚と見ました。',
      },
      {
        id: 'disc_016_c',
        label: '方向もわからないし、状況も変化している。両方重なっている',
        situationScores: { s_no_direction: 1, f_life_change: 2 },
        reasonText: null,
      },
    ],
  },

  // ── Pair 17: 自立への迷い vs 仕事・キャリアの決断 ────────────────────
  {
    id: 'disc_017',
    type: 'discriminating',
    pair: ['f_independence', 'f_job_decision'],
    text: '将来について、今一番引っかかっているのはどちらですか？',
    discriminates: ['f_independence', 'f_job_decision'],
    choices: [
      {
        id: 'disc_017_a',
        label: '「自分だけでやっていけるか」という不安が根っこにある',
        situationScores: { f_independence: 3, f_job_decision: -2 },
        reasonText: '自立への問い——選択肢の前に、「自分はそれをやれるのか」という自己への疑問が来ている。',
      },
      {
        id: 'disc_017_b',
        label: '転職・独立・留まるなど、具体的な選択肢があって決められない',
        situationScores: { f_job_decision: 3, f_independence: -2 },
        reasonText: '決断の問い——自信の問題より先に、「何を選ぶか」という判断が問題になっている。',
      },
      {
        id: 'disc_017_c',
        label: '自信のなさもあるし、選択肢の迷いもある。両方ある',
        situationScores: { f_independence: 1, f_job_decision: 1 },
        reasonText: null,
      },
    ],
  },

  // ── Pair 18: 転職・キャリアの転換 vs 昇進・成長の頭打ち ──────────────
  {
    id: 'disc_018',
    type: 'discriminating',
    pair: ['w_career_change', 'w_career_stuck'],
    text: '今の仕事・キャリアについて、一番近い感覚はどちらですか？',
    discriminates: ['w_career_change', 'w_career_stuck'],
    choices: [
      {
        id: 'disc_018_a',
        label: '今いる場所を出て、違う環境・業種・働き方に移りたい',
        situationScores: { w_career_change: 3, w_career_stuck: -2 },
        reasonText: '環境を変えたい——成長できるかどうかより先に、「ここではない」という感覚が来ている。',
      },
      {
        id: 'disc_018_b',
        label: '今の場所で頑張っているが、上に行けない。天井が見えている',
        situationScores: { w_career_stuck: 3, w_career_change: -2 },
        reasonText: '詰まっている——まだここで戦いたい意志はある。ただその場所が、自分を活かせていない。',
      },
      {
        id: 'disc_018_c',
        label: '場所を変えたいし、今の場所でも詰まっている。両方来ている',
        situationScores: { w_career_change: 1, w_career_stuck: 1 },
        reasonText: null,
      },
    ],
  },
];
