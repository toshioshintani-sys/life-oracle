import { useState } from 'react';
import { MBTI_TO_JUNG, JUNG_LABEL } from '../data_v2/meta/cognitiveFunctions.js';

const MBTI_TYPES = [
  'ESTJ', 'ENTJ', 'ESFJ', 'ENFJ',
  'ESTP', 'ENTP', 'ISTP', 'INTP',
  'ISTJ', 'INTJ', 'ISFJ', 'INFJ',
  'ESFP', 'ENFP', 'ISFP', 'INFP',
];

export function MbtiEntry({ onStartQuiz, onSelectType, onBack }) {
  const [step, setStep] = useState('check');

  if (step === 'check') {
    return (
      <div className="mbti-entry-screen">
        <button className="back-button" onClick={onBack}>← 戻る</button>
        <div className="mbti-entry-header">
          <h2 className="mbti-entry-heading">思考・行動パターンを調べたことはありますか？</h2>
          <p className="mbti-entry-sub">知っていれば診断を省いて直接結果に進めます</p>
        </div>
        <div className="entry-choices">
          <button className="entry-choice-button" onClick={onStartQuiz}>
            <span className="choice-title">知らない・改めて診断する</span>
            <span className="choice-desc">約20問の診断を受ける</span>
          </button>
          <button className="entry-choice-button entry-choice-button--sub" onClick={() => setStep('select')}>
            <span className="choice-title">知っている</span>
            <span className="choice-desc">パターンを選んで結果を見る</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mbti-entry-screen">
      <button className="back-button" onClick={() => setStep('check')}>← 戻る</button>
      <div className="mbti-entry-header">
        <h2 className="mbti-entry-heading">あなたのパターンを選んでください</h2>
        <p className="mbti-entry-sub">自分の認識に一番近いものを選んでください</p>
      </div>
      <div className="mbti-type-grid">
        {MBTI_TYPES.map(mbtiType => {
          const jungId = MBTI_TO_JUNG[mbtiType];
          const label  = JUNG_LABEL[jungId];
          const isShadow = jungId.endsWith('-影');
          return (
            <button
              key={mbtiType}
              className={`mbti-type-button${isShadow ? ' mbti-type-button--shadow' : ''}`}
              onClick={() => onSelectType(mbtiType)}
            >
              <span className="mbti-type-btn-label">{label}</span>
              <span className="mbti-type-btn-jung">{jungId}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
