// ロジットスコアラー（純粋関数）
// θ: 各軸のlog-odds。正 = 左極寄り（E/S/T/J）、負 = 右極寄り（I/N/F/P）

// ── 行動パターンスコアリング用マッピングテーブル ────────────────────
// poleごとの事故・トリガー寄与（weight × response で乗算）

const POLE_ACCIDENT_MAP = {
  I: { burnout: 0.4 },
  E: {},
  N: { burnout: 0.3, jobLoop: 0.3 },
  S: {},
  F: { explosion: 0.8, selfNegation: 0.6 },
  T: {},
  P: { procrastination: 0.7, impulse: 0.5 },
  J: { burnout: 0.7 },
};

const POLE_TRIGGER_MAP = {
  I: { ignored: 0.4 },
  E: {},
  N: { expected: 0.4 },
  S: {},
  F: { rejected: 0.6, compared: 0.4 },
  T: {},
  P: {},
  J: { rushed: 0.4 },
};

const BIAS_ACCIDENT_MAP = {
  B1: { explosion: 1.8, jobLoop: 1.2, selfNegation: 0.8 },
  B2: { procrastination: 2.0, impulse: 1.8 },
  B6: { burnout: 1.8, jobLoop: 2.2 },
  B8: { jobLoop: 1.5, selfNegation: 1.8, impulse: 0.8 },
};

const BIAS_TRIGGER_MAP = {
  B1: { rejected: 1.8, ignored: 0.6 },
  B2: { rushed: 0.6 },
  B6: { rushed: 1.2 },
  B8: { compared: 0.8 },
};

/**
 * 1問の回答から事故・トリガースコアを更新する（破壊的）
 * @param {Session} session
 * @param {object} question
 * @param {1|0|-1} response
 */
export function updatePatternScores(session, question, response) {
  if (response === 0) return; // dontknow → no update

  // 究極の選択型質問は自前フィールドを優先
  if (question.accidents) {
    for (const [key, w] of Object.entries(question.accidents)) {
      session.accidentScores[key] = (session.accidentScores[key] ?? 0)
        + w * response * (question.weight ?? 1.0);
    }
  }
  if (question.triggers) {
    for (const [key, w] of Object.entries(question.triggers)) {
      session.triggerScores[key] = (session.triggerScores[key] ?? 0)
        + w * response * (question.weight ?? 1.0);
    }
  }

  if (question.accidents || question.triggers) return; // situation問題は上で完結

  let accMap, trigMap;
  if (question.kind === 'axis' && question.pole) {
    accMap = POLE_ACCIDENT_MAP[question.pole] ?? {};
    trigMap = POLE_TRIGGER_MAP[question.pole] ?? {};
  } else if (question.kind === 'bias' && question.bias) {
    accMap = BIAS_ACCIDENT_MAP[question.bias] ?? {};
    trigMap = BIAS_TRIGGER_MAP[question.bias] ?? {};
  } else {
    return;
  }

  for (const [key, w] of Object.entries(accMap)) {
    session.accidentScores[key] = (session.accidentScores[key] ?? 0)
      + w * response * (question.weight ?? 1.0);
  }
  for (const [key, w] of Object.entries(trigMap)) {
    session.triggerScores[key] = (session.triggerScores[key] ?? 0)
      + w * response * (question.weight ?? 1.0);
  }
}

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
