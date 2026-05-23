// 究極の選択型質問（Situation Questions）
// 自己申告ではなく「選ばせる」ことで認知バイアス・感情トリガーを直接測る
// accidents / triggers フィールドを直接定義（マッピングテーブル非使用）

export const situationQuestions = [
  {
    id: 'SIT_01',
    kind: 'bias', perspective: 'self', axis: null, bias: 'SIT',
    angle: 'stress', pole: null, weight: 1.5,
    scene: 'sit_truth_feared',
    tag: '本音を出せないとき',
    stem: '締切が近いプレッシャーの中でも、「間に合わない」と正直に言い出せないことが多い。',
    accidents: { burnout: 1.2, explosion: 0.8 },
    triggers: { rejected: 1.5, rushed: 0.8 },
  },
  {
    id: 'SIT_02',
    kind: 'bias', perspective: 'self', axis: null, bias: 'SIT',
    angle: 'choice', pole: null, weight: 1.5,
    scene: 'sit_impulse_regret',
    tag: '衝動的な行動',
    stem: '少し後悔するとわかっていても、今この瞬間の不快を消すために衝動的に行動することがある。',
    accidents: { impulse: 2.0, selfNegation: 0.5 },
    triggers: { rushed: 0.8 },
  },
  {
    id: 'SIT_03',
    kind: 'bias', perspective: 'self', axis: null, bias: 'SIT',
    angle: 'stress', pole: null, weight: 1.5,
    scene: 'sit_stuck_cant_change',
    tag: '変われない自分',
    stem: '現状に不満があっても、変化した後の未来が見えないと、どうしても動き出せない。',
    accidents: { burnout: 1.5, jobLoop: 1.8 },
    triggers: { expected: 0.8 },
  },
  {
    id: 'SIT_04',
    kind: 'bias', perspective: 'self', axis: null, bias: 'SIT',
    angle: 'relation', pole: null, weight: 1.5,
    scene: 'sit_criticism_hurts',
    tag: '指摘への反応',
    stem: '誰かに「それは違う」と言われると、正しいかどうかより先に、傷ついた感覚が来る。',
    accidents: { selfNegation: 1.5, explosion: 0.8 },
    triggers: { rejected: 2.0 },
  },
];
