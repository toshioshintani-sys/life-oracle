// Flow診断エンジン
// ChatGPT設計案をベースに実装

import { FLOW_QUESTIONS } from '../data_v2/flow/questions.js';
import { FLOW_RESULT_TEXTS, FLOW_COMBINATION_NOTES } from '../data_v2/flow/results.js';

const ALL_FLOWS = ['over_adaptation', 'avoidance', 'stagnation', 'self_denial', 'impulse', 'recovery'];

/** 初期Flowセッション */
export function createFlowSession(intent) {
  return {
    intent,
    flowScores: Object.fromEntries(ALL_FLOWS.map(f => [f, 0])),
    tags: [],
    history: [], // [{questionId, choiceId}]
    answeredCount: 0,
  };
}

/** 回答を記録してスコアを更新する（破壊的） */
export function recordFlowAnswer(session, question, choice) {
  for (const [flow, score] of Object.entries(choice.scores ?? {})) {
    session.flowScores[flow] = (session.flowScores[flow] ?? 0) + score;
  }
  if (choice.tags) {
    session.tags.push(...choice.tags);
  }
  session.history.push({ questionId: question.id, choiceId: choice.id });
  session.answeredCount += 1;
}

/** 終了判定 */
export function shouldFinish(session) {
  const { answeredCount, flowScores } = session;
  if (answeredCount >= 12) return true;

  const sorted = Object.values(flowScores).sort((a, b) => b - a);
  const top = sorted[0] ?? 0;
  const second = sorted[1] ?? 0;
  if (answeredCount >= 6 && top - second >= 4) return true;

  return false;
}

/** 次の質問を返す（null = 終了） */
export function getNextFlowQuestion(session) {
  // 最初の質問はintentから決める
  if (session.history.length === 0) {
    return (
      FLOW_QUESTIONS.find(q => q.startFor === session.intent) ??
      FLOW_QUESTIONS.find(q => q.startFor === 'relation_conflict')
    );
  }

  const last = session.history[session.history.length - 1];
  const lastQ = FLOW_QUESTIONS.find(q => q.id === last.questionId);
  const lastChoice = lastQ?.choices.find(c => c.id === last.choiceId);

  // nextQuestionId 指定があればそこへ
  if (lastChoice?.nextQuestionId) {
    const next = FLOW_QUESTIONS.find(q => q.id === lastChoice.nextQuestionId);
    if (next && !session.history.some(h => h.questionId === next.id)) {
      return next;
    }
  }

  // スコア差が小さければ深掘り問を選ぶ
  const sorted = Object.entries(session.flowScores).sort(([, a], [, b]) => b - a);
  const topFlow = sorted[0][0];
  const secondFlow = sorted[1]?.[0];
  const gap = (sorted[0][1] ?? 0) - (sorted[1]?.[1] ?? 0);

  if (gap < 3 && secondFlow) {
    const deep = FLOW_QUESTIONS.find(q =>
      q.layer === 'emotion' &&
      q.targetFlows.includes(topFlow) &&
      q.targetFlows.includes(secondFlow) &&
      !session.history.some(h => h.questionId === q.id),
    );
    if (deep) return deep;
  }

  return null;
}

/** 診断結果を生成する */
export function buildFlowResult(session) {
  const sorted = Object.entries(session.flowScores).sort(([, a], [, b]) => b - a);
  const primaryFlow = sorted[0][0];
  const secondaryScore = sorted[1]?.[1] ?? 0;
  const secondaryFlow = secondaryScore > 0 ? sorted[1][0] : null;

  const totalPositive = Object.values(session.flowScores).filter(v => v > 0).reduce((a, b) => a + b, 0);
  const topScore = sorted[0][1] ?? 0;
  const confidence = totalPositive > 0 ? Math.min(topScore / totalPositive, 1) : 0.5;

  const primary = FLOW_RESULT_TEXTS[primaryFlow];
  const secondary = secondaryFlow ? FLOW_RESULT_TEXTS[secondaryFlow] : null;

  const combinationKey = secondaryFlow
    ? [primaryFlow, secondaryFlow].sort().join('_')
    : null;
  const combinationNote = combinationKey
    ? (FLOW_COMBINATION_NOTES[`${primaryFlow}_${secondaryFlow}`] ??
       FLOW_COMBINATION_NOTES[`${secondaryFlow}_${primaryFlow}`] ?? null)
    : null;

  return {
    primaryFlow,
    secondaryFlow,
    confidence,
    primary,
    secondary,
    combinationNote,
    tags: session.tags,
    intent: session.intent,
    answeredCount: session.answeredCount,
  };
}
