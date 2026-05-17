// 次問選択エンジン（純粋関数）
// 確信度が低い軸を優先しつつ、angle が均等に出るよう全履歴ベースで分散する

import { confidence } from './scorer.js';
import { AXIS_QUESTIONS, BIAS_QUESTIONS } from '../data_v2/index.js';

const AXES = ['EI', 'SN', 'TF', 'JP'];
const ANGLES = ['work', 'relation', 'stress', 'choice'];

/** 軸問4問ごとにバイアス問を1問挿入 */
function shouldInsertBias(session) {
  const axisCount = session.history.filter(h => h.axis !== null).length;
  return axisCount > 0 && axisCount % 4 === 0;
}

/** 未使用バイアス問を返す（出題数が少ないバイアス優先） */
function pickBiasQuestion(session) {
  const available = BIAS_QUESTIONS.filter(q => !session.asked.has(q.id));
  if (available.length === 0) return null;

  const biasCounts = {};
  session.history
    .filter(h => h.axis === null)
    .forEach(h => {
      const q = BIAS_QUESTIONS.find(bq => bq.id === h.questionId);
      if (q) biasCounts[q.bias] = (biasCounts[q.bias] ?? 0) + 1;
    });

  return available.sort((a, b) =>
    (biasCounts[a.bias] ?? 0) - (biasCounts[b.bias] ?? 0)
  )[0];
}

/**
 * 次に出題する軸問を選ぶ
 *
 * priority = (1 - confidence_axis)
 *          - 0.25 × (直前2問で同軸の回数)
 *          - 0.30 × (このangleが全履歴で多く出すぎている度合い)
 *          + altBonus
 *
 * angle 過剰出題ペナルティ：
 *   セッション中の angle 出題回数を正規化し、最多 angle との差分をペナルティに使う。
 *   これにより work が多く出たら次は relation/stress/choice が優先される。
 */
function pickAxisQuestion(session) {
  const unlockedAxes = AXES.filter(ax => !session.lockedAxes.has(ax));
  if (unlockedAxes.length === 0) return null;

  // セッション全体の angle 出題数を集計
  const angleCounts = {};
  ANGLES.forEach(a => { angleCounts[a] = 0; });
  session.history
    .filter(h => h.axis !== null && h.angle)
    .forEach(h => { angleCounts[h.angle] = (angleCounts[h.angle] ?? 0) + 1; });
  const maxAngleCount = Math.max(...Object.values(angleCounts));

  let best = null;
  let bestPriority = -Infinity;

  for (const axis of unlockedAxes) {
    const conf = confidence(session.thetas[axis]);
    const recentAxisPenalty =
      session.recentAxes.filter(a => a === axis).length * 0.25;

    const candidates = AXIS_QUESTIONS.filter(
      q => q.axis === axis && !session.asked.has(q.id)
    );
    if (candidates.length === 0) continue;

    const dkStreak = session.dontknowStreak[axis] ?? 0;

    for (const q of candidates) {
      // angle が全体で多く出るほどペナルティが大きくなる
      const angleOveruse = maxAngleCount > 0
        ? (angleCounts[q.angle] ?? 0) / (maxAngleCount + 1)
        : 0;
      const anglePenalty = angleOveruse * 0.30;

      const altBonus = dkStreak >= 2 && q.altOf ? 0.3 : 0;

      const priority =
        (1 - conf) - recentAxisPenalty - anglePenalty + altBonus;

      if (priority > bestPriority) {
        bestPriority = priority;
        best = q;
      }
    }
  }

  return best;
}

/**
 * 次の質問を選んで返す。出題できる質問がなければ null を返す。
 */
export function selectNext(session) {
  if (session.questionCount >= session.maxQuestions) return null;

  if (session.lockedAxes.size === 4) {
    return pickBiasQuestion(session);
  }

  if (shouldInsertBias(session)) {
    const biasQ = pickBiasQuestion(session);
    if (biasQ) return biasQ;
  }

  return pickAxisQuestion(session);
}

/** セッション終了判定 */
export function isFinished(session) {
  if (session.questionCount >= session.maxQuestions) return true;
  if (session.lockedAxes.size === 4) {
    const biasAsked = session.history.filter(h => h.axis === null).length;
    return biasAsked >= 4;
  }
  return false;
}
