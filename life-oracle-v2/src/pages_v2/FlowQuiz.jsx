// Flow診断クイズUI
// 選択肢に意味のあるラベルが付く（yes/no固定ではない）

import { useEffect } from 'react';
import { trackEvent } from '../lib/analytics.js';

export function FlowQuiz({ question, questionNumber, onAnswer }) {
  // 設問表示を計測（離脱設問の特定用）
  useEffect(() => {
    if (question?.id) {
      trackEvent('question_view', { mode: 'flow', q_num: questionNumber, question_id: question.id });
    }
  }, [question?.id]);

  return (
    <div className="quiz-screen">
      <p className="quiz-count">Q{questionNumber}</p>
      <p className="quiz-stem">{question.text}</p>
      <div className="flow-choices">
        {question.choices.map((choice) => (
          <button
            key={choice.id}
            className="flow-choice"
            onClick={() => onAnswer(question, choice)}
          >
            {choice.label}
          </button>
        ))}
      </div>
    </div>
  );
}
