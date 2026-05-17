// 3択質問UI（そう / わからない / ちがう）

const CHOICES = [
  { value: 1,  label: 'そう',       className: 'choice-yes' },
  { value: 0,  label: 'わからない', className: 'choice-dk' },
  { value: -1, label: 'ちがう',     className: 'choice-no' },
];

/**
 * @param {{ question, questionNumber, onAnswer }} props
 */
export function Quiz({ question, questionNumber, onAnswer }) {
  if (!question) return null;

  return (
    <div className="quiz-screen">
      <p className="quiz-count">Q{questionNumber}</p>

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
    </div>
  );
}
