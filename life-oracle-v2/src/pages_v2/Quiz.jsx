// 3択質問UI（そう / わからない / ちがう）

const CHOICES = [
  { value: 1,  label: 'そう',       className: 'choice-yes' },
  { value: 0,  label: 'わからない', className: 'choice-dk' },
  { value: -1, label: 'ちがう',     className: 'choice-no' },
];

/**
 * @param {{ question, questionNumber, totalEstimate, onAnswer }} props
 */
export function Quiz({ question, questionNumber, totalEstimate, onAnswer }) {
  if (!question) return null;

  const progress = Math.round((questionNumber / totalEstimate) * 100);

  return (
    <div className="quiz-screen">
      <div className="quiz-progress-bar">
        <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="quiz-tag">{question.tag}</div>

      <p className="quiz-stem">{question.stem}</p>

      <div className="quiz-choices">
        {CHOICES.map(({ value, label, className }) => (
          <button
            key={value}
            className={`quiz-choice ${className}`}
            onClick={() => onAnswer(question, value)}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="quiz-count">{questionNumber} 問目</p>
    </div>
  );
}
