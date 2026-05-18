// アキネーターエンジン v2
// 主な改良点：
// - normalizedScore: 出題済み質問ベースで状況スコアを正規化
// - inferAgeGroupWithConfidence: 信頼度＋証拠数で年代テキスト使用可否を判定
// - confidenceGap: 絶対差→比率ベースに変更（序盤の偶然確定を防止）
// - shouldFinish: rawTop + ratio の2条件で確定
// - evidenceLog: 切り分け質問で「AではなくB」比較形式の推論ログを生成

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

  const maxPossibleScores = {};
  ALL_SITUATIONS.forEach(s => { maxPossibleScores[s] = 0; });

  const demographicScores = {};
  DEMOGRAPHIC_KEYS.forEach(k => { demographicScores[k] = 0; });

  return {
    situationScores,
    maxPossibleScores,
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
  // normalizedScore 用：この質問で各状況が取り得た最大点を累積
  if (question.choices) {
    ALL_SITUATIONS.forEach(sit => {
      const maxForThisQ = Math.max(
        ...question.choices.map(c => c.situationScores?.[sit] ?? 0)
      );
      session.maxPossibleScores[sit] += maxForThisQ;
    });
  }

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

  // 推論ログ：切り分け質問で「AではなくBを選んだ」比較形式で生成
  if (question.type === 'discriminating') {
    const otherChoice = question.choices.find(c => c.id !== choice.id);
    if (otherChoice && choice.reasonText) {
      session.evidenceLog.push(
        `「${otherChoice.label}」より「${choice.label}」に近い状況と読みました。`
      );
    } else if (choice.reasonText) {
      session.evidenceLog.push(choice.reasonText);
    }
  }

  // スコアが高い答えを「読み返し」用に保存（最大4件）
  const maxScore = choice.situationScores
    ? Math.max(...Object.values(choice.situationScores))
    : 0;
  if (maxScore >= 2 && session.keyAnswers.length < 4) {
    session.keyAnswers.push(choice.label);
  }

  // ピボット検出：Q5以降で1位状況が入れ替わったとき
  const sorted = getNormalizedEntries(session);
  const currentTop = sorted[0]?.[0] ?? null;
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

  const entries = getNormalizedEntries(session);
  const topNorm   = entries[0]?.[1] ?? 0;
  const secNorm   = entries[1]?.[1] ?? 0;
  const gap       = topNorm > 0 ? (topNorm - secNorm) / topNorm : 0;
  const rawTop    = session.situationScores[entries[0]?.[0]] ?? 0;

  return rawTop >= 6 && gap >= 0.25;
}

export function getSessionMessage(session) {
  const q = session.questionCount;
  if (q === 0) return null;

  if (q - session.lastPivotAt <= 1 && session.lastPivotAt > 0) {
    return '少し別の角度から確認させてください。';
  }

  const entries = getNormalizedEntries(session);
  const top  = entries[0]?.[1] ?? 0;
  const sec  = entries[1]?.[1] ?? 0;
  const gap  = top > 0 ? (top - sec) / top : 0;

  if (q <= 3)    return 'あなたのことを、静かに読んでいます。';
  if (q <= 5)    return '輪郭が見えてきました。';
  if (gap < 0.1) return 'もう少しだけ聞かせてください。';
  if (gap < 0.2) return 'だいぶ絞れてきました。';
  if (q >= 18)   return 'もうすぐです。';
  return 'あと数問だけ聞かせてください。';
}

export function getSessionConfidence(session) {
  if (session.questionCount === 0) return 0;
  const entries = getNormalizedEntries(session);
  const top = entries[0]?.[1] ?? 0;
  const sec = entries[1]?.[1] ?? 0;
  const gap = top > 0 ? (top - sec) / top : 0;
  return Math.min(gap / 0.5, 0.95);
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
  const entries = getNormalizedEntries(session);
  const top1Norm = entries[0]?.[1] ?? 0;
  const top2Norm = entries[1]?.[1] ?? 0;
  const gap      = top1Norm > 0 ? (top1Norm - top2Norm) / top1Norm : 0;

  if (gap < 0.25 && top1Norm > 0) {
    const top2Situations = [entries[0][0], entries[1][0]];
    const discriminatingCandidate = available.find(q =>
      q.type === 'discriminating' &&
      Array.isArray(q.pair) &&
      q.pair.length === 2 &&
      q.pair.every(p => top2Situations.includes(p))
    );
    if (discriminatingCandidate) return discriminatingCandidate;
  }

  // フェーズ2b：アキネーター（上位3状況を discriminate する質問を優先）
  const top3 = entries.slice(0, 3).map(([s]) => s);
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
  const entries = getNormalizedEntries(session);
  const topSituation    = entries[0][0];
  const secondSituation = entries[1][0];
  const top1Norm        = entries[0][1];
  const top2Norm        = entries[1][1];
  const situationGap    = top1Norm > 0 ? (top1Norm - top2Norm) / top1Norm : 1;

  const topBiases = Object.entries(session.biasScores)
    .sort(([,a],[,b]) => b - a).slice(0, 2).map(([b]) => b);
  const topJung = Object.entries(session.jungHints)
    .sort(([,a],[,b]) => b - a).slice(0, 2).map(([f]) => f);

  const thirdSituation = entries[2]?.[0] ?? null;
  const top3Norm       = entries[2]?.[1] ?? 0;
  // 3位は top の 80% 以上のスコアがある場合のみ「隣接テーマ」として表示
  const showThird = top3Norm > 0 && top1Norm > 0 && (top1Norm - top3Norm) / top1Norm < 0.20;

  const { ageLabel, confidence: ageConfidence, useAgeText } =
    inferAgeGroupWithConfidence(session.demographicScores);

  const inferredJobKey = inferJobFromScores(session.demographicScores);
  const jobLabel = inferredJobKey ? JOB_KEY_TO_LABEL[inferredJobKey] : null;

  return {
    situation:      topSituation,
    secondSituation,
    situationGap,
    thirdSituation,
    showThird,
    // age は信頼度が高い時のみ年代ラベル、低い時は 'neutral'
    age:            useAgeText ? (ageLabel ?? 'neutral') : 'neutral',
    ageLabel,
    ageConfidence:  ageConfidence ?? 0,
    useAgeText:     useAgeText ?? false,
    inferredJob:    jobLabel,
    topBiases,
    topJung,
    keyAnswers:     [...session.keyAnswers],
    evidenceLog:    [...session.evidenceLog],
    tags:           [...session.tags],
    scores:         { ...session.situationScores },
    normalizedScores: Object.fromEntries(entries),
  };
}

// ── helpers ────────────────────────────────────────────────────────────────

function getNormalizedEntries(session) {
  return ALL_SITUATIONS
    .map(sit => {
      const raw     = session.situationScores[sit] ?? 0;
      const maxPoss = session.maxPossibleScores[sit] ?? 0;
      return [sit, maxPoss > 0 ? raw / maxPoss : 0];
    })
    .sort(([,a], [,b]) => b - a);
}

function inferAgeGroupWithConfidence(demographicScores) {
  const AGE_KEYS = ['age_early20s', 'age_late20s', 'age_30s', 'age_40s', 'age_50s', 'age_60s'];
  const ageEntries = AGE_KEYS
    .map(k => ({ key: k, score: demographicScores[k] || 0 }))
    .sort((a, b) => b.score - a.score);

  const topScore    = ageEntries[0].score;
  const secondScore = ageEntries[1].score;
  const totalEvidence = ageEntries.reduce((s, { score }) => s + score, 0);

  if (topScore === 0) return { ageLabel: null, confidence: 0, useAgeText: false };

  const confidence = (topScore - secondScore) / Math.max(topScore, 1);
  // 3条件：比率差 + 合計証拠量 + トップスコア単体
  const useAgeText = confidence >= 0.25 && totalEvidence >= 3 && topScore >= 2;

  return {
    ageLabel: AGE_KEY_TO_LABEL[ageEntries[0].key] ?? null,
    confidence,
    useAgeText,
  };
}

function inferJobFromScores(demographicScores) {
  const JOB_KEYS = Object.keys(JOB_KEY_TO_LABEL);
  const sorted = JOB_KEYS
    .map(k => [k, demographicScores[k] || 0])
    .sort(([,a], [,b]) => b - a);
  if (!sorted.length || sorted[0][1] === 0) return null;
  return sorted[0][0];
}
