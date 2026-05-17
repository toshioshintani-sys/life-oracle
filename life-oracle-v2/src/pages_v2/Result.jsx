import { getResult } from '../data_v2/results/index.js';
import { biasInfo }  from '../data_v2/meta/biasInfo.js';

const SITUATION_LABELS = {
  w_boss_power:      '上司との関係',
  w_boss_unfair:     '評価・不公平感',
  w_boss_values:     '方針・価値観の不一致',
  w_col_isolation:   '職場での孤立',
  w_col_rivalry:     '同僚との摩擦',
  w_work_empty:      'やりがい・意味',
  w_work_overload:   '仕事量・消耗',
  w_career_change:   '転職・キャリアの転換',
  w_career_indep:    '独立・起業',
  w_career_stuck:    '昇進・成長の頭打ち',
};

export function Result({ result, onRetry }) {
  if (!result) return null;

  const text = getResult(result.situation, result.age);
  const label = SITUATION_LABELS[result.situation] ?? result.situation;

  const topBiases = (result.topBiases ?? [])
    .map(key => biasInfo[key])
    .filter(Boolean);

  return (
    <div className="result-screen">

      {/* ① 問題の特定 */}
      <div className="result-oracle">
        <p className="result-oracle-eyebrow">今のあなたが直面していること</p>
        <p className="result-label-tag">{label}</p>
        {text && <p className="result-oracle-text">{text.hook}</p>}
      </div>

      {/* ② 2択の毒舌テキスト */}
      {text ? (
        <div className="result-two-sides">
          <div className="result-side result-side-a">
            <p className="result-side-label">可能性 A</p>
            <p className="result-side-text">{text.sideA}</p>
          </div>
          <div className="result-side result-side-b">
            <p className="result-side-label">可能性 B</p>
            <p className="result-side-text">{text.sideB}</p>
          </div>
          <p className="result-closing">{text.closing}</p>
        </div>
      ) : (
        <div className="result-accident">
          <p className="result-accident-body">
            {label}の問題が見えてきました。もう少し質問を増やすと、より精度が上がります。
          </p>
        </div>
      )}

      {/* ③ ユング・バイアスで「なぜ」 */}
      {text && (text.jungNote || text.biasNote) && (
        <div className="result-why-card">
          <p className="result-section-title">なぜそうなっているか</p>
          {text.jungNote && (
            <p className="result-why-text">{text.jungNote}</p>
          )}
          {text.biasNote && (
            <p className="result-why-text" style={{ marginTop: 10 }}>{text.biasNote}</p>
          )}
          {topBiases.length > 0 && (
            <div className="result-biases-mini" style={{ marginTop: 12 }}>
              {topBiases.map((b, i) => (
                <div key={i} className={`result-bias-mini bias-rank-${i + 1}`}>
                  <span className="bias-name-mini">{b.name}</span>
                  <span className="bias-short-mini">{b.short}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ④ 今日の一歩 */}
      {text?.action && (
        <div className="result-action">
          <h3 className="result-section-title">今日の一歩</h3>
          <p className="result-recovery">{text.action}</p>
        </div>
      )}

      {/* ⑤ フッター */}
      <div className="result-footer">
        <button className="retry-button" onClick={onRetry}>
          もう一度診断する
        </button>
      </div>

    </div>
  );
}
