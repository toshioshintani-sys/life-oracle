// Flow診断クイズUI
// 選択肢に意味のあるラベルが付く（yes/no固定ではない）

export function FlowQuiz({ question, questionNumber, onAnswer }) {
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
