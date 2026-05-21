import { useState } from 'react';

const MBTI_TYPES = [
  'ENTJ', 'INTJ', 'ENTP', 'INTP',
  'ENFJ', 'INFJ', 'ENFP', 'INFP',
  'ESTJ', 'ISTJ', 'ESFJ', 'ISFJ',
  'ESTP', 'ISTP', 'ESFP', 'ISFP',
];

export function MbtiEntry({ onStartQuiz, onSelectType, onBack }) {
  const [step, setStep] = useState('check');

  if (step === 'check') {
    return (
      <div className="mbti-entry-screen">
        <button className="back-button" onClick={onBack}>← 戻る</button>
        <div className="mbti-entry-header">
          <h2 className="mbti-entry-heading">MBTIを以前に受けたことはありますか？</h2>
          <p className="mbti-entry-sub">型を知っていれば質問を省いて結果に進めます</p>
        </div>
        <div className="entry-choices">
          <button className="entry-choice-button" onClick={() => setStep('select')}>
            <span className="choice-title">知っている</span>
            <span className="choice-desc">型を選んで結果を見る</span>
          </button>
          <button className="entry-choice-button" onClick={onStartQuiz}>
            <span className="choice-title">知らない・改めて受ける</span>
            <span className="choice-desc">約12問の診断を受ける</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mbti-entry-screen">
      <button className="back-button" onClick={() => setStep('check')}>← 戻る</button>
      <div className="mbti-entry-header">
        <h2 className="mbti-entry-heading">あなたのタイプを選んでください</h2>
        <p className="mbti-entry-sub">以前の診断結果や、自分の認識に近いものを選んでください</p>
      </div>
      <div className="mbti-type-grid">
        {MBTI_TYPES.map(type => (
          <button
            key={type}
            className="mbti-type-button"
            onClick={() => onSelectType(type)}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
}
