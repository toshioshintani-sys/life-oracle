const DOTS = 5;

export function Quiz({ question, sessionMessage, sessionConfidence, onAnswer }) {
  if (!question) return null;

  const filledDots = Math.round((sessionConfidence ?? 0) * DOTS);

  return (
    <div className="quiz-screen">
      {sessionMessage && (
        <div className="quiz-oracle-header">
          <p className="quiz-oracle-message">{sessionMessage}</p>
          <div className="quiz-confidence-dots" aria-hidden="true">
            {Array.from({ length: DOTS }, (_, i) => (
              <span
                key={i}
                className={`quiz-dot ${i < filledDots ? 'quiz-dot--filled' : ''}`}
              />
            ))}
          </div>
        </div>
      )}
      <p className="quiz-stem">{question.text}</p>
      <div className="quiz-choices">
        {question.choices.map((choice) => (
          <button
            key={choice.id}
            className="quiz-choice"
            onClick={() => onAnswer(question, choice)}
          >
            {choice.label}
          </button>
        ))}
      </div>
    </div>
  );
}
