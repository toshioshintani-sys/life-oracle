export function Quiz({ question, sessionMessage, onAnswer }) {
  if (!question) return null;
  return (
    <div className="quiz-screen">
      {sessionMessage && (
        <p className="quiz-oracle-message">{sessionMessage}</p>
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
