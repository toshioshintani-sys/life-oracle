// 結果画面 — 悩みへの回答を起点に、タイプは説明として登場する

import { buildResultData } from '../engine_v2/result.js';

export function Result({ result, onRetry }) {
  const data = buildResultData(result);

  return (
    <div className="result-screen">

      {/* ① 悩みに応えるオープニング */}
      <div className="result-opening">
        <p className="result-intent-label">「{data.intentLabel}」について</p>
        <p className="result-why">{data.why}</p>
      </div>

      {/* ② なぜそうなのか（タイプを理由として登場させる） */}
      <div className="result-type-card">
        <p className="result-type-explain">
          この動き方は、<strong>{data.axisLabels.TF}</strong>かつ
          <strong>{data.axisLabels.JP}</strong>の人に多いパターンです。
        </p>
        <div className="result-type-badge">
          <span className="result-type-code">{data.mbtiType}</span>
          {data.famousPeople.length > 0 && (
            <span className="result-type-famous">
              {data.famousPeople.join('・')}と同じタイプ
            </span>
          )}
        </div>
      </div>

      {/* ③ 思考のクセがその悩みにどう影響しているか */}
      {data.topBiases.length > 0 && (
        <div className="result-biases">
          <h3 className="result-section-title">それを強めているクセ</h3>
          {data.topBiases.map((b, i) => (
            <div key={b.key} className={`result-bias bias-rank-${i + 1}`}>
              <div className="bias-header">
                <span className="bias-rank">#{i + 1}</span>
                <span className="bias-name">{b.name}</span>
                <span className="bias-short">{b.short}</span>
              </div>
              <p className="bias-impact">{b.impact}</p>
            </div>
          ))}
        </div>
      )}

      {/* ④ 今日できること */}
      <div className="result-action">
        <h3 className="result-section-title">今日の一歩</h3>
        <p className="result-recovery">{data.recovery}</p>
        {data.todayAction && (
          <p className="result-today-action">{data.todayAction}</p>
        )}
      </div>

      <div className="result-footer">
        <button className="retry-button" onClick={onRetry}>
          もう一度診断する
        </button>
      </div>

    </div>
  );
}
