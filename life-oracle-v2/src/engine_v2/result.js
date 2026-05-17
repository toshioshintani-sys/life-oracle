// 結果生成（物語テキスト生成）
// MBTIタイプ + バイアスTop2 + ユーザーのintentを組み合わせて説明文を構築

import { cognitiveFunctionMap, famousPeople, biasInfo } from '../data_v2/index.js';
import { topBiases } from './biasScorer.js';

/**
 * 結果画面に渡すデータをまとめて返す
 * @param {{ mbtiType, thetas, confidences, biasScores, intent }} result
 */
export function buildResultData(result) {
  const { mbtiType, biasScores, intent } = result;

  const cogMap = cognitiveFunctionMap[mbtiType] ?? {};
  const famous = famousPeople[mbtiType] ?? { people: [] };
  const top2Biases = topBiases(biasScores, 2);

  return {
    mbtiType,
    lightName: cogMap.lightName ?? '',
    shadowName: cogMap.shadowName ?? '',
    dominant: cogMap.dominant ?? '',
    todayAction: cogMap.todayAction ?? '',
    famousPeople: famous.people,
    topBiases: top2Biases.map(b => ({
      key: b,
      ...biasInfo[b],
    })),
    intent,
    // 確信度を百分率でUIに渡す
    axisStrength: result.confidences,
  };
}

/**
 * ユーザーのintentに応じた冒頭一文を生成する
 * 「なぜ当たったか」に繋がるナラティブの起点
 */
export function intentNarrative(intent, mbtiType) {
  const narratives = {
    work_stress:       `仕事でのモヤモヤには、あなたの${mbtiType}ならではの動き方が関係しています。`,
    relation_conflict: `人間関係の難しさの裏に、あなた固有のコミュニケーションパターンがあります。`,
    self_understand:   `「なぜ自分はこうなのか」—その答えは、あなたの思考の構造にあります。`,
    future_decision:   `先が見えない不安は、あなたの意思決定スタイルを知ることで軽くなります。`,
    default:           `あなたの行動パターンには、これだけ明確な理由があります。`,
  };
  return narratives[intent] ?? narratives.default;
}
