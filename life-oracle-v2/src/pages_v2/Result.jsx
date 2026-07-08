import { useState, useEffect } from 'react';
import { getResultWithFallback } from '../data_v2/results/index.js';
import { biasInfo }              from '../data_v2/meta/biasInfo.js';
import CrossFlowActions          from '../components/CrossFlowActions.jsx';
import { NotePromo }             from '../components/NotePromo.jsx';
import { ResultDetail }          from '../components/ResultDetail.jsx';
import { OracleWall }            from './OracleWall.jsx';
import { incrementOnce }         from '../lib/stats.js';
import { trackEvent }            from '../lib/analytics.js';

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
  useEffect(() => { if (section) window.scrollTo({ top: 0, behavior: 'instant' }); }, [section]);

  if (!result) return null;

  const text        = getResultWithFallback(result.situation, result.age);
  const label       = SITUATION_LABELS[result.situation] ?? result.situation;
  const secondLabel = SITUATION_LABELS[result.secondSituation] ?? result.secondSituation;
  const showSecond  = (result.situationGap ?? 1) < 0.15 && result.secondSituation;
  const thirdLabel  = SITUATION_LABELS[result.thirdSituation];
  const showForecast = result.showThird && thirdLabel;
  const topBiases   = (result.topBiases ?? [])
    .filter(key => biasInfo[key])
    .map(key => biasInfo[key]);

  // ── サブページ（note・みんなのひとことのみカード）─────────────────
  if (section === 'wall') {
    return (
      <ResultDetail backLabel="結果に戻る" onBack={() => setSection(null)}>
        <OracleWall typeName={label} category="situation" />
      </ResultDetail>
    );
  }

  if (section === 'note') {
    return (
      <ResultDetail backLabel="結果に戻る" onBack={() => setSection(null)}>
        <p className="detail-eyebrow">この状況をもっと深く読む</p>
        <NotePromo />
        <a href="https://note.com/lifeoraclejp" target="_blank" rel="noopener noreferrer"
           className="detail-note-link" style={{ marginTop: 16, display: 'block' }}>
          全記事一覧を見る →
        </a>
      </ResultDetail>
    );
  }

  // ── メイン結果画面（スクロールだけで読み切れる）─────────────────────────
  return (
    <div className="result-hub">

      {/* 推論ログ */}
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

      {/* ── インライン本文（タップ不要） ── */}
      {text && (
        <div className="result-readout">

          {/* ① 今感じていることと根っこ（主コンテンツ）*/}
          <section className="readout-block readout-block--hero">
            <p className="detail-eyebrow">今感じていること</p>
            <p className="detail-body" style={{ lineHeight: 1.9 }}>{text.sideA}</p>
            <p className="detail-eyebrow" style={{ marginTop: 20 }}>その根っこにある可能性</p>
            <p className="detail-body" style={{ lineHeight: 1.9 }}>{text.sideB}</p>
            {text.closing && (
              <p className="result-closing" style={{ marginTop: 16 }}>{text.closing}</p>
            )}
            {showSecond && (
              <div className="result-adjacent" style={{ marginTop: 16 }}>
                <p className="result-adjacent-label">近くにあるかもしれないテーマ</p>
                <p className="result-adjacent-tag">{secondLabel}</p>
              </div>
            )}
          </section>

          {/* ② なぜそうなっているか */}
          {(text.jungNote || text.biasNote || topBiases.length > 0) && (
            <section className="readout-block">
              <p className="detail-eyebrow">なぜそうなっているか</p>
              {text.jungNote && <p className="detail-body">{text.jungNote}</p>}
              {text.biasNote && (
                <p className="detail-body" style={{ marginTop: 12 }}>{text.biasNote}</p>
              )}
              {topBiases.length > 0 && (
                <div className="result-biases-mini" style={{ marginTop: 20 }}>
                  {topBiases.map((b, i) => (
                    <div key={i} className={`result-bias-mini bias-rank-${i + 1}`}>
                      <span className="bias-name-mini">{b.name}</span>
                      <span className="bias-short-mini">{b.short}</span>
                      {b.noteUrl && new Date() >= new Date(b.noteScheduledAt ?? 0) && (
                        <a href={b.noteUrl} target="_blank" rel="noopener noreferrer" className="bias-note-link-mini">詳しく →</a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ③ 今日の一歩 */}
          {text.action && (
            <section className="readout-block">
              <p className="detail-eyebrow">今日の一歩</p>
              <p className="detail-phrase">{text.action}</p>
              <button
                className="ashita-copy-btn ashita-copy-btn--block"
                onClick={() => {
                  const shareText = `【今日の一歩 — ${label}】\n${text.action}\n\nライフオラクルで自分の状況を診断する: https://life-oracle.jp/`;
                  navigator.clipboard?.writeText(shareText).catch(() => {});
                  trackEvent('result_share_intent', { mode: 'situation', section: 'kyou_no_ippo', situation: result.situation });
                }}
              >コピーしてシェア</button>
            </section>
          )}

          {/* ④ このまま続くと（予測） */}
          {showForecast && (
            <section className="readout-block">
              <p className="detail-eyebrow">このまま続くと</p>
              <p className="detail-body">
                今の状態を放置した場合、あなたの中で「{thirdLabel}」という局面が顔を出してくる可能性があります。
              </p>
            </section>
          )}
        </div>
      )}

      {/* ── noteとみんなのひとことだけカード ── */}
      <div className="hub-cards">
        <HubCard icon="📖" title="note で深く読む"
          preview="記事・シリーズ・メンバーシップ"
          onClick={() => setSection('note')} />
        <HubCard icon="🗣" title="みんなのひとこと"
          preview="同じ状況の人たちのコメント"
          onClick={() => setSection('wall')} />
      </div>

      <CrossFlowActions
        currentFlow="situation"
        onSwitchFlow={onSwitchFlow}
        onRetry={onRetry}
      />
    </div>
  );
}
