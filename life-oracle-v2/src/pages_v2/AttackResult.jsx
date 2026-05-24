// 攻略型・結果表示（ハブ＋詳細ページ構造）
// 重要：相手の internalLabel（"決めつけ上司"等）はUIに一切出さない。

import { useState, useEffect } from 'react';
import { biasInfo }         from '../data_v2/meta/biasInfo.js';
import ShareButtons         from '../components/ShareButtons.jsx';
import ShareCard            from '../components/ShareCard.jsx';
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
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [section]);

  if (!result || !result.type) return null;
  const { type, confidence, keyAnswers, topBiases } = result;
  const confidenceNote = CONFIDENCE_TEXT[confidence] ?? null;
  const biases = (topBiases ?? []).map(k => biasInfo[k]).filter(Boolean);
  const shareText = `ライフオラクルであの人の動く理由がわかりました。\n"${type.psychologyOS.mechanismShort}"\n\n#ライフオラクル`;
  const wallName  = type.psychologyOS.mechanismShort;

  // ── 詳細ページ ──────────────────────────────
  if (section === 'mechanism') {
    return (
      <ResultDetail backLabel="結果に戻る" onBack={() => setSection(null)}>
        <p className="detail-eyebrow">この人がそう動く理由</p>
        <p className="detail-headline">{type.psychologyOS.mechanismShort}</p>
        {confidenceNote && <p className="detail-note">{confidenceNote}</p>}
        <p className="detail-body">{type.psychologyOS.mechanismLong}</p>
        {biases.length > 0 && (
          <div className="result-biases-mini" style={{ marginTop: 20 }}>
            {biases.map((b, i) => (
              <div key={i} className={`result-bias-mini bias-rank-${i + 1}`}>
                <span className="bias-name-mini">{b.name}</span>
                <span className="bias-short-mini">{b.short}</span>
              </div>
            ))}
          </div>
        )}
      </ResultDetail>
    );
  }

  if (section === 'ng') {
    return (
      <ResultDetail backLabel="結果に戻る" onBack={() => setSection(null)}>
        <p className="detail-eyebrow">やってはいけないこと</p>
        {type.ngActions.map((ng, i) => (
          <div key={i} className="detail-item">
            <p className="detail-headline" style={{ fontSize: 18 }}>{ng.what}</p>
            <p className="detail-body">{ng.why}</p>
          </div>
        ))}
      </ResultDetail>
    );
  }

  if (section === 'magic') {
    return (
      <ResultDetail backLabel="結果に戻る" onBack={() => setSection(null)}>
        <p className="detail-eyebrow">通じやすい一言</p>
        {type.magicPhrases.map((p, i) => (
          <div key={i} className="detail-item">
            <p className="detail-phrase">「{p.text}」</p>
            <p className="detail-body" style={{ marginTop: 10 }}>効くメカニズム：{p.whyItWorks}</p>
          </div>
        ))}
      </ResultDetail>
    );
  }

  if (section === 'boundary') {
    return (
      <ResultDetail backLabel="結果に戻る" onBack={() => setSection(null)}>
        <p className="detail-eyebrow">境界線のサイン</p>
        <p className="detail-body" style={{ fontSize: 17, lineHeight: 1.8 }}>{type.boundarySignal}</p>
      </ResultDetail>
    );
  }

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
        <a
          href="https://note.com/lifeoraclejp"
          target="_blank"
          rel="noopener noreferrer"
          className="detail-note-link"
          style={{ marginTop: 16, display: 'block' }}
        >
          全50本の記事一覧を見る →
        </a>
      </ResultDetail>
    );
  }

  if (section === 'share') {
    return (
      <ResultDetail backLabel="結果に戻る" onBack={() => setSection(null)}>
        <ShareCard
          headline="あの人がそう動く理由"
          mainText={type.psychologyOS.mechanismShort}
          subText="" tagline=""
        />
        <div style={{ marginTop: 16 }}>
          <ShareButtons shareText={shareText} />
        </div>
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

  // ── ハブ画面 ────────────────────────────────
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
        <p className="hub-oracle-preview">
          {type.psychologyOS.mechanismLong.slice(0, 60)}…
        </p>
      </div>

      {/* カードリスト */}
      <div className="hub-cards">
        <HubCard icon="🧠" title="心理の仕組みを詳しく読む"
          preview={type.psychologyOS.mechanismLong.slice(0, 35) + '…'}
          onClick={() => setSection('mechanism')} />
        {type.ngActions?.length > 0 && (
          <HubCard icon="⚠️" title="やってはいけないこと"
            preview={type.ngActions[0].what}
            onClick={() => setSection('ng')} />
        )}
        {type.magicPhrases?.length > 0 && (
          <HubCard icon="💬" title="通じやすい一言"
            preview={`「${type.magicPhrases[0].text}」`}
            onClick={() => setSection('magic')} />
        )}
        {type.boundarySignal && (
          <HubCard icon="🛑" title="境界線のサイン"
            preview={type.boundarySignal.slice(0, 35) + '…'}
            onClick={() => setSection('boundary')} />
        )}
        <HubCard icon="📖" title="note で深く読む"
          preview="記事・シリーズ・メンバーシップ"
          onClick={() => setSection('note')} />
        <HubCard icon="🗣" title="みんなのひとこと"
          preview="同じ結果の人たちのコメント"
          onClick={() => setSection('wall')} />
        <HubCard icon="↗" title="この結果をシェアする"
          preview="X・LINE・コピー"
          onClick={() => setSection('share')} />
      </div>

      {/* クロスフロー */}
      <CrossFlowActions
        currentFlow="attack"
        onSwitchFlow={onSwitchFlow}
        onRetry={onRetry}
      />
    </div>
  );
}
