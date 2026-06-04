import { useState, useEffect, useRef } from 'react';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export function Quiz({ question, mode, questionNum, estimatedTotal, oracleMessage, onAnswer }) {
  const [pressed, setPressed] = useState(null);
  const timerRef = useRef(null);

  // 問題が切り替わったら押下状態をリセット
  useEffect(() => {
    setPressed(null);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [question?.id]);

  if (!question) return null;

  const isExtended = estimatedTotal > 0 && questionNum > estimatedTotal;
  const pct = estimatedTotal > 0 ? Math.min((questionNum / estimatedTotal) * 100, 100) : 0;

  // 押下 → 軽いフィードバック後に回答送信（歓喜の間）
  const choose = (key, fire) => {
    if (pressed !== null) return;       // 二重押下防止
    setPressed(key);
    timerRef.current = setTimeout(fire, 240);
  };

  return (
    <div className="quiz-screen">

      <div className="quiz-progress">
        <div className="quiz-progress-bar-track">
          <div className="quiz-progress-bar" style={{ width: `${pct}%` }} />
        </div>
        {isExtended ? (
          <p className="quiz-progress-label">{questionNum} 問目</p>
        ) : (
          <p className="quiz-progress-label">{questionNum} <span className="quiz-progress-of">/ 約 {estimatedTotal}</span></p>
        )}
      </div>

      {isExtended && (
        <div className="quiz-extension-notice">
          もう少しだけ教えてください。答えを絞り込んでいます。
        </div>
      )}

      {oracleMessage && (
        <p className="quiz-oracle-reading">
          <span className="quiz-oracle-mark" aria-hidden="true">✦</span>
          {oracleMessage}
        </p>
      )}

      <p className="quiz-stem" key={question.id}>
        {mode === 'mbti' ? question.stem : question.text}
      </p>

      {mode === 'mbti' ? (
        <div className="quiz-choices quiz-choices--mbti">
          {[
            { k: 'yes', cls: 'choice-yes', label: 'そう',       val: 1 },
            { k: 'dk',  cls: 'choice-dk',  label: 'わからない', val: 0 },
            { k: 'no',  cls: 'choice-no',  label: 'ちがう',     val: -1 },
          ].map(o => (
            <button
              key={o.k}
              className={`quiz-choice ${o.cls}${pressed === o.k ? ' is-pressed' : ''}`}
              disabled={pressed !== null}
              onClick={() => choose(o.k, () => onAnswer(question, o.val))}
            >
              {o.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="quiz-choices quiz-choices--cat">
          {question.choices.map((choice, i) => (
            <button
              key={choice.id}
              className={`quiz-choice quiz-choice--cat${pressed === choice.id ? ' is-pressed' : ''}`}
              style={{ animationDelay: `${0.06 * (i + 1)}s` }}
              disabled={pressed !== null}
              onClick={() => choose(choice.id, () => onAnswer(question, choice))}
            >
              <span className="choice-letter" aria-hidden="true">{LETTERS[i] ?? '・'}</span>
              <span className="choice-text">{choice.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
