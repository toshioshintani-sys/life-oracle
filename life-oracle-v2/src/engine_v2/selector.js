// 次問選択エンジン（純粋関数）
//
// 設計原則：
// ① ユーザーが選んだ intent に合う angle の質問を優先する（特に序盤）
//    「仕事のストレス」を選んだ人には、まず work・stress 角度の質問を出す。
//    これにより「自分の悩みについて聞かれている」感が生まれる。
// ② 診断が進むにつれて intent ボーナスを弱め、全角度でバランスよく測る。
// ③ 確信度が低い軸を優先し、同軸・同 angle の連続を避ける。

import { confidence } from './scorer.js';
import { AXIS_QUESTIONS, BIAS_QUESTIONS } from '../data_v2/index.js';

const AXES = ['EI', 'SN', 'TF', 'JP'];
const ANGLES = ['work', 'relation', 'stress', 'choice'];

// intent → 序盤で優先する angle の順序
const INTENT_ANGLES = {
  work_stress:       ['work', 'stress', 'relation', 'choice'],
  relation_conflict: ['relation', 'stress', 'work', 'choice'],
  self_understand:   ['stress', 'choice', 'relation', 'work'],
  future_decision:   ['choice', 'stress', 'work', 'relation'],
};

/**
 * intent × questionCount から angle ボーナスを計算する
 * 序盤（Q1〜Q6）は intent 一致 angle を強く優先し、中盤以降は自然に均等化する
 */
function intentAngleBonus(intent, angle, questionCount) {
  const priority = INTENT_ANGLES[intent] ?? ANGLES;
  const rank = priority.indexOf(angle); // 0=最優先, 3=最後
  if (rank === -1) return 0;

  // 序盤ほどボーナスが大きい（Q6以降はほぼ消える）
  const decay = Math.max(0, 1 - questionCount / 8);
  const base = [0.50, 0.20, 0.00, -0.10][rank] ?? 0;
  return base * decay;
}

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
 *          - 0.30 × (angle 全体での過剰出題度)
 *          + intentAngleBonus（序盤のみ）
 *          + altBonus（わからない連続時）
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
      const angleOveruse = maxAngleCount > 0
        ? (angleCounts[q.angle] ?? 0) / (maxAngleCount + 1)
        : 0;
      const anglePenalty = angleOveruse * 0.30;

      const iBonus = intentAngleBonus(
        session.intent, q.angle, session.questionCount
      );
      const altBonus = dkStreak >= 2 && q.altOf ? 0.3 : 0;

      const priority =
        (1 - conf) - recentAxisPenalty - anglePenalty + iBonus + altBonus;

      if (priority > bestPriority) {
        bestPriority = priority;
        best = q;
      }
    }
  }

  return best;
}

/** 次の質問を選んで返す */
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
