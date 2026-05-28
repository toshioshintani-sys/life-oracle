import { useState, useEffect } from 'react';
import { getResultWithFallback } from '../data_v2/results/index.js';
import { biasInfo }              from '../data_v2/meta/biasInfo.js';
import ShareButtons              from '../components/ShareButtons.jsx';
import ShareCard                 from '../components/ShareCard.jsx';
import CrossFlowActions          from '../components/CrossFlowActions.jsx';
import { ResultDetail }          from '../components/ResultDetail.jsx';
import { OracleWall }            from './OracleWall.jsx';
import { incrementOnce }         from '../lib/stats.js';

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

function HubCard({ icon, title, preview, onClick }) {
  return (
    <button className="hub-card" onClick={onClick}>
      <span className="hub-card-icon">{icon}</span>
      <span className="hub-card-body">
        <span className="hub-card-title">{title}</span>
        {preview && <span className="hub-card-preview">{preview}</span>}
      </span>
      <span className="hub-card-arrow">›</span>
    </button>
  );
}

export function Result({ result, onRetry, onSwitchFlow }) {
  const [section, setSection] = useState(null);

  useEffect(() => { if (result) incrementOnce('situation'); }, [result]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [section]);

  if (!result) return null;

  const text        = getResultWithFallback(result.situation, result.age);
  const label       = SITUATION_LABELS[result.situation] ?? result.situation;
  const secondLabel = SITUATION_LABELS[result.secondSituation] ?? result.secondSituation;
  const showSecond  = (result.situationGap ?? 1) < 0.15 && result.secondSituation;
  const thirdLabel  = SITUATION_LABELS[result.thirdSituation];
  const showForecast = result.showThird && thirdLabel;
  const topBiases   = (result.topBiases ?? []).map(key => biasInfo[key]).filter(Boolean);
  const shareText   = `ライフオラクルで今の状況を整理しました。\n直面しているのは〈${label}〉\n\n#ライフオラクル`;

  // ── 詳細ページ ──────────────────────────────
  if (section === 'layers') {
    return (
      <ResultDetail backLabel="結果に戻る" onBack={() => setSection(null)}>
        <p className="detail-eyebrow">今あなたの中で起きていること</p>
        <div className="result-layers">
          <div className="result-layer result-layer-surface">
            <p className="result-layer-label">今感じていること</p>
            <p className="result-layer-text">{text?.sideA}</p>
          </div>
          <div className="result-layer result-layer-root">
            <p className="result-layer-label">その根っこにある可能性</p>
            <p className="result-layer-text">{text?.sideB}</p>
          </div>
          {text?.closing && <p className="result-closing">{text.closing}</p>}
        </div>
        {showSecond && (
          <div className="result-adjacent" style={{ marginTop: 20 }}>
            <p className="result-adjacent-label">近くにあるかもしれないテーマ</p>
            <p className="result-adjacent-tag">{secondLabel}</p>
          </div>
        )}
      </ResultDetail>
    );
  }

  if (section === 'why') {
    return (
      <ResultDetail backLabel="結果に戻る" onBack={() => setSection(null)}>
        <p className="detail-eyebrow">なぜそうなっているか</p>
        {text?.jungNote && <p className="detail-body">{text.jungNote}</p>}
        {text?.biasNote && <p className="detail-body" style={{ marginTop: 12 }}>{text.biasNote}</p>}
        {topBiases.length > 0 && (
          <div className="result-biases-mini" style={{ marginTop: 20 }}>
            {topBiases.map((b, i) => (
              <div key={i} className={`result-bias-mini bias-rank-${i + 1}`}>
                <span className="bias-name-mini">{b.name}</span>
                <span className="bias-short-mini">{b.short}</span>
                {b.noteUrl && (
                  <a href={b.noteUrl} target="_blank" rel="noopener noreferrer" className="bias-note-link-mini">詳しく →</a>
                )}
              </div>
            ))}
          </div>
        )}
        {showForecast && (
          <div className="result-forecast" style={{ marginTop: 24 }}>
            <p className="result-section-title">このまま続くと</p>
            <p className="result-forecast-text">
              今の状態を放置した場合、あなたの中で「{thirdLabel}」という局面が顔を出してくる可能性があります。
            </p>
          </div>
        )}
      </ResultDetail>
    );
  }

  if (section === 'action') {
    return (
      <ResultDetail backLabel="結果に戻る" onBack={() => setSection(null)}>
        <p className="detail-eyebrow">今日の一歩</p>
        <p className="detail-phrase">{text?.action}</p>
      </ResultDetail>
    );
  }

  if (section === 'share') {
    return (
      <ResultDetail backLabel="結果に戻る" onBack={() => setSection(null)}>
        <ShareCard headline="今直面しているのは" mainText={label} subText="" tagline="" />
        <div style={{ marginTop: 16 }}>
          <ShareButtons shareText={shareText} />
        </div>
      </ResultDetail>
    );
  }

  if (section === 'wall') {
    return (
      <ResultDetail backLabel="結果に戻る" onBack={() => setSection(null)}>
        <OracleWall typeName={label} category="situation" />
      </ResultDetail>
    );
  }

  // ── ハブ画面 ────────────────────────────────
  return (
    <div className="result-hub">

      {/* 推論ログ（コンパクト） */}
      {result.evidenceLog?.length > 0 && (
        <div className="hub-readings">
          <p className="hub-readings-label">私はこう読みました。</p>
          {result.evidenceLog.slice(0, 2).map((e, i) => (
            <p key={i} className="hub-reading-item">{e}</p>
          ))}
        </div>
      )}

      {/* コア結果 */}
      <div className="hub-oracle">
        <p className="hub-oracle-eyebrow">今あなたが直面していること</p>
        <p className="hub-oracle-headline">{label}</p>
        {text?.hook && <p className="hub-oracle-preview">{text.hook}</p>}
      </div>

      {/* カードリスト */}
      <div className="hub-cards">
        {text && (
          <HubCard icon="🔍" title="今感じていることと根っこ"
            preview={text.sideA?.slice(0, 40) + '…'}
            onClick={() => setSection('layers')} />
        )}
        {text && (text.jungNote || text.biasNote) && (
          <HubCard icon="🧩" title="なぜそうなっているか"
            preview={text.jungNote?.slice(0, 35) + '…'}
            onClick={() => setSection('why')} />
        )}
        {text?.action && (
          <HubCard icon="🚶" title="今日の一歩"
            preview={text.action.slice(0, 40) + '…'}
            onClick={() => setSection('action')} />
        )}
        <HubCard icon="🗣" title="みんなのひとこと"
          preview="同じ状況の人たちのコメント"
          onClick={() => setSection('wall')} />
        <HubCard icon="↗" title="この結果をシェアする"
          preview="X・LINE・コピー"
          onClick={() => setSection('share')} />
      </div>

      <CrossFlowActions
        currentFlow="situation"
        onSwitchFlow={onSwitchFlow}
        onRetry={onRetry}
      />
    </div>
  );
}
