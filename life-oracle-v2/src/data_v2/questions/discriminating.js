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
];
