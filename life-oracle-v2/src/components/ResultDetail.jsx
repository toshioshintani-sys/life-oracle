import { useEffect } from 'react';

export function ResultDetail({ backLabel = '結果に戻る', onBack, children }) {
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  return (
    <div className="result-detail">
      <button className="result-detail-back" onClick={onBack}>
        ← {backLabel}
      </button>
      <div className="result-detail-body">
        {children}
      </div>
    </div>
  );
}
