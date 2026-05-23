// 結果生成 — 行動パターン予測を起点にした「オラクル体験」
// タイプは「なぜそうなるか」の説明として脇役で登場する

import { ACCIDENTS } from '../data_v2/meta/accidents.js';
import { cognitiveFunctionMap, famousPeople, biasInfo } from '../data_v2/index.js';
import { topBiases } from './biasScorer.js';

// ── 感情トリガーラベル ──────────────────────────────────────────
const TRIGGER_LABELS = {
  rejected: '否定される',
  ignored:  '放置される',
  compared: '比較される',
  rushed:   '急かされる',
  expected: '期待される',
};

// ── 軸の短い説明 ────────────────────────────────────────────────
const AXIS_LABEL = {
  E: '外向き',
  I: '内向き',
  S: '事実重視',
  N: '可能性重視',
  T: '論理判断',
  F: '感情判断',
  J: '計画志向',
  P: '柔軟志向',
};

// ── スコア上位 n 件を取得 ───────────────────────────────────────

function getTopAccidentKey(accidentScores) {
  const entries = Object.entries(accidentScores ?? {})
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a);
  return entries.length > 0 ? entries[0][0] : null;
}

function getTopTriggerKeys(triggerScores, n = 2) {
  return Object.entries(triggerScores ?? {})
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([key]) => key);
}

// ── オープニング（見透かし感）────────────────────────────────────

function buildOpening(topTriggers) {
  if (topTriggers.length === 0) {
    return '回答のパターンから、あなたの動き方が見えてきました。';
  }
  const labels = topTriggers.map(k => `「${TRIGGER_LABELS[k] ?? k}」`);
  if (labels.length === 1) {
    return `あなたは ${labels[0]} という状況に、特に強く反応するタイプです。`;
  }
  return `あなたは ${labels[0]} や ${labels[1]} という状況に、特に強く反応するタイプです。`;
}

// ── なぜ説明（バイアス＋タイプ）────────────────────────────────

function buildWhyExplanation(mbtiType, top2BiasKeys) {
  const biasNames = top2BiasKeys
    .map(k => biasInfo[k]?.name ?? k)
    .filter(Boolean);

  const axisDesc = mbtiType
    ? [AXIS_LABEL[mbtiType[2]], AXIS_LABEL[mbtiType[3]]].filter(Boolean).join('・')
    : null;

  if (biasNames.length > 0 && axisDesc) {
    return `背景には ${biasNames.join('・')} が強く働いています。${axisDesc}の動き方と組み合わさることで、このパターンが生まれやすくなっています。`;
  }
  if (biasNames.length > 0) {
    return `背景には ${biasNames.join('・')} が強く働いています。`;
  }
  if (axisDesc) {
    return `${axisDesc}の動き方が、このパターンを生みやすくしています。`;
  }
  return 'あなたの動き方のクセが、このパターンに影響しています。';
}

// ── 公開API ──────────────────────────────────────────────────────

/**
 * 結果画面に渡すデータをすべて返す
 */
export function buildResultData(result) {
  const { mbtiType, biasScores, accidentScores, triggerScores } = result;

  const topAccidentKey = getTopAccidentKey(accidentScores ?? {});
  const accident = topAccidentKey ? (ACCIDENTS[topAccidentKey] ?? null) : null;

  const topTriggerKeys = getTopTriggerKeys(triggerScores ?? {});
  const top2BiasKeys = topBiases(biasScores ?? {}, 2);

  const famous = (famousPeople[mbtiType] ?? { people: [] }).people ?? [];

  return {
    // オープニング
    opening: buildOpening(topTriggerKeys),

    // 行動パターン予測（メイン）
    accident,
    accidentKey: topAccidentKey,

    // なぜ説明
    whyExplanation: buildWhyExplanation(mbtiType, top2BiasKeys),

    // バイアス詳細
    topBiases: top2BiasKeys.map(k => ({
      key: k,
      name: biasInfo[k]?.name ?? k,
      short: biasInfo[k]?.short ?? '',
    })).filter(b => b.name !== b.key),

    // タイプ（脇役として）
    mbtiType,
    mbtiAxisLabel: mbtiType
      ? `${AXIS_LABEL[mbtiType[0]]}・${AXIS_LABEL[mbtiType[2]]}・${AXIS_LABEL[mbtiType[3]]}`
      : '',
    famousPeople: famous.slice(0, 2),
  };
}
