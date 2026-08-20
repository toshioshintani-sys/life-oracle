// セッション状態オブジェクト

// 診断で測れる行動経済学バイアス（biasInfo の B1〜B12 と対応）
export const ALL_BIAS_IDS = [
  'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11', 'B12',
  // 2026-08-06に12個へ拡張したのに続き、2026-08-21 になじみのある8個を追加。
  // noteのマガジン35個に対しアプリが12個しか測れていなかったギャップを埋める。
  'B13', 'B14', 'B15', 'B16', 'B17', 'B18', 'B19', 'B20',
];

// 1セッションで出題するバイアスの数。
// 2000セッションのシミュレーションで 4/5/6/8 を比較し、4 が最良だった（2026-08-06）:
//   pool=4 → 1バイアスあたり3.50問・上位2件の同点率23.4%・バイアス間の偏り1.36倍
//   pool=6 → 2.50問・33.8%・1.91倍 ／ pool=8 → 2.00問・64.9%・2.63倍
// 4 なら拡張前（4バイアス固定×約4問）と同じ観測数を保てるため、診断の精度を落とさずに
// 測れるバイアスだけを3倍にできる。どの4個を聞くかは毎回抽選なので12個すべてが世に出る。
export const BIAS_POOL_SIZE = 4;

/**
 * 12個のバイアスから BIAS_POOL_SIZE 個を抽選する（Fisher-Yates）
 * @returns {string[]}
 */
export function pickBiasPool() {
  const ids = [...ALL_BIAS_IDS];
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.slice(0, BIAS_POOL_SIZE);
}

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
      B13: 0, B14: 0, B15: 0, B16: 0,
      B17: 0, B18: 0, B19: 0, B20: 0,
    },

    // 感情トリガースコア（rejected/ignored/compared/rushed/expected）
    triggerScores: {
      rejected: 0,  // 否定される
      ignored: 0,   // 放置される
      compared: 0,  // 比較される
      rushed: 0,    // 急かされる
      expected: 0,  // 期待される
    },

    // 行動事故スコア（burnout/jobLoop/explosion/procrastination/impulse/selfNegation）
    accidentScores: {
      burnout: 0,
      jobLoop: 0,
      explosion: 0,
      procrastination: 0,
      impulse: 0,
      selfNegation: 0,
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

    // このセッションで出題するバイアスの候補（12個から BIAS_POOL_SIZE 個を抽選）
    // 2026-08-06: バイアスを4個→12個に拡張した際に追加。
    // 1セッションで出るバイアス質問は約15問しかないため、12個すべてを対象にすると
    // 1バイアスあたり1問程度しか観測できず、「思考のクセ」の上位2件が同点だらけで
    // ほぼ運で決まってしまう。抽選で絞ることで1バイアスあたり2〜3問を確保しつつ、
    // 利用者ごとに違うバイアスが出るので12個すべてが世に出る。
    biasPool: pickBiasPool(),

    // ユーザーが申告した「知りたいこと」（Entry画面の選択）
    intent: null,

    // SelfIntent で選んだ具体的な悩み
    subIntent: null,

    // subIntent から決まる軸の探索優先順（序盤に使う）
    axisPriority: ['EI', 'SN', 'TF', 'JP'],

    // subIntent から決まる angle の優先順
    anglePriority: ['work', 'relation', 'stress', 'choice'],
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
