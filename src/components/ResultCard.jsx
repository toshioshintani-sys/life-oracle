import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { cognitiveFunctionMap, typeLabels, biasInfo } from '../data/types';

export default function ResultCard({ typeName, top2Biases }) {
  const cardRef = useRef(null);
  const cf = cognitiveFunctionMap[typeName];

  const handleSaveImage = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#1a1a2e',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = `ライフオラクル_${typeName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('画像保存に失敗しました', e);
    }
  };

  return (
    <div>
      <div ref={cardRef} className="result-card-image">
        <div className="rci-header">
          <span className="rci-app">🔮 ライフオラクル</span>
        </div>
        <div className="rci-type">{typeName}</div>
        <div className="rci-catch">{typeLabels[typeName]}</div>
        <div className="rci-divider" />
        <div className="rci-row">
          <span className="rci-label">光</span>
          <span className="rci-light">{cf.lightName}</span>
        </div>
        <div className="rci-row">
          <span className="rci-label">影</span>
          <span className="rci-shadow">{cf.shadowName}</span>
        </div>
        <div className="rci-divider" />
        {top2Biases && top2Biases.length >= 2 && (
          <>
            <div className="rci-bias-label">思考のクセ</div>
            <div className="rci-row">
              <span className="rci-bias-num">1位</span>
              <span className="rci-bias-name">{biasInfo[top2Biases[0]]?.name}</span>
            </div>
            <div className="rci-row">
              <span className="rci-bias-num">2位</span>
              <span className="rci-bias-name">{biasInfo[top2Biases[1]]?.name}</span>
            </div>
          </>
        )}
        <div className="rci-footer">incredible-llama-51caa2.netlify.app</div>
      </div>

      <button className="save-image-btn" onClick={handleSaveImage}>
        画像を保存してシェア
      </button>
    </div>
  );
}
