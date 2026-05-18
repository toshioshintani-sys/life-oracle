import { useState } from 'react';

const OCCUPATIONS = [
  '会社員', '公務員', '医療職', '教育職', '士業',
  'クリエイター', '接客', '調理', '理美容師', '介護',
  'フリーランス', '自営業', '一次産業', '建設業',
  '主婦/主夫', '非正規雇用', '学生', '無職',
];

const GENERATIONS = ['10代', '20代', '30代', '40代', '50代', '60代', '70代以上'];

export function PostQuiz({ onComplete }) {
  const [occupation, setOccupation] = useState(null);
  const [generation, setGeneration] = useState(null);

  return (
    <div className="post-quiz-screen">
      <div className="post-quiz-header">
        <p className="post-quiz-lead">あと少しだけ教えてください。</p>
        <p className="post-quiz-sub">2,016通りの処方箋から絞り込むために使います。</p>
      </div>

      <div className="post-quiz-section">
        <p className="post-quiz-label">職業</p>
        <div className="post-quiz-grid">
          {OCCUPATIONS.map(o => (
            <button
              key={o}
              className={`post-quiz-chip${occupation === o ? ' selected' : ''}`}
              onClick={() => setOccupation(o)}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      <div className="post-quiz-section">
        <p className="post-quiz-label">年代</p>
        <div className="post-quiz-gen-row">
          {GENERATIONS.map(g => (
            <button
              key={g}
              className={`post-quiz-chip${generation === g ? ' selected' : ''}`}
              onClick={() => setGeneration(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <button
        className="post-quiz-submit"
        disabled={!occupation || !generation}
        onClick={() => onComplete(occupation, generation)}
      >
        結果を見る
      </button>
    </div>
  );
}
