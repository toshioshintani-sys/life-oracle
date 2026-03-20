import { questions } from '../data/questions.js';
import { biasQuestions } from '../data/biasQuestions.js';

// 回答値: 0=強くそう, 1=ややそう, 2=ややちがう, 3=強くちがう

// 各軸8問 × 最大3点 = 最大24点
// 13点以上 → 左極（E/S/T/J）、12点以下 → 右極（I/N/F/P）

/**
 * 傾向の強さを返す（結果画面のコメント用）
 * @param {number} score 0〜24
 * @returns {string}
 */
export function getTendencyLabel(score) {
  if (score >= 20) return '強い傾向';
  if (score >= 16) return 'やや傾向あり';
  if (score >= 13) return 'わずかに傾向あり';
  if (score >= 10) return 'わずかに逆側';
  if (score >= 5)  return 'やや逆側傾向';
  return '強い逆側傾向';
}

/**
 * 全問の回答からMBTI各軸スコアを算出する
 * @param {{ [questionId: string]: 0|1|2|3 }} answers
 * @returns {{
 *   E: boolean, S: boolean, T: boolean, J: boolean,
 *   scores: { EI: number, SN: number, TF: number, JP: number }
 * }}
 */
export function calcScore(answers) {
  const axisScores = { EI: 0, SN: 0, TF: 0, JP: 0 };

  for (const q of questions) {
    const value = answers[q.id];
    if (value === undefined) continue;

    // ANSWER_VALUES: 強くそう=0, ややそう=1, ややちがう=2, 強くちがう=3
    // 通常項目: 強くそう→3点なので (3 - value)
    // 逆転項目: 強くそう→0点なので value のまま
    const point = q.reversed ? value : (3 - value);
    axisScores[q.axis] += point;
  }

  return {
    E: axisScores.EI >= 13, // true=E, false=I
    S: axisScores.SN >= 13, // true=S, false=N
    T: axisScores.TF >= 13, // true=T, false=F
    J: axisScores.JP >= 13, // true=J, false=P
    scores: axisScores,
  };
}

/**
 * バイアス測定回答からスコアと上位2バイアスIDを返す
 * @param {{ [questionId: string]: 0|1|2|3 }} answers
 * @returns {{ scores: Record<string,number>, top2: [string, string] }}
 */
export function calcBiasScores(answers) {
  const scores = { B1: 0, B2: 0, B3: 0, B4: 0, B5: 0, B6: 0, B7: 0, B8: 0 };

  for (const q of biasQuestions) {
    const value = answers[q.id];
    if (value === undefined) continue;
    // 強くそう(0) → 3点（高バイアス）、強くちがう(3) → 0点
    const point = q.reversed ? value : (3 - value);
    scores[q.bias] += point;
  }

  // 降順ソート。同点はID順（B1優先）
  const ranked = Object.entries(scores)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  return {
    scores,
    top2: [ranked[0][0], ranked[1][0]], // 例: ['B3', 'B1']
  };
}

/**
 * バイアス情報マスター
 */
export const biasInfo = {
  B1: {
    name: '損失回避',
    short: '失うことへの恐れが強い',
    description: '得ることより失うことを約2倍重く感じるバイアス。リスクを避けすぎたり、手放せないものを抱えすぎたりしやすい。',
    messageKey: 'loss_high',
  },
  B2: {
    name: '現在バイアス',
    short: '今この瞬間を優先しすぎる',
    description: '将来の大きな利益より、今すぐの小さな満足を選んでしまうバイアス。先延ばしや衝動的な行動につながりやすい。',
    messageKey: 'present_low',
  },
  B3: {
    name: '確証バイアス',
    short: '信じたいものだけを集める',
    description: '自分の考えを支持する情報を無意識に優先するバイアス。反証を見落としやすく、判断が偏ることがある。',
    messageKey: 'confirmation',
  },
  B4: {
    name: '同調バイアス',
    short: '周囲の流れに乗りやすい',
    description: '多数派の意見や行動に合わせようとするバイアス。社会的なつながりを大切にする反面、自分の判断が薄れやすい。',
    messageKey: 'social',
  },
  B5: {
    name: '過信バイアス',
    short: '自分を実力以上に見積もる',
    description: '自分の能力や判断を平均より高く見積もるバイアス。行動力につながる一方、リスク管理が甘くなりやすい。',
    messageKey: 'overconfidence',
  },
  B6: {
    name: '現状維持バイアス',
    short: '変化より現状を選びやすい',
    description: '慣れ親しんだ状態を変えることへの抵抗感。安定志向の反面、必要な変化を先送りにしやすい。',
    messageKey: 'status_quo',
  },
  B7: {
    name: 'アンカリング',
    short: '最初の数字・情報に引っ張られる',
    description: '最初に提示された情報を基準にして判断するバイアス。価格交渉や比較判断で無意識に影響を受けやすい。',
    messageKey: 'anchoring',
  },
  B8: {
    name: '感情ヒューリスティック',
    short: '気分が判断を左右しやすい',
    description: '論理より感情・直感で判断するバイアス。直感が当たることも多い一方、気分に判断が振り回されやすい。',
    messageKey: 'sunk_cost',
  },
};

/**
 * 16タイプ文字列を返す（例: 'ESTJ', 'INFP'）
 * @param {{ E: boolean, S: boolean, T: boolean, J: boolean }} result
 * @returns {string}
 */
export function getTypeName(result) {
  return (result.E ? 'E' : 'I')
       + (result.S ? 'S' : 'N')
       + (result.T ? 'T' : 'F')
       + (result.J ? 'J' : 'P');
}
