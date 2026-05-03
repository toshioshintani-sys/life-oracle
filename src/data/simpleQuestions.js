// 簡易診断（60〜90秒）用の質問データ
// シーン型・二択（A/B）形式
// answer 0 = A（左極：E/S/T/J）, answer 1 = B（右極：I/N/F/P）

export const simpleJungQuestions = [
  // ── E / I 軸（外向 ／ 内向）───────────────
  {
    id: 'sEI_1',
    axis: 'EI',
    scene: '会議',
    stem: '会議で意見が割れたとき、あなたが選ぶのは？',
    optionA: 'その場で意見を述べて議論を進める',
    optionB: '一旦持ち帰って考えをまとめてから発言する',
  },
  {
    id: 'sEI_2',
    axis: 'EI',
    scene: 'リフレッシュ',
    stem: '仕事で疲れた休日、本当に元気が戻るのは？',
    optionA: '誰かと会って話したり、外に出かけたりする',
    optionB: '一人で静かに過ごし、自分のペースで休む',
  },

  // ── S / N 軸（感覚 ／ 直観）───────────────
  {
    id: 'sSN_1',
    axis: 'SN',
    scene: 'プロジェクト',
    stem: '新しい仕事を任されたとき、最初に気になるのは？',
    optionA: '具体的な数字・実績・前例などのデータ',
    optionB: 'これがどう発展していくかの可能性やビジョン',
  },
  {
    id: 'sSN_2',
    axis: 'SN',
    scene: '説明を聞く',
    stem: '上司や先輩の説明を聞くとき、頭に入りやすいのは？',
    optionA: '具体的な事例や、手順を一つずつ追う説明',
    optionB: '全体像や「要するに何のため」という意味づけ',
  },

  // ── T / F 軸（思考 ／ 感情）───────────────
  {
    id: 'sTF_1',
    axis: 'TF',
    scene: '部下・後輩の評価',
    stem: '部下や後輩の評価で、より重視してしまうのは？',
    optionA: '成果・数字・客観的な事実',
    optionB: '本人の努力や、チームへの影響・気持ち',
  },
  {
    id: 'sTF_2',
    axis: 'TF',
    scene: '対立',
    stem: '同僚同士が揉めているとき、あなたが優先するのは？',
    optionA: 'どちらが正しいか・筋道を整理すること',
    optionB: '両者の関係を壊さない・気持ちに寄り添うこと',
  },

  // ── J / P 軸（判断 ／ 知覚）───────────────
  {
    id: 'sJP_1',
    axis: 'JP',
    scene: 'タスク管理',
    stem: 'タスクが増えてきたとき、自然にやりがちなのは？',
    optionA: 'スケジュールを組み、見通しを立てて動く',
    optionB: 'その時の状況や気分に合わせて柔軟に進める',
  },
  {
    id: 'sJP_2',
    axis: 'JP',
    scene: '締切',
    stem: '大きな締切がある仕事で、しっくりくるやり方は？',
    optionA: '早めに着手して、計画的に終わらせる',
    optionB: 'ぎりぎりまで選択肢を開いておき、集中して仕上げる',
  },
];

// バイアス4問（B1損失回避・B2現在バイアス・B5過信・B6現状維持）
// answer 0 = A（バイアスあり）, answer 1 = B（バイアスなし）
export const simpleBiasQuestions = [
  {
    id: 'sB1_1',
    bias: 'B1',
    scene: '失う恐れ',
    stem: '何かを手放さなければならないとき、あなたに近いのは？',
    optionA: '失うことを考えると、踏み切るのが難しくなる',
    optionB: '次に得られるものに目を向けて切り替えられる',
  },
  {
    id: 'sB2_1',
    bias: 'B2',
    scene: '先延ばし',
    stem: '「あとでやろう」と思った仕事、その後どうなりがち？',
    optionA: '気づくと締切ぎりぎりになっていることが多い',
    optionB: '自分でリマインドして、計画通り着手できることが多い',
  },
  {
    id: 'sB5_1',
    bias: 'B5',
    scene: '自己評価',
    stem: '自分の判断や能力について、本音に近いのは？',
    optionA: '自分の判断は、たいてい妥当だと思う',
    optionB: '自分の判断には、見えていない穴があると感じる',
  },
  {
    id: 'sB6_1',
    bias: 'B6',
    scene: '変化への姿勢',
    stem: '今のやり方を変える提案をされたとき、最初に感じるのは？',
    optionA: 'まず「今のままで何が悪い？」と感じる',
    optionB: 'まず「やってみたら違う発見がありそう」と感じる',
  },
];

/**
 * 簡易ユング診断のスコアリング
 * 各軸2問のうち A（左寄り）が1問以上 → 左極（E/S/T/J）
 * @param {{ [questionId: string]: 0|1 }} answers
 * @returns {{ E: boolean, S: boolean, T: boolean, J: boolean, scores: object }}
 */
export function calcSimpleJungScore(answers) {
  const axisScores = { EI: 0, SN: 0, TF: 0, JP: 0 };
  for (const q of simpleJungQuestions) {
    const v = answers[q.id];
    if (v === undefined) continue;
    if (v === 0) axisScores[q.axis] += 1;
  }
  return {
    E: axisScores.EI >= 1,
    S: axisScores.SN >= 1,
    T: axisScores.TF >= 1,
    J: axisScores.JP >= 1,
    scores: axisScores,
  };
}

/**
 * 簡易バイアス診断のスコアリング
 * A（バイアスあり）と回答した順にバイアスIDを返す
 * @param {{ [questionId: string]: 0|1 }} answers
 * @returns {{ flagged: string[], top1: string|null }}
 */
export function calcSimpleBiasResult(answers) {
  const flagged = [];
  for (const q of simpleBiasQuestions) {
    const v = answers[q.id];
    if (v === 0) flagged.push(q.bias);
  }
  return {
    flagged,
    top1: flagged[0] ?? null,
  };
}
