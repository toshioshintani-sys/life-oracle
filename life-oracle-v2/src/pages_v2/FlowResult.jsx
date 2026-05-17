// Flow診断 結果画面
// 現在地（primaryFlow）→ なぜ → このまま行くと → 今日の一歩

import { buildFlowResult } from '../engine_v2/flowEngine.js';

export function FlowResult({ session, onRetry }) {
  const data = buildFlowResult(session);

  return (
    <div className="result-screen">

      {/* ① 現在地 */}
      <div className="result-oracle">
        <p className="result-oracle-eyebrow">今のあなたの流れ</p>
        <h2 className="flow-primary-label">{data.primary?.label}</h2>
        <p className="result-oracle-text">{data.primary?.headline}</p>
      </div>

      {/* ② 説明 */}
      <div className="result-accident">
        <p className="result-accident-body">{data.primary?.summary}</p>
        {data.combinationNote && (
          <div className="result-accident-when">
            <span className="result-accident-when-label">
              {data.secondary?.label} との組み合わせ
            </span>
            <p className="result-accident-when-text">{data.combinationNote}</p>
          </div>
        )}
      </div>

      {/* ③ このまま行くと */}
      {data.primary?.nextFlowRisk && (
        <div className="result-why-card">
          <p className="result-section-title">このまま続くと</p>
          <p className="result-why-text">{data.primary.nextFlowRisk}</p>
          {data.primary?.caution && (
            <p className="result-accident-when-text" style={{ marginTop: 8 }}>
              {data.primary.caution}
            </p>
          )}
        </div>
      )}

      {/* ④ 今日の一歩 */}
      {data.primary?.nextAction && (
        <div className="result-action">
          <h3 className="result-section-title">今日の一歩</h3>
          <p className="result-recovery">{data.primary.nextAction}</p>
        </div>
      )}

      {/* ⑤ サブFlow */}
      {data.secondary && !data.combinationNote && (
        <div className="result-why-card">
          <p className="result-section-title" style={{ marginBottom: 6 }}>
            あわせて出やすい傾向
          </p>
          <p className="result-why-text">
            <strong>{data.secondary.label}</strong>：{data.secondary.headline}
          </p>
        </div>
      )}

      <div className="result-footer">
        <button className="retry-button" onClick={onRetry}>
          もう一度診断する
        </button>
      </div>

    </div>
  );
}
