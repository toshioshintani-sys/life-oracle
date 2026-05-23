// 第2問：intent の中でさらに絞り込む
// ここで選んだ sub-intent が質問の軸優先順と結果文の文脈を決める

export const SUB_INTENTS = {
  work_stress: {
    question: '一番しんどいのはどのあたりですか？',
    options: [
      {
        key: 'workload',
        label: '仕事量・締切・やること多すぎ',
        axisPriority: ['JP', 'TF', 'SN', 'EI'],
        anglePriority: ['work', 'stress', 'choice', 'relation'],
      },
      {
        key: 'workplace_relation',
        label: '上司・同僚との人間関係',
        axisPriority: ['TF', 'EI', 'JP', 'SN'],
        anglePriority: ['work', 'relation', 'stress', 'choice'],
      },
      {
        key: 'self_doubt_work',
        label: '自分の判断や行動への自信のなさ',
        axisPriority: ['TF', 'SN', 'JP', 'EI'],
        anglePriority: ['stress', 'choice', 'work', 'relation'],
      },
      {
        key: 'org_mismatch',
        label: '会社の方向性や文化との違和感',
        axisPriority: ['SN', 'TF', 'JP', 'EI'],
        anglePriority: ['work', 'stress', 'relation', 'choice'],
      },
    ],
  },
  relation_conflict: {
    question: '一番「分かり合えない」と感じる場面は？',
    options: [
      {
        key: 'specific_mismatch',
        label: '特定の人と話が噛み合わない',
        axisPriority: ['TF', 'SN', 'EI', 'JP'],
        anglePriority: ['relation', 'stress', 'work', 'choice'],
      },
      {
        key: 'not_understood',
        label: '気持ちや意図が伝わらない',
        axisPriority: ['EI', 'TF', 'SN', 'JP'],
        anglePriority: ['relation', 'stress', 'choice', 'work'],
      },
      {
        key: 'pace_distance',
        label: '距離感・ペース・連絡頻度が合わない',
        axisPriority: ['EI', 'JP', 'TF', 'SN'],
        anglePriority: ['relation', 'choice', 'stress', 'work'],
      },
      {
        key: 'values_gap',
        label: '価値観や考え方が根本的に違う',
        axisPriority: ['SN', 'TF', 'EI', 'JP'],
        anglePriority: ['relation', 'stress', 'choice', 'work'],
      },
    ],
  },
  self_understand: {
    question: '一番「なぜ？」と思うのはどのパターンですか？',
    options: [
      {
        key: 'emotion_wave',
        label: '感情の波・急に落ちるときがある',
        axisPriority: ['TF', 'EI', 'JP', 'SN'],
        anglePriority: ['stress', 'relation', 'choice', 'work'],
      },
      {
        key: 'motivation_gap',
        label: 'やる気のムラ・先延ばし癖',
        axisPriority: ['JP', 'SN', 'TF', 'EI'],
        anglePriority: ['stress', 'work', 'choice', 'relation'],
      },
      {
        key: 'repeat_pattern',
        label: 'いつも似たような状況になってしまう',
        axisPriority: ['SN', 'JP', 'TF', 'EI'],
        anglePriority: ['stress', 'choice', 'work', 'relation'],
      },
      {
        key: 'no_future_image',
        label: '自分のやりたいことが分からない',
        axisPriority: ['SN', 'TF', 'JP', 'EI'],
        anglePriority: ['choice', 'stress', 'work', 'relation'],
      },
    ],
  },
  future_decision: {
    question: '今、一番迷っているのはどのあたりですか？',
    options: [
      {
        key: 'career_choice',
        label: '仕事・キャリア・転職・独立',
        axisPriority: ['JP', 'SN', 'TF', 'EI'],
        anglePriority: ['choice', 'work', 'stress', 'relation'],
      },
      {
        key: 'life_relationship',
        label: '結婚・パートナー・家族のこと',
        axisPriority: ['TF', 'EI', 'JP', 'SN'],
        anglePriority: ['choice', 'relation', 'stress', 'work'],
      },
      {
        key: 'values_life',
        label: 'どう生きるか・何を大切にするか',
        axisPriority: ['SN', 'TF', 'JP', 'EI'],
        anglePriority: ['choice', 'stress', 'relation', 'work'],
      },
      {
        key: 'risk_challenge',
        label: 'リスクのある挑戦に踏み出すかどうか',
        axisPriority: ['JP', 'TF', 'SN', 'EI'],
        anglePriority: ['choice', 'stress', 'work', 'relation'],
      },
    ],
  },
};

export function SelfIntent({ intent, onSelect }) {
  const config = SUB_INTENTS[intent];
  if (!config) return null;

  return (
    <div className="entry-screen">
      <div className="entry-header">
        <p className="self-intent-back">もう少し教えてください</p>
        <p className="entry-subtitle">{config.question}</p>
      </div>

      <div className="intent-list">
        {config.options.map(opt => (
          <button
            key={opt.key}
            className="intent-card"
            onClick={() => onSelect(opt)}
          >
            <span className="intent-label">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
