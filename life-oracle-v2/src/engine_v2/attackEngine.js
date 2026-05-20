// 攻略型エンジン
// 相手の行動観察に基づいて jin_ タイプを推定する。
// situationEngine.js と同じ正規化（出題済み質問ベースの maxPossible 割り）を使う。

import { JIN_TYPES_BY_ID, listCandidateIds } from '../data_v2/jin/index.js';

const ALL_BIASES = ['B1','B2','B3','B4','B5','B6','B7','B8','B9','B10','B11','B12'];
const ALL_JUNG   = ['Te','Ti','Fe','Fi','Se','Si','Ne','Ni'];

export function createAttackSession(target = 'boss') {
  const candidateIds = listCandidateIds(target);
  const attackTypeScores  = {};
  const maxPossibleScores = {};
  candidateIds.forEach(id => {
    attackTypeScores[id]  = 0;
    maxPossibleScores[id] = 0;
  });

  const biasScores       = {};
  const jungShadowScores = {};
  ALL_BIASES.forEach(b => { biasScores[b] = 0; });
  ALL_JUNG.forEach(j   => { jungShadowScores[j] = 0; });

  return {
    target,
    candidateIds,
    attackTypeScores,
    maxPossibleScores,
    biasScores,
    jungShadowScores,
    keyAnswers:    [],
    answeredIds:   [],
    questionCount: 0,
  };
}

export function recordAttackAnswer(session, question, choice) {
  if (session.answeredIds.includes(question.id)) return false;

  // 出題済みベースで maxPossible を累積（正規化用）
  if (question.choices) {
    session.candidateIds.forEach(id => {
      const maxForQ = Math.max(
        0,
        ...question.choices.map(c => c.attackTypeHints?.[id] ?? 0)
      );
      session.maxPossibleScores[id] += maxForQ;
    });
  }

  if (choice.attackTypeHints) {
    Object.entries(choice.attackTypeHints).forEach(([id, score]) => {
      if (session.attackTypeScores[id] !== undefined) {
        session.attackTypeScores[id] += score;
      }
    });
  }
  if (choice.biasHints) {
    Object.entries(choice.biasHints).forEach(([b, s]) => {
      if (session.biasScores[b] !== undefined) session.biasScores[b] += s;
    });
  }
  if (choice.jungShadowHints) {
    Object.entries(choice.jungShadowHints).forEach(([j, s]) => {
      if (session.jungShadowScores[j] !== undefined) session.jungShadowScores[j] += s;
    });
  }

  // スコアが高い回答を「読み返し」用に保存（最大3件）
  const maxScore = choice.attackTypeHints
    ? Math.max(...Object.values(choice.attackTypeHints))
    : 0;
  if (maxScore >= 2 && session.keyAnswers.length < 3 && choice.label) {
    session.keyAnswers.push(choice.label);
  }

  session.answeredIds.push(question.id);
  session.questionCount++;
  return true;
}

export function shouldFinishAttack(session, minQuestions = 4) {
  if (session.questionCount < minQuestions) return false;
  if (session.questionCount >= 8) return true;

  const entries = getNormalizedEntries(session);
  const topNorm = entries[0]?.[1] ?? 0;
  const secNorm = entries[1]?.[1] ?? 0;
  const gap     = topNorm > 0 ? (topNorm - secNorm) / topNorm : 0;
  const rawTop  = Math.max(0, ...Object.values(session.attackTypeScores));

  return rawTop >= 3 && gap >= 0.25;
}

export function getNextAttackQuestion(session, allQuestions) {
  const asked = new Set(session.answeredIds);
  const available = allQuestions.filter(q => !asked.has(q.id));
  if (available.length === 0) return null;

  // フェーズ1：入口質問を順番に出す
  const entry = available
    .filter(q => q.type === 'entry')
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  if (entry.length > 0) return entry[0];

  // フェーズ2：上位3候補を弁別できる質問を優先
  const entries = getNormalizedEntries(session);
  const top3 = entries.slice(0, 3).map(([id]) => id);
  const ranked = available
    .map(q => ({
      q,
      power: (q.discriminates ?? []).filter(d => top3.includes(d)).length,
    }))
    .filter(({ power }) => power > 0)
    .sort((a, b) => b.power - a.power);

  return ranked[0]?.q ?? available[0];
}

export function getAttackSessionMessage(session) {
  if (session.questionCount < 2) return null;

  const entries = getNormalizedEntries(session);
  const top1 = entries[0]?.[1] ?? 0;
  const top2 = entries[1]?.[1] ?? 0;
  const gap  = top1 > 0 ? (top1 - top2) / top1 : 0;

  if (gap < 0.1) return 'もう少し、その人を観察してみてください。';
  return null;
}

export function buildAttackResult(session) {
  let entries = getNormalizedEntries(session);
  const topNormCheck = entries[0]?.[1] ?? 0;

  // Fallback: when no attackTypeHints were scored, use matchSignals dot product
  if (topNormCheck === 0 && session.candidateIds.length > 0) {
    entries = session.candidateIds
      .map(id => [id, matchSignalsScore(JIN_TYPES_BY_ID[id], session)])
      .sort(([, a], [, b]) => b - a);
  }

  const topId = entries[0]?.[0];
  if (!topId) return null;

  const topType = JIN_TYPES_BY_ID[topId];
  const topNorm = entries[0]?.[1] ?? 0;
  const secNorm = entries[1]?.[1] ?? 0;
  const gap     = topNorm > 0 ? (topNorm - secNorm) / topNorm : 1;

  const topBiases = Object.entries(session.biasScores)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([k]) => k);

  const topJungShadow = Object.entries(session.jungShadowScores)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;

  return {
    type:          topType,
    confidence:    gap >= 0.3 ? 'high' : gap >= 0.15 ? 'medium' : 'low',
    keyAnswers:    [...session.keyAnswers],
    topBiases,
    topJungShadow,
    scores:        { ...session.attackTypeScores },
    normalizedTop: topNorm,
  };
}

// ── helpers ────────────────────────────────────────────────────────────────

function matchSignalsScore(type, session) {
  if (!type?.matchSignals) return 0;
  let score = 0;
  const bw = type.matchSignals.biasWeights ?? {};
  const jw = type.matchSignals.jungShadowWeights ?? {};
  Object.entries(bw).forEach(([b, w]) => { score += (session.biasScores[b] ?? 0) * w; });
  Object.entries(jw).forEach(([j, w]) => { score += (session.jungShadowScores[j] ?? 0) * w; });
  return score;
}

function getNormalizedEntries(session) {
  return session.candidateIds
    .map(id => {
      const raw = session.attackTypeScores[id] ?? 0;
      const max = session.maxPossibleScores[id] ?? 0;
      return [id, max > 0 ? raw / max : 0];
    })
    .sort(([, a], [, b]) => b - a);
}
