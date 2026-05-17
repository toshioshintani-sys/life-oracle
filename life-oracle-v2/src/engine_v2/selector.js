// 次問選択エンジン（純粋関数）
//
// 設計原則：
//
// ① 序盤（Q1〜Q8）は subIntent.axisPriority × anglePriority に従って選ぶ
//    ユーザーが「仕事量・締切のプレッシャー」と答えた → JP軸を最初に探索し
//    work/stress 角度の質問から始める。
//    これにより「自分の悩みを聞かれている」感が生まれる。
//
// ② 中盤以降（Q9〜）は情報量最大化（確信度が低い軸を優先）に移行する。
//    subIntent ボーナスを徐々に弱め、全軸でバランスよく測る。
//
// ③ angle 過剰出題ペナルティで同じ角度に偏らないようにする。
//
// この2段階設計がアキネーターの「絞り込み感」を再現する：
//   第1問（intent）→ 大分類
//   第2問（subIntent）→ 中分類
//   Q1〜Q8 → subIntent に沿った集中診断
//   Q9〜   → 残り軸の補足

import { confidence } from './scorer.js';
import { AXIS_QUESTIONS, BIAS_QUESTIONS } from '../data_v2/index.js';

const AXES = ['EI', 'SN', 'TF', 'JP'];
const ALL_ANGLES = ['work', 'relation', 'stress', 'choice'];

// 序盤フェーズの境界（これ以降は純粋に確信度ベースに移行）
const FOCUS_PHASE_END = 8;

/**
 * 軸選択スコアを計算する
 *
 * スコア = (1 - confidence)          … 不確かな軸ほど高い
 *         + axisPriorityBonus        … 序盤は subIntent の優先軸を先に探る
 *         - recentAxisPenalty        … 直前と同じ軸は避ける
 */
function axisScore(axis, session) {
  const conf = confidence(session.thetas[axis]);
  const recentPenalty = session.recentAxes.filter(a => a === axis).length * 0.25;

  // 序盤は axisPriority の順位でボーナス（1位=+0.6、2位=+0.3、3位=0、4位=-0.1）
  const priorityBonus = (() => {
    if (session.questionCount >= FOCUS_PHASE_END) return 0;
    const rank = (session.axisPriority ?? AXES).indexOf(axis);
    const decay = 1 - session.questionCount / FOCUS_PHASE_END;
    return ([0.6, 0.3, 0, -0.1][rank] ?? 0) * decay;
  })();

  return (1 - conf) + priorityBonus - recentPenalty;
}

/**
 * 質問選択スコアを計算する（同軸の候補の中から最善の1問を選ぶ）
 *
 * スコア = anglePriorityBonus     … 序盤は subIntent の優先 angle を先に出す
 *         - angleOverusePenalty   … 使いすぎた angle はペナルティ
 *         + altBonus              … わからない連続時は alt 問を優先
 */
function questionScore(q, session) {
  // angle 全体の出題回数を集計
  const angleCounts = {};
  ALL_ANGLES.forEach(a => { angleCounts[a] = 0; });
  session.history
    .filter(h => h.axis !== null && h.angle)
    .forEach(h => { angleCounts[h.angle] = (angleCounts[h.angle] ?? 0) + 1; });
  const maxCount = Math.max(...Object.values(angleCounts), 0);

  // 過剰出題ペナルティ
  const overuse = maxCount > 0 ? (angleCounts[q.angle] ?? 0) / (maxCount + 1) : 0;
  const overusePenalty = overuse * 0.35;

  // 序盤は anglePriority の順位でボーナス（1位=+0.5、2位=+0.2、3位=0、4位=-0.1）
  const anglePriorityBonus = (() => {
    if (session.questionCount >= FOCUS_PHASE_END) return 0;
    const priority = session.anglePriority ?? ALL_ANGLES;
    const rank = priority.indexOf(q.angle);
    const decay = 1 - session.questionCount / FOCUS_PHASE_END;
    return ([0.5, 0.2, 0, -0.1][rank] ?? 0) * decay;
  })();

  // わからない3連続なら alt 問を優先
  const dkStreak = session.dontknowStreak[q.axis] ?? 0;
  const altBonus = dkStreak >= 2 && q.altOf ? 0.35 : 0;

  return anglePriorityBonus - overusePenalty + altBonus;
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

/** 次に出題する軸問を選ぶ */
function pickAxisQuestion(session) {
  const unlockedAxes = AXES.filter(ax => !session.lockedAxes.has(ax));
  if (unlockedAxes.length === 0) return null;

  let best = null;
  let bestScore = -Infinity;

  // まず軸を選ぶ（軸スコアが最高の軸）
  const rankedAxes = unlockedAxes
    .map(ax => ({ ax, score: axisScore(ax, session) }))
    .sort((a, b) => b.score - a.score);

  // 上位軸から順に「出せる問がある軸」を探し、その軸の最善問を選ぶ
  for (const { ax } of rankedAxes) {
    const candidates = AXIS_QUESTIONS.filter(
      q => q.axis === ax && !session.asked.has(q.id)
    );
    if (candidates.length === 0) continue;

    // この軸の候補問の中で最善のものを選ぶ
    for (const q of candidates) {
      const score = questionScore(q, session);
      if (score > bestScore) {
        bestScore = score;
        best = q;
      }
    }

    // 軸スコアが最高の軸で候補が見つかったらそこで止める
    // （確信度の低い軸の質問を優先するため）
    if (best) break;
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
