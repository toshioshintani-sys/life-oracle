// 将来の選択ドメイン（f_）質問プール
// f_job_decision: 選択肢はあるが決断できない
// f_independence: 自立できるか、という問い
// f_life_change:  人生の転換期の予感

export const FUTURE_QUESTIONS = [

  // ── f_job_decision ──────────────────────────────────────────────────────

  {
    id: 'fut_001',
    type: 'situation',
    discriminates: ['f_job_decision', 'f_life_change', 'w_career_change'],
    text: '今、具体的な選択肢が目の前にあって、どちらにすべきか決められずにいる。',
    choices: [
      {
        id: 'fut_001_a',
        label: 'そう。選択肢はある、でも選べない',
        situationScores: { f_job_decision: 3, f_life_change: -1, w_career_change: -1, s_no_direction: -1 },
        demographicHints: { age_late20s: 1, age_30s: 1, age_40s: 1 },
      },
      {
        id: 'fut_001_b',
        label: '選択肢というより、今の状態を変えたいという感覚がある',
        situationScores: { w_career_change: 2, s_no_direction: 1, f_job_decision: -2 },
      },
      {
        id: 'fut_001_c',
        label: 'ちがう。動けない感じ、どこに向かえばいいか分からない感じ',
        situationScores: { s_burnout: 2, s_no_direction: 2, f_job_decision: -2 },
      },
    ],
  },

  {
    id: 'fut_002',
    type: 'situation',
    discriminates: ['f_job_decision', 'f_independence', 's_no_direction'],
    text: '「どちらが正しいか」という問いを、ここ数ヶ月ずっと繰り返している。',
    choices: [
      {
        id: 'fut_002_a',
        label: 'そう。答えを出せないまま、ぐるぐるしている',
        situationScores: { f_job_decision: 3, s_no_direction: -1 },
        demographicHints: { age_30s: 1, age_40s: 1 },
      },
      {
        id: 'fut_002_b',
        label: '問いというより、踏み出す勇気がなくて止まっている感じ',
        situationScores: { f_independence: 2, f_job_decision: 1 },
      },
      {
        id: 'fut_002_c',
        label: 'どの問いかもまだはっきりしていない',
        situationScores: { s_no_direction: 2, f_life_change: 1, f_job_decision: -1 },
      },
    ],
  },

  {
    id: 'fut_003',
    type: 'situation',
    discriminates: ['f_job_decision', 'w_career_change', 'w_career_indep'],
    text: '転職・独立・留まる、といった選択肢のどれかを、今真剣に考えている。',
    choices: [
      {
        id: 'fut_003_a',
        label: 'そう。どれが自分にとって正解か、ずっと考えている',
        situationScores: { f_job_decision: 3, w_career_change: 1, w_career_indep: 1 },
        demographicHints: { job_employee: 1, age_30s: 1, age_40s: 1 },
      },
      {
        id: 'fut_003_b',
        label: '転職・独立の方向は決まっている。あとはタイミングだけ',
        situationScores: { w_career_change: 2, w_career_indep: 2, f_job_decision: -2 },
        demographicHints: { job_employee: 1 },
      },
      {
        id: 'fut_003_c',
        label: 'そこまで具体的には考えていない',
        situationScores: { f_job_decision: -2, w_career_change: -2, w_career_indep: -2 },
      },
    ],
  },

  {
    id: 'fut_004',
    type: 'situation',
    discriminates: ['f_job_decision', 'f_life_change'],
    text: '「今が動かないといけないタイミング」という焦りが、どこかにある。',
    choices: [
      {
        id: 'fut_004_a',
        label: 'そう。年齢的にも、今動かないと後がない気がする',
        situationScores: { f_job_decision: 2, f_life_change: 2 },
        demographicHints: { age_late20s: 1, age_30s: 1, age_50s: 1 },
      },
      {
        id: 'fut_004_b',
        label: '焦りというより、もっとゆっくりした「このままでいいのか」に近い',
        situationScores: { f_life_change: 2, f_job_decision: -1 },
      },
      {
        id: 'fut_004_c',
        label: 'そういった焦りはない',
        situationScores: { f_job_decision: -2, f_life_change: -1 },
      },
    ],
  },

  // ── f_independence ───────────────────────────────────────────────────────

  {
    id: 'fut_005',
    type: 'situation',
    discriminates: ['f_independence', 'w_career_indep', 'f_job_decision'],
    text: '「自分一人でやっていけるか」という問いが、ここ最近頭にある。',
    choices: [
      {
        id: 'fut_005_a',
        label: 'そう。経済的にも精神的にも、自立できるかどうか不安',
        situationScores: { f_independence: 3, w_career_indep: -1, f_job_decision: -1 },
        demographicHints: { age_early20s: 1, age_late20s: 1 },
      },
      {
        id: 'fut_005_b',
        label: '自立したい気持ちは強い。踏み出せていないだけ',
        situationScores: { w_career_indep: 3, f_independence: -1 },
        demographicHints: { age_late20s: 1, age_30s: 1 },
      },
      {
        id: 'fut_005_c',
        label: 'そういう不安は今はない',
        situationScores: { f_independence: -2 },
      },
    ],
  },

  {
    id: 'fut_006',
    type: 'situation',
    discriminates: ['f_independence', 'r_parent_pressure', 'r_partner_drift'],
    text: '誰か（家族・パートナー・会社）に支えられている状態が、ずっとは続かないと感じている。',
    choices: [
      {
        id: 'fut_006_a',
        label: 'そう。その関係に依存していることへの不安がある',
        situationScores: { f_independence: 3, r_parent_pressure: 1 },
        demographicHints: { age_early20s: 1, age_late20s: 1, age_30s: 1 },
      },
      {
        id: 'fut_006_b',
        label: '依存というより、その関係自体が重くなっている',
        situationScores: { r_parent_pressure: 2, r_friend_toxic: 1, f_independence: -1 },
      },
      {
        id: 'fut_006_c',
        label: 'あまりそういうことは考えない',
        situationScores: { f_independence: -2 },
      },
    ],
  },

  {
    id: 'fut_007',
    type: 'situation',
    discriminates: ['f_independence', 'f_life_change'],
    text: '今の生活の土台（収入・住む場所・依存関係）が、近い将来に変わりそうな気がしている。',
    choices: [
      {
        id: 'fut_007_a',
        label: 'そう。その変化に自分が対応できるか不安がある',
        situationScores: { f_independence: 3, f_life_change: 1 },
        demographicHints: { age_early20s: 1, age_late20s: 1 },
      },
      {
        id: 'fut_007_b',
        label: '変化への不安というより、変えたいという気持ちの方が強い',
        situationScores: { f_life_change: 2, f_job_decision: 1, f_independence: -1 },
      },
      {
        id: 'fut_007_c',
        label: 'そういう変化は今は考えていない',
        situationScores: { f_independence: -2, f_life_change: -1 },
      },
    ],
  },

  // ── f_life_change ────────────────────────────────────────────────────────

  {
    id: 'fut_008',
    type: 'situation',
    discriminates: ['f_life_change', 's_no_direction', 'f_job_decision'],
    text: '「このままでいいのか」という感覚が、仕事だけでなく人生全体に対してある。',
    choices: [
      {
        id: 'fut_008_a',
        label: 'そう。仕事というより、もっと広い範囲に感じる',
        situationScores: { f_life_change: 3, s_no_direction: 1, f_job_decision: -1 },
        demographicHints: { age_30s: 1, age_40s: 1, age_50s: 1 },
      },
      {
        id: 'fut_008_b',
        label: '今の仕事・職場に対して感じる',
        situationScores: { w_work_empty: 2, w_career_change: 1, f_life_change: -1 },
      },
      {
        id: 'fut_008_c',
        label: 'あまりそういう感覚はない',
        situationScores: { f_life_change: -2 },
      },
    ],
  },

  {
    id: 'fut_009',
    type: 'situation',
    discriminates: ['f_life_change', 's_burnout', 'f_job_decision'],
    text: 'あるタイミングを境に、以前とは違う「フェーズに入った」という感覚がある。',
    choices: [
      {
        id: 'fut_009_a',
        label: 'そう。何かが節目を越えた感じがする',
        situationScores: { f_life_change: 3, s_burnout: -1 },
        demographicHints: { age_30s: 1, age_40s: 1, age_50s: 1 },
      },
      {
        id: 'fut_009_b',
        label: '節目という感じではなく、ただ疲れ切っている',
        situationScores: { s_burnout: 3, f_life_change: -2 },
      },
      {
        id: 'fut_009_c',
        label: 'そういった感覚はない',
        situationScores: { f_life_change: -1 },
      },
    ],
  },

  {
    id: 'fut_010',
    type: 'situation',
    discriminates: ['f_life_change', 'f_job_decision', 's_no_direction'],
    text: '数年前の自分が描いていたイメージと、今の自分の現実が、大きくズレている。',
    choices: [
      {
        id: 'fut_010_a',
        label: 'そう。思っていたのとは違う場所にいる',
        situationScores: { f_life_change: 3, f_job_decision: 1 },
        demographicHints: { age_30s: 1, age_40s: 1, age_50s: 1 },
      },
      {
        id: 'fut_010_b',
        label: '今後の選択肢を考えるとき、そのズレが気になる',
        situationScores: { f_job_decision: 2, f_life_change: 1 },
      },
      {
        id: 'fut_010_c',
        label: 'そういったイメージは特に描いていなかった',
        situationScores: { f_life_change: -1, f_job_decision: -1 },
      },
    ],
  },
];
