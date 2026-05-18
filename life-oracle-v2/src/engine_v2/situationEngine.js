// アキネーターエンジン v2
// - 汎用入口5問を先に出し、その後スコアベースで質問を選ぶ
// - demographicHints で年齢・職業を行動から推定（直接聞かない）
// - keyAnswers で「あなたはこう答えました」を生成
// - getSessionMessage で対話的な進行メッセージを返す
// - discriminating questions で上位2候補を積極的に切り分ける
// - evidenceLog で「私はこう読みました」の推論ログを生成

export const ALL_SITUATIONS = [
  'w_boss_power', 'w_boss_unfair', 'w_boss_values',
  'w_col_isolation', 'w_col_rivalry',
  'w_work_empty', 'w_work_overload',
  'w_career_change', 'w_career_indep', 'w_career_stuck',
  'r_partner_drift', 'r_partner_divorce',
  'r_parent_pressure', 'r_parent_care',
  'r_friend_isolation', 'r_friend_toxic',
  's_self_esteem', 's_emotion_control', 's_no_direction', 's_burnout',
  'f_job_decision', 'f_independence', 'f_life_change',
];

const DEMOGRAPHIC_KEYS = [
  'age_early20s', 'age_late20s', 'age_30s', 'age_40s', 'age_50s', 'age_60s',
  'job_employee', 'job_freelance', 'job_homemaker', 'job_student', 'job_parttime',
];

const AGE_KEY_TO_LABEL = {
  age_early20s: '20代前半',
  age_late20s:  '20代後半',
  age_30s:      '30代',
  age_40s:      '40代',
  age_50s:      '50代',
  age_60s:      '60代以上',
};

const JOB_KEY_TO_LABEL = {
  job_employee:  '会社員',
  job_freelance: 'フリーランス・自営業',
  job_homemaker: '主婦・主夫',
  job_student:   '学生',
  job_parttime:  '非正規雇用',
};

export function createSession() {
  const situationScores = {};
  ALL_SITUATIONS.forEach(s => { situationScores[s] = 0; });

  const demographicScores = {};
  DEMOGRAPHIC_KEYS.forEach(k => { demographicScores[k] = 0; });

  return {
    situationScores,
    demographicScores,
    biasScores:       { B1: 0, B2: 0, B3: 0, B4: 0, B6: 0, B8: 0, B12: 0 },
    jungHints:        { Te: 0, Ti: 0, Fe: 0, Fi: 0, Se: 0, Si: 0, Ne: 0, Ni: 0 },
    keyAnswers:       [],
    evidenceLog:      [],
    tags:             [],
    answeredIds:      [],
    questionCount:    0,
    prevTopSituation: null,
    lastPivotAt:      -99,
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
  if (choice.demographicHints) {
    Object.entries(choice.demographicHints).forEach(([k, score]) => {
      if (session.demographicScores[k] !== undefined) session.demographicScores[k] += score;
    });
  }
  if (choice.tags) session.tags.push(...choice.tags);

  // 推論ログ：切り分け質問の reasonText を保存
  if (question.type === 'discriminating' && choice.reasonText) {
    session.evidenceLog.push(choice.reasonText);
  }

  // スコアが高い答えを「読み返し」用に保存
  const maxScore = choice.situationScores
    ? Math.max(...Object.values(choice.situationScores))
    : 0;
  if (maxScore >= 2 && session.keyAnswers.length < 4) {
    session.keyAnswers.push(choice.label);
  }

  // ピボット検出：Q5以降で1位状況が入れ替わったとき
  const currentTop = getTopSituationKey(session.situationScores);
  if (
    session.questionCount >= 5 &&
    session.prevTopSituation &&
    session.prevTopSituation !== currentTop
  ) {
    session.lastPivotAt = session.questionCount;
  }
  session.prevTopSituation = currentTop;

  session.answeredIds.push(question.id);
  session.questionCount++;
}

export function shouldFinish(session) {
  if (session.questionCount < 12) return false;
  if (session.questionCount >= 22) return true;

  const sorted = Object.values(session.situationScores).sort((a, b) => b - a);
  return sorted[0] >= 8 && (sorted[0] - (sorted[1] ?? 0)) >= 4;
}

export function getSessionMessage(session) {
  const q = session.questionCount;
  if (q === 0) return null;

  // ピボット直後
  if (q - session.lastPivotAt <= 1 && session.lastPivotAt > 0) {
    return '少し別の角度から確認させてください。';
  }

  const sorted = Object.values(session.situationScores).sort((a, b) => b - a);
  const gap = (sorted[0] ?? 0) - (sorted[1] ?? 0);

  if (q <= 3)   return 'あなたのことを、静かに読んでいます。';
  if (q <= 5)   return '輪郭が見えてきました。';
  if (gap < 2)  return 'もう少しだけ聞かせてください。';
  if (gap < 4)  return 'だいぶ絞れてきました。';
  if (q >= 18)  return 'もうすぐです。';
  return 'あと数問だけ聞かせてください。';
}

// 確信度を 0〜1 で返す（UIの●ドット表示用）
export function getSessionConfidence(session) {
  if (session.questionCount === 0) return 0;
  const sorted = Object.values(session.situationScores).sort((a, b) => b - a);
  const gap = (sorted[0] ?? 0) - (sorted[1] ?? 0);
  return Math.min(gap / 8, 0.95);
}

export function getNextQuestion(session, allQuestions) {
  const asked = new Set(session.answeredIds);
  const available = allQuestions.filter(q => !asked.has(q.id));

  // フェーズ1：汎用入口質問を順番に出す
  const universalRemaining = available
    .filter(q => q.type === 'universal')
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  if (universalRemaining.length > 0) return universalRemaining[0];

  // フェーズ2a：上位2候補が接近していたら切り分け質問を優先
  const sorted = Object.entries(session.situationScores).sort(([,a],[,b]) => b - a);
  const top1Score = sorted[0]?.[1] ?? 0;
  const top2Score = sorted[1]?.[1] ?? 0;
  const currentGap = top1Score - top2Score;

  if (currentGap < 3 && top1Score > 0) {
    const top2Situations = [sorted[0][0], sorted[1][0]];
    const discriminatingCandidate = available.find(q =>
      q.type === 'discriminating' &&
      Array.isArray(q.pair) &&
      q.pair.length === 2 &&
      q.pair.every(p => top2Situations.includes(p))
    );
    if (discriminatingCandidate) return discriminatingCandidate;
  }

  // フェーズ2b：アキネーター（universal・demographic・discriminating 以外）
  const top3 = getTopSituations(session.situationScores, 3);
  const candidates = available
    .filter(q =>
      q.type !== 'universal' &&
      q.type !== 'demographic_age' &&
      q.type !== 'demographic_job' &&
      q.type !== 'discriminating'
    )
    .map(q => ({
      q,
      power: (q.discriminates ?? []).filter(d => top3.includes(d)).length,
    }))
    .filter(({ power }) => power > 0)
    .sort((a, b) => b.power - a.power);

  return candidates[0]?.q ?? available.find(
    q => q.type !== 'universal' &&
         q.type !== 'demographic_age' &&
         q.type !== 'demographic_job' &&
         q.type !== 'discriminating'
  );
}

export function buildResult(session) {
  const entries = Object.entries(session.situationScores).sort(([,a],[,b]) => b - a);
  const topSituation    = entries[0][0];
  const secondSituation = entries[1][0];

  const topBiases = Object.entries(session.biasScores)
    .sort(([,a],[,b]) => b - a).slice(0, 2).map(([b]) => b);
  const topJung = Object.entries(session.jungHints)
    .sort(([,a],[,b]) => b - a).slice(0, 2).map(([f]) => f);

  const inferredAgeKey = inferFromScores(session.demographicScores, 'age_');
  const inferredJobKey = inferFromScores(session.demographicScores, 'job_');
  const ageLabel = inferredAgeKey ? AGE_KEY_TO_LABEL[inferredAgeKey] : null;
  const jobLabel = inferredJobKey ? JOB_KEY_TO_LABEL[inferredJobKey] : null;

  return {
    situation:      topSituation,
    secondSituation,
    age:            ageLabel ?? '30代', // result text fallback
    job:            jobLabel,
    inferredAge:    ageLabel,
    inferredJob:    jobLabel,
    topBiases,
    topJung,
    keyAnswers:     [...session.keyAnswers],
    evidenceLog:    [...session.evidenceLog],
    tags:           session.tags,
    scores:         session.situationScores,
  };
}

// ── helpers ────────────────────────────────────────────────────────────────

function getTopSituationKey(scores) {
  return Object.entries(scores).sort(([,a],[,b]) => b - a)[0]?.[0] ?? null;
}

function getDomain(situation) {
  return situation.split('_')[0];
}

function getTopSituations(scores, n) {
  const sorted = Object.entries(scores).sort(([,a],[,b]) => b - a);
  const positive = sorted.filter(([,s]) => s > 0);
  if (positive.length >= n) return positive.slice(0, n).map(([s]) => s);

  const topDomain = positive.length > 0 ? getDomain(positive[0][0]) : null;
  const fills = topDomain
    ? sorted.filter(([s, v]) => v === 0 && getDomain(s) === topDomain)
    : sorted.filter(([,v]) => v === 0);

  const result = positive.map(([s]) => s);
  result.push(...fills.slice(0, n - result.length).map(([s]) => s));
  return result;
}

function inferFromScores(scores, prefix) {
  const relevant = Object.entries(scores)
    .filter(([k]) => k.startsWith(prefix))
    .sort(([,a], [,b]) => b - a);
  if (!relevant.length || relevant[0][1] === 0) return null;
  return relevant[0][0];
}
