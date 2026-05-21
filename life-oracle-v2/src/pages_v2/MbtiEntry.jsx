import { useState } from 'react';

const MBTI_TO_JUNG = {
  ESTJ: 'Te-光', ENTJ: 'Te-影', ESFJ: 'Fe-光', ENFJ: 'Fe-影',
  ESTP: 'Se-光', ESFP: 'Se-影', ENTP: 'Ne-光', ENFP: 'Ne-影',
  ISTJ: 'Si-光', ISFJ: 'Si-影', ISTP: 'Ti-光', INTP: 'Ti-影',
  INTJ: 'Ni-光', INFJ: 'Ni-影', ISFP: 'Fi-光', INFP: 'Fi-影',
};

const JUNG_LABEL = {
  'Te-光': '指揮者',      'Te-影': '鉄砲玉',
  'Ti-光': '職人',        'Ti-影': '堂々巡り',
  'Fe-光': '聴き手',      'Fe-影': '八方美人',
  'Fi-光': '求道者',      'Fi-影': '頑固者',
  'Se-光': '今を楽しむ人', 'Se-影': '思いつき人',
  'Si-光': 'コツコツ人',  'Si-影': '現状維持人',
  'Ne-光': '発明家',      'Ne-影': '三日坊主',
  'Ni-光': '先読み人',    'Ni-影': '独走者',
};

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
          <button className="entry-choice-button" onClick={() => setStep('select')}>
            <span className="choice-title">知っている</span>
            <span className="choice-desc">パターンを選んで結果を見る</span>
          </button>
          <button className="entry-choice-button" onClick={onStartQuiz}>
            <span className="choice-title">知らない・改めて診断する</span>
            <span className="choice-desc">約20問の診断を受ける</span>
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
