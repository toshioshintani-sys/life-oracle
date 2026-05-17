// アキネーターエンジン
// 状況スコアの拮抗を見て、最もそれを識別できる質問を選ぶ

export const ALL_SITUATIONS = [
  // 仕事
  'w_boss_power',      // パワハラ・威圧的な上司
  'w_boss_unfair',     // 評価されない・不公平
  'w_boss_values',     // 価値観・方針が合わない
  'w_col_isolation',   // 職場での孤立
  'w_col_rivalry',     // 競争・嫉妬・押し付け
  'w_work_empty',      // やりがいがない・向いていない
  'w_work_overload',   // 量が多すぎる・消耗
  'w_career_change',   // 転職を考えている
  'w_career_indep',    // 独立・起業を考えている
  'w_career_stuck',    // 昇進・評価が止まっている
  // 人間関係（今後追加）
  'r_partner_drift',
  'r_partner_divorce',
  'r_parent_pressure',
  'r_parent_care',
  'r_friend_isolation',
  'r_friend_toxic',
  // 自己理解（今後追加）
  's_self_esteem',
  's_emotion_control',
  's_no_direction',
  's_burnout',
  // 将来（今後追加）
  'f_job_decision',
  'f_independence',
  'f_life_change',
];

export function createSession(intent) {
  const situationScores = {};
  ALL_SITUATIONS.forEach(s => { situationScores[s] = 0; });

  return {
    intent,
    situationScores,
    biasScores: { B1: 0, B2: 0, B3: 0, B4: 0, B6: 0, B8: 0, B12: 0 },
    jungHints:  { Te: 0, Ti: 0, Fe: 0, Fi: 0, Se: 0, Si: 0, Ne: 0, Ni: 0 },
    demographic: { age: null, job: null },
    answeredIds: [],
    questionCount: 0,
    tags: [],
  };
}

export function recordAnswer(session, question, choice) {
  if (choice.situationScores) {
    Object.entries(choice.situationScores).forEach(([sit, score]) => {
      if (session.situationScores[sit] !== undefined) {
        session.situationScores[sit] += score;
      }
    });
  }
  if (choice.biasHints) {
    Object.entries(choice.biasHints).forEach(([b, score]) => {
      if (session.biasScores[b] !== undefined) session.biasScores[b] += score;
    });
  }
  if (choice.jungHints) {
    Object.entries(choice.jungHints).forEach(([f, score]) => {
      if (session.jungHints[f] !== undefined) session.jungHints[f] += score;
    });
  }
  if (question.type === 'demographic_age') session.demographic.age = choice.value;
  if (question.type === 'demographic_job') session.demographic.job = choice.value;
  if (choice.tags) session.tags.push(...choice.tags);

  session.answeredIds.push(question.id);
  session.questionCount++;
}

export function shouldFinish(session) {
  if (!session.demographic.age || !session.demographic.job) return false;
  if (session.questionCount < 8) return false;
  if (session.questionCount >= 15) return true;

  const sorted = Object.values(session.situationScores).sort((a, b) => b - a);
  return sorted[0] >= 8 && (sorted[0] - (sorted[1] ?? 0)) >= 4;
}

export function getNextQuestion(session, allQuestions) {
  const asked = new Set(session.answeredIds);
  const available = allQuestions.filter(q => !asked.has(q.id));

  // Q1: intent に対応した入口
  if (session.questionCount === 0) {
    return available.find(q => q.startFor === session.intent) ?? available[0];
  }

  // Q5以降で年代未取得 → 年代を聞く
  if (session.questionCount >= 5 && !session.demographic.age) {
    return available.find(q => q.type === 'demographic_age');
  }

  // 年代取得済・職種未取得 → 職種を聞く
  if (session.demographic.age && !session.demographic.job) {
    return available.find(q => q.type === 'demographic_job');
  }

  // アキネーターフェーズ: 上位3状況を最もよく識別する質問を選ぶ
  const top3 = getTopSituations(session.situationScores, 3);

  const candidates = available
    .filter(q => q.type !== 'demographic_age' && q.type !== 'demographic_job')
    .map(q => ({
      q,
      power: (q.discriminates ?? []).filter(d => top3.includes(d)).length,
    }))
    .filter(({ power }) => power > 0)
    .sort((a, b) => b.power - a.power);

  return candidates[0]?.q ?? available.find(q =>
    q.type !== 'demographic_age' && q.type !== 'demographic_job'
  );
}

export function buildResult(session) {
  const entries = Object.entries(session.situationScores).sort(([,a],[,b]) => b - a);
  const topSituation = entries[0][0];
  const secondSituation = entries[1][0];

  const topBiases = Object.entries(session.biasScores)
    .sort(([,a],[,b]) => b - a).slice(0, 2).map(([b]) => b);
  const topJung = Object.entries(session.jungHints)
    .sort(([,a],[,b]) => b - a).slice(0, 2).map(([f]) => f);

  return {
    situation: topSituation,
    secondSituation,
    age: session.demographic.age,
    job: session.demographic.job,
    topBiases,
    topJung,
    tags: session.tags,
    scores: session.situationScores,
  };
}

function getTopSituations(scores, n) {
  return Object.entries(scores)
    .sort(([,a],[,b]) => b - a)
    .slice(0, n)
    .map(([s]) => s);
}
