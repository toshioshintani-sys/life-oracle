// ロジットスコアラー（純粋関数）
// θ: 各軸のlog-odds。正 = 左極寄り（E/S/T/J）、負 = 右極寄り（I/N/F/P）

const LEFT_POLES = new Set(['E', 'S', 'T', 'J']);

/** poleがどちらの方向か: 左極(E/S/T/J)なら+1、右極なら-1 */
function poleSign(pole) {
  return LEFT_POLES.has(pole) ? 1 : -1;
}

/**
 * θを更新する
 * @param {number} theta - 現在のθ
 * @param {'E'|'I'|'S'|'N'|'T'|'F'|'J'|'P'} pole - 質問のpole
 * @param {1|0|-1} response - yes=1, dontknow=0, no=-1
 * @param {number} weight - 質問のweight
 * @returns {number} 新しいθ
 */
export function updateTheta(theta, pole, response, weight) {
  return theta + poleSign(pole) * response * weight;
}

/**
 * θから確信度を計算（0〜1）
 * θ=0 → 0.0（不明）、θ=±2 → ~0.76、θ=±3 → ~0.91
 */
export function confidence(theta) {
  return Math.abs(Math.tanh(theta / 2));
}

/**
 * θから確定タイプ文字を返す
 * 正 = 左極（E/S/T/J）、負 = 右極（I/N/F/P）
 */
export function resolveAxis(axis, theta) {
  const map = {
    EI: theta >= 0 ? 'E' : 'I',
    SN: theta >= 0 ? 'S' : 'N',
    TF: theta >= 0 ? 'T' : 'F',
    JP: theta >= 0 ? 'J' : 'P',
  };
  return map[axis];
}

/** 4軸すべてのMBTIタイプ文字列を返す */
export function buildType(thetas) {
  return (
    resolveAxis('EI', thetas.EI) +
    resolveAxis('SN', thetas.SN) +
    resolveAxis('TF', thetas.TF) +
    resolveAxis('JP', thetas.JP)
  );
}

/** 確定閾値: confidence >= 0.75 で軸確定 */
export const CONFIDENCE_THRESHOLD = 0.75;

/** 早期確定閾値: |θ| >= 3 かつ同方向3連続 */
export const EARLY_LOCK_THETA = 3;
