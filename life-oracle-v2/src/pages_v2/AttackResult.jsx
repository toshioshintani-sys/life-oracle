// 攻略型・結果表示
// 重要：相手の internalLabel（"決めつけ上司"等）はUIに一切出さない。
// 心理OSの機構説明・魔法のフレーズ・境界線サインだけを前面に出す。

import { useEffect } from 'react';
import { biasInfo } from '../data_v2/meta/biasInfo.js';
import ShareButtons     from '../components/ShareButtons.jsx';
import ShareCard        from '../components/ShareCard.jsx';
import CrossFlowActions from '../components/CrossFlowActions.jsx';
import { incrementOnce } from '../lib/stats.js';

const CONFIDENCE_TEXT = {
  high:   null,
  medium: 'いくつかの候補から、一番強く出ている動きです。',
  low:    '候補が複数あります。もう少し観察を続けると、輪郭がはっきりしてきます。',
};

export function AttackResult({ result, onRetry, onSwitchFlow }) {
  useEffect(() => { if (result?.type) incrementOnce('attack'); }, [result]);

  if (!result || !result.type) return null;
  const { type, confidence, keyAnswers, topBiases } = result;
  const confidenceNote = CONFIDENCE_TEXT[confidence];

  const biases = (topBiases ?? []).map(k => biasInfo[k]).filter(Boolean);

  return (
    <div className="result-screen">

      {/* ① あなたが見たもの（観察のサマリ） */}
      {keyAnswers && keyAnswers.length > 0 && (
        <div className="result-readings">
          <p className="result-readings-label">あなたが見たもの</p>
          {keyAnswers.map((a, i) => (
            <p key={i} className="result-reading-item">「{a}」</p>
          ))}
        </div>
      )}

      {/* ② この人がそう動く理由（心理OS） */}
      <div className="result-oracle">
        <p className="result-oracle-eyebrow">この人がそう動く理由</p>
        <p className="result-label-tag">{type.psychologyOS.mechanismShort}</p>
        {confidenceNote && (
          <p className="result-oracle-text" style={{ opacity: 0.7, marginTop: 8 }}>
            {confidenceNote}
          </p>
        )}
        <p className="result-oracle-text" style={{ marginTop: 12 }}>
          {type.psychologyOS.mechanismLong}
        </p>
        {biases.length > 0 && (
          <div className="result-biases-mini" style={{ marginTop: 12 }}>
            {biases.map((b, i) => (
              <div key={i} className={`result-bias-mini bias-rank-${i + 1}`}>
                <span className="bias-name-mini">{b.name}</span>
                <span className="bias-short-mini">{b.short}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ③ やってはいけないこと */}
      {type.ngActions && type.ngActions.length > 0 && (
        <div className="result-why-card">
          <p className="result-section-title">やってはいけないこと</p>
          {type.ngActions.slice(0, 1).map((ng, i) => (
            <div key={i}>
              <p className="result-why-text"><strong>{ng.what}</strong></p>
              <p className="result-why-text" style={{ marginTop: 6, opacity: 0.75 }}>
                {ng.why}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ④ 通じやすい一言（魔法のフレーズ） */}
      {type.magicPhrases && type.magicPhrases.length > 0 && (
        <div className="result-action">
          <p className="result-section-title">通じやすい一言</p>
          {type.magicPhrases.slice(0, 1).map((p, i) => (
            <div key={i}>
              <p className="result-recovery">「{p.text}」</p>
              <p className="result-why-text" style={{ marginTop: 8, opacity: 0.8 }}>
                効くメカニズム：{p.whyItWorks}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ⑤ 境界線のサイン */}
      {type.boundarySignal && (
        <div className="result-forecast">
          <p className="result-section-title">境界線のサイン</p>
          <p className="result-forecast-text">{type.boundarySignal}</p>
        </div>
      )}

      {/* ⑥ note への送客（notePublished=trueのみ表示） */}
      {type.noteUrl && type.notePublished && (
        <div className="result-adjacent">
          <p className="result-adjacent-label">この動きをさらに深く読む</p>
          <a
            href={type.noteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="result-adjacent-tag"
          >
            note 記事を読む
          </a>
        </div>
      )}

      {/* ⑦ シェアカード */}
      <ShareCard
        headline="あの人がそう動く理由"
        mainText={type.psychologyOS.mechanismShort}
        subText=""
        tagline=""
      />

      {/* ⑧ シェアボタン */}
      <ShareButtons
        shareText={`ライフオラクルであの人の動く理由がわかりました。\n"${type.psychologyOS.mechanismShort}"\n\n#ライフオラクル`}
      />

      {/* ⑨ クロスフロー導線 */}
      <CrossFlowActions
        currentFlow="attack"
        onSwitchFlow={onSwitchFlow}
        onRetry={onRetry}
      />

    </div>
  );
}
