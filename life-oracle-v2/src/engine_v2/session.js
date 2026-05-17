// セッション状態オブジェクト

/**
 * 初期セッションを生成する
 * @param {'self'|'observe'} flow
 * @returns {Session}
 */
export function createSession(flow = 'self') {
  return {
    flow,

    // 軸ごとのロジットスコア（初期 0 = 確率0.5 = 完全不明）
    thetas: { EI: 0, SN: 0, TF: 0, JP: 0 },

    // 軸ごとの確信度（0〜1）
    confidences: { EI: 0, SN: 0, TF: 0, JP: 0 },

    // 確定済み軸のセット
    lockedAxes: new Set(),

    // バイアス得点（B1〜B12 各0から加算）
    biasScores: {
      B1: 0, B2: 0, B3: 0, B4: 0,
      B5: 0, B6: 0, B7: 0, B8: 0,
      B9: 0, B10: 0, B11: 0, B12: 0,
    },

    // 出題済み質問IDのセット
    asked: new Set(),

    // 回答履歴（{questionId, response, axis, pole, weight} の配列）
    history: [],

    // 軸ごとの連続同方向回答カウント（早期確定用）
    streak: { EI: 0, SN: 0, TF: 0, JP: 0 },

    // 軸ごとの「わからない」連続カウント
    dontknowStreak: { EI: 0, SN: 0, TF: 0, JP: 0 },

    // 直前2問の {axis, angle} — 同軸・同angle連続を避けるため
    recentAxes: [],
    recentAngles: [],

    // 出題総数
    questionCount: 0,

    // 最大出題数（バイアス込み）
    maxQuestions: 22,

    // ユーザーが申告した「知りたいこと」（Entry画面の選択）
    intent: null,
  };
}

/**
 * 回答を記録してセッションを更新する（破壊的）
 * @param {Session} session
 * @param {object} question
 * @param {1|0|-1} response
 */
export function recordAnswer(session, question, response) {
  session.asked.add(question.id);
  session.history.push({
    questionId: question.id,
    response,
    axis: question.axis,
    angle: question.angle,
    pole: question.pole,
    weight: question.weight,
  });

  session.recentAxes = [question.axis, ...session.recentAxes].slice(0, 2);
  session.recentAngles = [question.angle, ...session.recentAngles].slice(0, 2);
  session.questionCount += 1;
}
