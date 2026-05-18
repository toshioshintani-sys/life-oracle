export function Quiz({ question, mode, questionNum, estimatedTotal, onAnswer }) {
  if (!question) return null;

  const pct = estimatedTotal > 0 ? Math.min((questionNum / estimatedTotal) * 100, 100) : 0;

  return (
    <div className="quiz-screen">

      <div className="quiz-progress">
        <div className="quiz-progress-bar-track">
          <div className="quiz-progress-bar" style={{ width: `${pct}%` }} />
        </div>
        <p className="quiz-progress-label">{questionNum} 問目 / 約 {estimatedTotal} 問</p>
      </div>

      <p className="quiz-stem">
        {mode === 'mbti' ? question.stem : question.text}
      </p>

      {mode === 'mbti' ? (
        <div className="quiz-choices quiz-choices--mbti">
          <button className="quiz-choice choice-yes" onClick={() => onAnswer(question, 1)}>そう</button>
          <button className="quiz-choice choice-dk"  onClick={() => onAnswer(question, 0)}>わからない</button>
          <button className="quiz-choice choice-no"  onClick={() => onAnswer(question, -1)}>ちがう</button>
        </div>
      ) : (
        <div className="quiz-choices">
          {question.choices.map(choice => (
            <button
              key={choice.id}
              className="quiz-choice"
              onClick={() => onAnswer(question, choice)}
            >
              {choice.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
