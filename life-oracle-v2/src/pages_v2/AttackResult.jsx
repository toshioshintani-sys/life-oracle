// 攻略型・結果表示
// 重要：相手の internalLabel（"決めつけ上司"等）はUIに一切出さない。

import { useState, useEffect } from 'react';
import { biasInfo }         from '../data_v2/meta/biasInfo.js';
import CrossFlowActions     from '../components/CrossFlowActions.jsx';
import { NotePromo }        from '../components/NotePromo.jsx';
import { ResultDetail }     from '../components/ResultDetail.jsx';
import { OracleWall }       from './OracleWall.jsx';
import { incrementOnce }    from '../lib/stats.js';

const CONFIDENCE_TEXT = {
  medium: 'いくつかの候補から、一番強く出ている動きです。',
  low:    '候補が複数あります。もう少し観察を続けると、輪郭がはっきりしてきます。',
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

export function AttackResult({ result, onRetry, onSwitchFlow }) {
  const [section, setSection] = useState(null);

  useEffect(() => { if (result?.type) incrementOnce('attack'); }, [result]);
  useEffect(() => { if (section) window.scrollTo({ top: 0, behavior: 'instant' }); }, [section]);

  if (!result || !result.type) return null;
  const { type, confidence, keyAnswers, topBiases } = result;
  const confidenceNote = CONFIDENCE_TEXT[confidence] ?? null;
  const biases = (topBiases ?? [])
    .filter(k => biasInfo[k])
    .map(k => biasInfo[k]);
  const wallName = type.psychologyOS.mechanismShort;

  // ── サブページ（noteとみんなのひとことのみカード）────────────────────
  if (section === 'note') {
    return (
      <ResultDetail backLabel="結果に戻る" onBack={() => setSection(null)}>
        <p className="detail-eyebrow">この動きをもっと深く読む</p>
        {type.noteUrl && type.notePublished && (
          <a href={type.noteUrl} target="_blank" rel="noopener noreferrer"
             className="detail-note-link">
            この人のトリセツ記事を読む →
          </a>
        )}
        <NotePromo />
        <a href="https://note.com/lifeoraclejp" target="_blank" rel="noopener noreferrer"
           className="detail-note-link" style={{ marginTop: 16, display: 'block' }}>
          全50本の記事一覧を見る →
        </a>
      </ResultDetail>
    );
  }

  if (section === 'wall') {
    return (
      <ResultDetail backLabel="結果に戻る" onBack={() => setSection(null)}>
        <OracleWall typeName={wallName} category="attack" />
      </ResultDetail>
    );
  }

  // ── メイン結果画面（スクロールだけで読み切れる）─────────────────────────
  return (
    <div className="result-hub">

      {/* 観察サマリ */}
      {keyAnswers && keyAnswers.length > 0 && (
        <div className="hub-readings">
          <p className="hub-readings-label">あなたが見たもの</p>
          {keyAnswers.map((a, i) => (
            <p key={i} className="hub-reading-item">「{a}」</p>
          ))}
        </div>
      )}

      {/* コア結果 */}
      <div className="hub-oracle">
        <p className="hub-oracle-eyebrow">この人がそう動く理由</p>
        <p className="hub-oracle-headline">{type.psychologyOS.mechanismShort}</p>
        {confidenceNote && <p className="hub-oracle-note">{confidenceNote}</p>}
      </div>

      {/* ── インライン本文（タップ不要） ── */}
      <div className="result-readout">

        {/* ① 心理の仕組み（主コンテンツ）*/}
        <section className="readout-block readout-block--hero">
          <p className="detail-eyebrow">この人がそう動く理由</p>
          <p className="detail-body" style={{ lineHeight: 1.9 }}>{type.psychologyOS.mechanismLong}</p>
          {biases.length > 0 && (
            <div className="result-biases-mini" style={{ marginTop: 20 }}>
              {biases.map((b, i) => (
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

        {/* ② やってはいけないこと */}
        {type.ngActions?.length > 0 && (
          <section className="readout-block">
            <p className="detail-eyebrow">やってはいけないこと</p>
            {type.ngActions.map((ng, i) => (
              <div key={i} className="detail-item" style={{ marginBottom: i < type.ngActions.length - 1 ? 18 : 0 }}>
                <p className="detail-headline" style={{ fontSize: 17 }}>{ng.what}</p>
                <p className="detail-body">{ng.why}</p>
              </div>
            ))}
          </section>
        )}

        {/* ③ 通じやすい一言 */}
        {type.magicPhrases?.length > 0 && (
          <section className="readout-block">
            <p className="detail-eyebrow">通じやすい一言</p>
            {type.magicPhrases.map((p, i) => (
              <div key={i} className="detail-item" style={{ marginBottom: i < type.magicPhrases.length - 1 ? 18 : 0 }}>
                <p className="detail-phrase">「{p.text}」</p>
                <p className="detail-body" style={{ marginTop: 8 }}>効くメカニズム：{p.whyItWorks}</p>
              </div>
            ))}
          </section>
        )}

        {/* ④ 境界線のサイン */}
        {type.boundarySignal && (
          <section className="readout-block">
            <p className="detail-eyebrow">境界線のサイン</p>
            <p className="detail-body" style={{ fontSize: 16, lineHeight: 1.9 }}>{type.boundarySignal}</p>
          </section>
        )}
      </div>

      {/* ── noteとみんなのひとことだけカード ── */}
      <div className="hub-cards">
        <HubCard icon="📖" title="note で深く読む"
          preview="記事・シリーズ"
          onClick={() => setSection('note')} />
        <HubCard icon="🗣" title="みんなのひとこと"
          preview="同じ結果の人たちのコメント"
          onClick={() => setSection('wall')} />
      </div>

      <CrossFlowActions
        currentFlow="attack"
        onSwitchFlow={onSwitchFlow}
        onRetry={onRetry}
      />
    </div>
  );
}
