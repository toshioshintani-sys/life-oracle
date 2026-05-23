// バイアス並走スコアラー（純粋関数）
// バイアス質問はpole=nullのため、yes=1で必ずそのバイアスのスコアが上がる

/**
 * バイアス質問への回答でbiasScoresを更新する
 * @param {object} biasScores - セッションのbiasScores
 * @param {object} question - kind='bias'の質問オブジェクト
 * @param {1|0|-1} response
 * @returns {object} 更新後のbiasScores（新オブジェクト）
 */
export function updateBiasScore(biasScores, question, response) {
  if (question.kind !== 'bias' || !question.bias) return biasScores;
  const key = question.bias;
  const delta = response === 1 ? question.weight : 0;
  return {
    ...biasScores,
    [key]: (biasScores[key] ?? 0) + delta,
  };
}

/**
 * バイアスを得点降順でソートして返す
 * @param {object} biasScores
 * @returns {Array<{bias, score}>}
 */
export function rankBiases(biasScores) {
  return Object.entries(biasScores)
    .map(([bias, score]) => ({ bias, score }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);
}

/**
 * 上位Nバイアスのキーを返す
 */
export function topBiases(biasScores, n = 2) {
  return rankBiases(biasScores).slice(0, n).map(({ bias }) => bias);
}
