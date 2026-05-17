// 結果画面

import { buildResultData, intentNarrative } from '../engine_v2/result.js';

/**
 * @param {{ result, onRetry }} props
 */
export function Result({ result, onRetry }) {
  const data = buildResultData(result);
  const narrative = intentNarrative(result.intent, data.mbtiType);

  return (
    <div className="result-screen">
      <div className="result-header">
        <p className="result-narrative">{narrative}</p>
        <h2 className="result-type">{data.mbtiType}</h2>
        <div className="result-names">
          <span className="result-light">光：{data.lightName}</span>
          <span className="result-shadow">影：{data.shadowName}</span>
        </div>
      </div>

      {data.famousPeople.length > 0 && (
        <div className="result-famous">
          <p className="result-famous-label">同じタイプの人物</p>
          <p className="result-famous-names">{data.famousPeople.join('　')}</p>
        </div>
      )}

      {data.topBiases.length > 0 && (
        <div className="result-biases">
          <h3 className="result-section-title">あなたの思考のクセ</h3>
          {data.topBiases.map((b, i) => (
            <div key={b.key} className={`result-bias bias-rank-${i + 1}`}>
              <div>
                <span className="bias-rank">#{i + 1}　</span>
                <span className="bias-name">{b.name}</span>
              </div>
              <p className="bias-short">{b.short}</p>
              <p className="bias-desc">{b.description}</p>
            </div>
          ))}
        </div>
      )}

      <div className="result-action">
        <h3 className="result-section-title">今日の一歩</h3>
        <p className="result-today-action">{data.todayAction}</p>
      </div>

      <div className="result-axis-strength">
        <h3 className="result-section-title">診断の確信度</h3>
        {Object.entries(data.axisStrength).map(([axis, conf]) => (
          <div key={axis} className="axis-bar-row">
            <span className="axis-label">{axis}</span>
            <div className="axis-bar-track">
              <div
                className="axis-bar-fill"
                style={{ width: `${Math.round(conf * 100)}%` }}
              />
            </div>
            <span className="axis-conf">{Math.round(conf * 100)}%</span>
          </div>
        ))}
      </div>

      <div className="result-footer">
        <button className="retry-button" onClick={onRetry}>
          もう一度診断する
        </button>
      </div>
    </div>
  );
}
