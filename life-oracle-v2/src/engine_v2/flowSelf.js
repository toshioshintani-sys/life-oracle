// 内省型フロー（self）
// 軸スコア更新 → 確定判定 → 次問選択 を一元管理

import {
  updateTheta,
  updatePatternScores,
  confidence,
  buildType,
  CONFIDENCE_THRESHOLD,
  EARLY_LOCK_THETA,
} from './scorer.js';
import { updateBiasScore } from './biasScorer.js';
import { recordAnswer } from './session.js';
import { selectNext, isFinished } from './selector.js';

/**
 * ユーザーの回答を処理してセッションを更新する
 * @param {Session} session - 現在のセッション（破壊的更新）
 * @param {object} question - 出題された質問
 * @param {1|0|-1} response - yes=1, dontknow=0, no=-1
 * @returns {Session} 更新後のセッション（同一参照）
 */
export function applyAnswer(session, question, response) {
  recordAnswer(session, question, response);

  if (question.kind === 'axis' && question.axis) {
    const axis = question.axis;

    // θ更新
    session.thetas[axis] = updateTheta(
      session.thetas[axis],
      question.pole,
      response,
      question.weight,
    );

    // 確信度更新
    session.confidences[axis] = confidence(session.thetas[axis]);

    // dontknowストリーク管理
    if (response === 0) {
      session.dontknowStreak[axis] = (session.dontknowStreak[axis] ?? 0) + 1;
    } else {
      session.dontknowStreak[axis] = 0;
    }

    // 連続同方向ストリーク管理（早期確定用）
    if (response !== 0) {
      const sign = response > 0 ? 1 : -1;
      const prevStreak = session.streak[axis] ?? 0;
      const prevSign = prevStreak > 0 ? 1 : prevStreak < 0 ? -1 : 0;
      session.streak[axis] = sign === prevSign ? prevStreak + sign : sign;
    }

    // 確定チェック
    if (!session.lockedAxes.has(axis)) {
      const locked =
        session.confidences[axis] >= CONFIDENCE_THRESHOLD ||
        Math.abs(session.thetas[axis]) >= EARLY_LOCK_THETA ||
        (session.dontknowStreak[axis] ?? 0) >= 3;

      if (locked) session.lockedAxes.add(axis);
    }
  }

  if (question.kind === 'bias') {
    session.biasScores = updateBiasScore(session.biasScores, question, response);
  }

  // 全質問に対して事故・トリガースコアを更新
  updatePatternScores(session, question, response);

  return session;
}

/**
 * 次の質問を取得する
 * @param {Session} session
 * @returns {object|null} 質問オブジェクト、またはnull（診断終了）
 */
export function nextQuestion(session) {
  if (isFinished(session)) return null;
  return selectNext(session);
}

/**
 * 診断結果を生成する
 * @param {Session} session
 * @returns {{ mbtiType, thetas, confidences, biasScores }}
 */
export function buildResult(session) {
  return {
    mbtiType: buildType(session.thetas),
    thetas: { ...session.thetas },
    confidences: { ...session.confidences },
    biasScores: { ...session.biasScores },
    triggerScores: { ...session.triggerScores },
    accidentScores: { ...session.accidentScores },
    questionCount: session.questionCount,
    intent: session.intent,
    subIntent: session.subIntent,
  };
}
