// 次問選択エンジン（純粋関数）
// 確信度が低い軸を優先しつつ、同軸・同angle連続を避ける

import { confidence, CONFIDENCE_THRESHOLD } from './scorer.js';
import { AXIS_QUESTIONS, BIAS_QUESTIONS } from '../data_v2/index.js';

const AXES = ['EI', 'SN', 'TF', 'JP'];

/**
 * バイアス問を挟むかどうか判定
 * 軸問4問ごとに1問挿入
 */
function shouldInsertBias(session) {
  const axisCount = session.history.filter(h => h.axis !== null).length;
  return axisCount > 0 && axisCount % 4 === 0;
}

/**
 * 未使用のバイアス問を返す（得点が低いバイアスを優先）
 */
function pickBiasQuestion(session) {
  const available = BIAS_QUESTIONS.filter(q => !session.asked.has(q.id));
  if (available.length === 0) return null;

  // 出題数が少ないバイアスから優先
  const biasCounts = {};
  session.history
    .filter(h => h.axis === null)
    .forEach(h => {
      const q = [...BIAS_QUESTIONS].find(bq => bq.id === h.questionId);
      if (q) biasCounts[q.bias] = (biasCounts[q.bias] ?? 0) + 1;
    });

  return available.sort((a, b) => {
    const ca = biasCounts[a.bias] ?? 0;
    const cb = biasCounts[b.bias] ?? 0;
    return ca - cb;
  })[0];
}

/**
 * 次に出題する軸問を選ぶ
 * priority = (1 - confidence) - 0.2×(直前2問同軸数) - 0.1×(直前2問同angle数)
 */
function pickAxisQuestion(session) {
  const unlockedAxes = AXES.filter(ax => !session.lockedAxes.has(ax));
  if (unlockedAxes.length === 0) return null;

  let best = null;
  let bestPriority = -Infinity;

  for (const axis of unlockedAxes) {
    const conf = confidence(session.thetas[axis]);
    const recentAxisPenalty = session.recentAxes.filter(a => a === axis).length * 0.2;

    // 候補問（未出題・同軸・self視点）
    const candidates = AXIS_QUESTIONS.filter(
      q => q.axis === axis && !session.asked.has(q.id)
    );
    if (candidates.length === 0) continue;

    // dontknow3連続なら altOf のある問を優先
    const dkStreak = session.dontknowStreak[axis] ?? 0;

    for (const q of candidates) {
      const recentAnglePenalty = session.recentAngles.filter(a => a === q.angle).length * 0.1;
      const altBonus = dkStreak >= 2 && q.altOf ? 0.3 : 0;
      const priority = (1 - conf) - recentAxisPenalty - recentAnglePenalty + altBonus;

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
 * @param {Session} session
 * @returns {object|null}
 */
export function selectNext(session) {
  if (session.questionCount >= session.maxQuestions) return null;

  // 全軸確定後は残りバイアス枠（最大4問）
  if (session.lockedAxes.size === 4) {
    return pickBiasQuestion(session);
  }

  // 軸問4問ごとにバイアス問を挟む
  if (shouldInsertBias(session)) {
    const biasQ = pickBiasQuestion(session);
    if (biasQ) return biasQ;
  }

  return pickAxisQuestion(session);
}

/**
 * セッション終了判定
 */
export function isFinished(session) {
  if (session.questionCount >= session.maxQuestions) return true;
  if (session.lockedAxes.size === 4) {
    // 全軸確定済みでバイアス追加問も出し切った
    const remainBias = BIAS_QUESTIONS.filter(q => !session.asked.has(q.id));
    const biasAsked = session.history.filter(h => h.axis === null).length;
    return biasAsked >= 4 || remainBias.length === 0;
  }
  return false;
}
