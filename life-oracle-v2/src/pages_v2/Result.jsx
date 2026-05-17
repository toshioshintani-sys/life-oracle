// 結果画面 — 行動パターン予測を主軸に、タイプは説明として脇役
// 「当てられた」体験を作るオラクルUX

import { buildResultData } from '../engine_v2/result.js';

export function Result({ result, onRetry }) {
  const data = buildResultData(result);

  return (
    <div className="result-screen">

      {/* ① 見透かし感オープニング */}
      <div className="result-oracle">
        <p className="result-oracle-eyebrow">診断結果</p>
        <p className="result-oracle-text">{data.opening}</p>
      </div>

      {/* ② 行動パターン予測（メインコンテンツ） */}
      {data.accident ? (
        <div className="result-accident">
          <div className="result-accident-label-row">
            <span className="result-accident-label">起きやすいパターン</span>
          </div>
          <h2 className="result-accident-headline">{data.accident.headline}</h2>
          <p className="result-accident-body">{data.accident.body}</p>
          <div className="result-accident-when">
            <span className="result-accident-when-label">こんな時に特に強まる</span>
            <p className="result-accident-when-text">{data.accident.when}</p>
          </div>
        </div>
      ) : (
        <div className="result-accident">
          <p className="result-accident-body">
            あなたの行動パターンに特定の偏りは見られませんでした。バランスの取れた動き方をしているようです。
          </p>
        </div>
      )}

      {/* ③ なぜそうなるか（バイアス＋タイプ） */}
      <div className="result-why-card">
        <p className="result-why-text">{data.whyExplanation}</p>

        {data.topBiases.length > 0 && (
          <div className="result-biases-mini">
            {data.topBiases.map((b, i) => (
              <div key={b.key} className={`result-bias-mini bias-rank-${i + 1}`}>
                <span className="bias-name-mini">{b.name}</span>
                {b.short && <span className="bias-short-mini">{b.short}</span>}
              </div>
            ))}
          </div>
        )}

        <div className="result-type-mini">
          {data.mbtiType && (
            <span className="result-type-code-mini">{data.mbtiType}</span>
          )}
          {data.famousPeople.length > 0 && (
            <span className="result-type-famous-mini">
              {data.famousPeople.join('・')}と同じタイプ
            </span>
          )}
        </div>
      </div>

      {/* ④ 今日の一歩 */}
      {data.accident?.action && (
        <div className="result-action">
          <h3 className="result-section-title">今日の一歩</h3>
          <p className="result-recovery">{data.accident.action}</p>
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
