import { getResultWithFallback } from '../data_v2/results/index.js';
import { biasInfo }              from '../data_v2/meta/biasInfo.js';

const SITUATION_LABELS = {
  w_boss_power:       '上司との関係',
  w_boss_unfair:      '評価・不公平感',
  w_boss_values:      '方針・価値観の不一致',
  w_col_isolation:    '職場での孤立',
  w_col_rivalry:      '同僚との摩擦',
  w_work_empty:       'やりがい・意味',
  w_work_overload:    '仕事量・消耗',
  w_career_change:    '転職・キャリアの転換',
  w_career_indep:     '独立・起業',
  w_career_stuck:     '昇進・成長の頭打ち',
  r_partner_drift:    'パートナーとの距離感',
  r_partner_divorce:  '別れ・離婚への迷い',
  r_parent_pressure:  '親からのプレッシャー',
  r_parent_care:      '家族の介護・ケア',
  r_friend_isolation: '友人関係での孤立',
  r_friend_toxic:     '消耗する人間関係',
  s_self_esteem:      '自己肯定感',
  s_emotion_control:  '感情のコントロール',
  s_no_direction:     '方向性が見えない',
  s_burnout:          '燃え尽き・無気力',
  f_job_decision:     '仕事・キャリアの決断',
  f_independence:     '自立・独立への迷い',
  f_life_change:      '人生の転換点',
};

export function Result({ result, onRetry }) {
  if (!result) return null;

  const text  = getResultWithFallback(result.situation, result.age);
  const label = SITUATION_LABELS[result.situation] ?? result.situation;

  // 上位2候補が拮抗（gap < 0.15）の場合のみ隣接テーマを表示
  const secondLabel = SITUATION_LABELS[result.secondSituation] ?? result.secondSituation;
  const showSecond  = (result.situationGap ?? 1) < 0.15 && result.secondSituation;

  // 3位（スコアが top の 80% 以上）→ 動的な「このまま続くと」に使う
  const thirdLabel  = SITUATION_LABELS[result.thirdSituation];
  const showForecast = result.showThird && thirdLabel;

  const topBiases   = (result.topBiases ?? []).map(key => biasInfo[key]).filter(Boolean);
  const keyAnswers  = (result.keyAnswers ?? []).slice(0, 3);
  const evidenceLog = (result.evidenceLog ?? []);

  return (
    <div className="result-screen">

      {/* ① 私はこう読みました（推論ログ）*/}
      {evidenceLog.length > 0 && (
        <div className="result-evidence">
          <p className="result-evidence-label">私はこう読みました。</p>
          {evidenceLog.map((entry, i) => (
            <p key={i} className="result-evidence-item">{entry}</p>
          ))}
        </div>
      )}

      {/* ② あなたはこう答えました（読み返し）*/}
      {keyAnswers.length > 0 && (
        <div className="result-readings">
          <p className="result-readings-label">あなたはこう答えました。</p>
          {keyAnswers.map((ans, i) => (
            <p key={i} className="result-reading-item">「{ans}」</p>
          ))}
        </div>
      )}

      {/* ③ 断言：今あなたが直面していること */}
      <div className="result-oracle">
        <p className="result-oracle-eyebrow">今あなたが直面していること</p>
        <p className="result-label-tag">{label}</p>
        {text && <p className="result-oracle-text">{text.hook}</p>}
      </div>

      {/* ④ 顕在 → 深層（縦構造） */}
      {text && (
        <div className="result-layers">
          <div className="result-layer result-layer-surface">
            <p className="result-layer-label">今感じていること</p>
            <p className="result-layer-text">{text.sideA}</p>
          </div>
          <div className="result-layer result-layer-root">
            <p className="result-layer-label">その根っこにある可能性</p>
            <p className="result-layer-text">{text.sideB}</p>
          </div>
          {text.closing && (
            <p className="result-closing">{text.closing}</p>
          )}
        </div>
      )}

      {/* ⑤ なぜそうなっているか（Jung × Bias） */}
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

      {/* ⑥ このまま続くと（3位スコアの動的データから生成） */}
      {showForecast && (
        <div className="result-forecast">
          <p className="result-section-title">このまま続くと</p>
          <p className="result-forecast-text">
            今の状態を放置した場合、あなたの中で「{thirdLabel}」という局面が顔を出してくる可能性があります。今感じていることと、この局面は根っこでつながっています。
          </p>
        </div>
      )}

      {/* ⑦ 今日の一歩 */}
      {text?.action && (
        <div className="result-action">
          <p className="result-section-title">今日の一歩</p>
          <p className="result-recovery">{text.action}</p>
        </div>
      )}

      {/* ⑧ 近くにあるかもしれないテーマ（拮抗時のみ・1位と2位が非常に接近している場合） */}
      {showSecond && (
        <div className="result-adjacent">
          <p className="result-adjacent-label">近くにあるかもしれないテーマ</p>
          <p className="result-adjacent-tag">{secondLabel}</p>
        </div>
      )}

      {/* ⑨ フッター */}
      <div className="result-footer">
        <button className="retry-button" onClick={onRetry}>
          もう一度診断する
        </button>
      </div>

    </div>
  );
}
