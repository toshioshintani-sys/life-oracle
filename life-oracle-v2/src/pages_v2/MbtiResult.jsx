import { useState, useEffect } from 'react';
import { cognitiveFunctionMap, famousPeople } from '../data_v2/meta/cognitiveFunctions.js';
import { biasInfo }          from '../data_v2/meta/biasInfo.js';
import mechanismsJson        from '../data_v2/meta/prescriptions_mechanism.json';
import ShareButtons          from '../components/ShareButtons.jsx';
import ShareCard             from '../components/ShareCard.jsx';
import CrossFlowActions      from '../components/CrossFlowActions.jsx';
import { ResultDetail }      from '../components/ResultDetail.jsx';
import { OracleWall }        from './OracleWall.jsx';
import { incrementOnce }     from '../lib/stats.js';

const MECHANISMS = mechanismsJson.mechanisms;

const MBTI_TO_JUNG = {
  ESTJ: 'Te-光', ENTJ: 'Te-影', ESFJ: 'Fe-光', ENFJ: 'Fe-影',
  ESTP: 'Se-光', ESFP: 'Se-影', ENTP: 'Ne-光', ENFP: 'Ne-影',
  ISTJ: 'Si-光', ISFJ: 'Si-影', ISTP: 'Ti-光', INTP: 'Ti-影',
  INTJ: 'Ni-光', INFJ: 'Ni-影', ISFP: 'Fi-光', INFP: 'Fi-影',
};

const TYPE_READING = {
  ENTJ: 'あなたの答えを見ていると、一つのことが見えました。あなたは「決める」ことで、周囲が動き出すのを知っている人です。',
  INTJ: 'あなたの答えには一貫した線があります。遠くを見ながら、静かに動いている人です。',
  ENTP: '答えのパターンから分かります。あなたは「まだ誰も気づいていないこと」を見つけるのが好きな人です。',
  INTP: 'あなたが選んだ答えは、細部まで正確であろうとしています。自分の中に体系を持っている人です。',
  ENFJ: 'あなたの答えを読むと、人のことを自分のことのように考えている人だと分かります。',
  INFJ: '答えの奥に、何か大きなものを守ろうとしている意志が見えます。静かですが、強い人です。',
  ENFP: 'あなたの答えは、可能性に向かって開いています。人に希望を与えることが、あなたの自然な在り方です。',
  INFP: '答えのひとつひとつに、あなた自身の価値観が滲んでいます。自分に正直に生きている人です。',
  ESTJ: 'あなたの答えには、責任を引き受ける姿勢があります。頼まれると断れない人でもありますね。',
  ISTJ: '答えに揺らぎがない。約束を守ることを、当たり前だと思っている人です。',
  ESTP: 'あなたの答えは速く、今この瞬間に向いています。考えるより先に動ける人です。',
  ISTP: '答えのパターンから、あなたは静かに観察してから動く人だと分かります。無駄がない。',
  ESFJ: 'あなたの答えには、周囲への気遣いが自然に入っています。場の空気を読むのが得意な人です。',
  ISFJ: '答えを見ていると、あなたが大切にしているものが伝わってきます。気づかれないところで支えている人です。',
  ESFP: 'あなたの答えには、今この場を楽しもうとするエネルギーがあります。一緒にいると明るくなる人です。',
  ISFP: '答えのひとつひとつが、あなた自身のペースで選ばれています。感じたことに正直な人です。',
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

export function MbtiResult({ result, occupation, generation, onRetry, onSwitchFlow }) {
  const [section, setSection]             = useState(null);
  const [typeProfiles, setTypeProfiles]   = useState(null);
  const [prescriptions, setPrescriptions] = useState(null);
  const [biasMessages, setBiasMessages]   = useState(null);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    incrementOnce('mbti');
    Promise.all([
      fetch('/data/type_profiles.json').then(r => r.json()),
      fetch('/data/prescriptions.json').then(r => r.json()),
      fetch('/data/bias_messages.json').then(r => r.json()),
    ]).then(([tp, pr, bm]) => {
      setTypeProfiles(tp);
      setPrescriptions(pr);
      setBiasMessages(bm);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [section]);

  if (!result) return null;

  const { mbtiType, biasScores, fromDirectSelection } = result;
  const jungTypeId      = MBTI_TO_JUNG[mbtiType] ?? mbtiType;
  const isShadow        = jungTypeId?.endsWith('-影');
  const cf              = cognitiveFunctionMap[mbtiType] ?? {};
  const famous          = famousPeople[mbtiType]?.people ?? [];
  const reading         = TYPE_READING[mbtiType] ?? null;
  const typeProfile     = typeProfiles?.[jungTypeId] ?? null;
  const typeName        = isShadow ? cf.shadowName : cf.lightName;
  const mechanism       = MECHANISMS[jungTypeId] ?? null;
  const prescriptionKey = occupation && jungTypeId && generation
    ? `${occupation}_${jungTypeId}_${generation}` : '';
  const prescriptionText = prescriptions?.[prescriptionKey]?.text ?? null;

  const top2 = Object.entries(biasScores ?? {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([key]) => key);

  const biasMsg1 = biasMessages && top2[0]
    ? (biasMessages[`${jungTypeId}_${biasInfo[top2[0]]?.messageKey}`] ?? null) : null;
  const biasMsg2 = biasMessages && top2[1]
    ? (biasMessages[`${jungTypeId}_${biasInfo[top2[1]]?.messageKey}`] ?? null) : null;

  const shareText = `ライフオラクルで自分の動き方を読み解きました。\n私は〈${typeName}〉(${jungTypeId})\n${isShadow ? `光は${cf.lightName}` : `影は${cf.shadowName}`}\n\nあなたの動き方は？ #ライフオラクル`;

  // ── 詳細ページ ──────────────────────────────
  if (section === 'action') {
    return (
      <ResultDetail backLabel="結果に戻る" onBack={() => setSection(null)}>
        <p className="detail-eyebrow">今日ひとつだけ試すなら</p>
        <p className="detail-phrase">{cf.todayAction}</p>
        {mechanism && isShadow && mechanism.microInterventions?.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <p className="detail-eyebrow">明日のミクロアクション</p>
            {mechanism.microInterventions.map((mi, i) => (
              <div key={i} className="detail-item">
                <p className="detail-headline" style={{ fontSize: 16 }}>{mi.action}</p>
                <p className="detail-body">効くメカニズム：{mi.whyItWorks}</p>
              </div>
            ))}
          </div>
        )}
      </ResultDetail>
    );
  }

  if (section === 'mechanism') {
    return (
      <ResultDetail backLabel="結果に戻る" onBack={() => setSection(null)}>
        {mechanism ? (
          <>
            <p className="detail-eyebrow">なぜそれが起きるか</p>
            <p className="detail-headline">{mechanism.mechanismName}</p>
            <p className="detail-body">{mechanism.whyItEmerges}</p>
            {isShadow && mechanism.whyItPersists && (
              <p className="detail-body" style={{ marginTop: 12 }}>{mechanism.whyItPersists}</p>
            )}
            {isShadow && mechanism.interventionPoint && (
              <p className="detail-body" style={{ marginTop: 12, opacity: 0.85 }}>
                <strong>介入のポイント：</strong>{mechanism.interventionPoint}
              </p>
            )}
            {!isShadow && mechanism.shortBenefit && (
              <p className="detail-body" style={{ marginTop: 12 }}>
                <strong>効く場面：</strong>{mechanism.shortBenefit}
              </p>
            )}
            {!isShadow && mechanism.whenItHurts && (
              <p className="detail-body" style={{ marginTop: 8, opacity: 0.85 }}>
                <strong>裏返るとき：</strong>{mechanism.whenItHurts}
              </p>
            )}
          </>
        ) : (
          <p className="detail-body">データがありません。</p>
        )}
      </ResultDetail>
    );
  }

  if (section === 'prescription') {
    return (
      <ResultDetail backLabel="結果に戻る" onBack={() => setSection(null)}>
        <p className="detail-eyebrow">あなた専用の処方箋</p>
        <p className="detail-note">{occupation} × {jungTypeId} × {generation}</p>
        <p className="detail-note" style={{ marginBottom: 16 }}>
          職種・タイプ・年代の組み合わせ2,016通りから導き出しました。
        </p>
        {loading ? (
          <p className="detail-body">読み込んでいます…</p>
        ) : prescriptionText ? (
          <p className="detail-body" style={{ fontSize: 16, lineHeight: 1.9 }}>{prescriptionText}</p>
        ) : (
          <p className="detail-body">該当するデータがありません。</p>
        )}
      </ResultDetail>
    );
  }

  if (section === 'biases') {
    return (
      <ResultDetail backLabel="結果に戻る" onBack={() => setSection(null)}>
        <p className="detail-eyebrow">あなたの思考のクセ</p>
        {top2.map((biasId, idx) => {
          const info = biasInfo[biasId];
          const msg  = idx === 0 ? biasMsg1 : biasMsg2;
          return (
            <div key={biasId} className={`mbti-bias-card${idx === 0 ? ' mbti-bias-card--top' : ''}`}>
              <div className="mbti-bias-card-header">
                <span className="mbti-bias-rank">{idx + 1}位</span>
                <span className="mbti-bias-name">{info?.name}</span>
              </div>
              <p className="mbti-bias-short">{info?.short}</p>
              <p className="mbti-bias-msg">{msg ?? info?.description}</p>
            </div>
          );
        })}
      </ResultDetail>
    );
  }

  if (section === 'profile') {
    return (
      <ResultDetail backLabel="結果に戻る" onBack={() => setSection(null)}>
        {typeProfile ? (
          <>
            <p className="detail-eyebrow">あなたの強み</p>
            <p className="detail-body" style={{ fontSize: 16, lineHeight: 1.9 }}>{typeProfile.praiseText}</p>
            <p className="detail-eyebrow" style={{ marginTop: 24 }}>心の癖</p>
            <p className="detail-body" style={{ fontSize: 16, lineHeight: 1.9 }}>{typeProfile.habitText}</p>
          </>
        ) : (
          <p className="detail-body">読み込んでいます…</p>
        )}
      </ResultDetail>
    );
  }

  if (section === 'share') {
    return (
      <ResultDetail backLabel="結果に戻る" onBack={() => setSection(null)}>
        <ShareCard
          headline="私の動き方は"
          mainText={typeName}
          subText={jungTypeId}
          tagline={isShadow ? `光は${cf.lightName}` : `影は${cf.shadowName}`}
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
        <OracleWall typeName={typeName} category="mbti" />
      </ResultDetail>
    );
  }

  // ── ハブ画面 ────────────────────────────────
  return (
    <div className="result-hub">

      {/* 「私はこう読みました」（診断経由のみ） */}
      {reading && !fromDirectSelection && (
        <div className="hub-readings">
          <p className="hub-readings-label">私はこう読みました。</p>
          <p className="hub-reading-item">{reading}</p>
        </div>
      )}

      {/* タイプ発表 */}
      <div className="hub-oracle">
        <p className="hub-oracle-eyebrow">あなたの動き方</p>
        <p className="hub-oracle-headline">{typeName}</p>
        <p className="hub-oracle-sub">{jungTypeId}</p>
        {famous.length > 0 && (
          <p className="hub-oracle-famous">{famous.join(' · ')} と同じパターン</p>
        )}
        <div className="hub-poles">
          <span className="hub-pole hub-pole--light">光：{cf.lightName}</span>
          <span className="hub-pole hub-pole--shadow">影：{cf.shadowName}</span>
        </div>
      </div>

      {/* カードリスト */}
      <div className="hub-cards">
        {cf.todayAction && (
          <HubCard icon="⚡" title="今日ひとつだけ試すなら"
            preview={cf.todayAction.slice(0, 35) + '…'}
            onClick={() => setSection('action')} />
        )}
        {mechanism && (
          <HubCard icon="🧠" title="なぜそれが起きるか"
            preview={mechanism.mechanismName}
            onClick={() => setSection('mechanism')} />
        )}
        <HubCard icon="📋" title="あなた専用の処方箋"
          preview={`${occupation} × ${jungTypeId} × ${generation}`}
          onClick={() => setSection('prescription')} />
        {top2.length > 0 && (
          <HubCard icon="🎯" title="あなたの思考のクセ"
            preview={biasInfo[top2[0]]?.name + ' ほか'}
            onClick={() => setSection('biases')} />
        )}
        {(typeProfile || !loading) && (
          <HubCard icon="✨" title="あなたの強み・心の癖"
            preview={typeProfile?.praiseText?.slice(0, 35) + '…'}
            onClick={() => setSection('profile')} />
        )}
        <HubCard icon="🗣" title="みんなのひとこと"
          preview="同じタイプの人たちのコメント"
          onClick={() => setSection('wall')} />
        <HubCard icon="↗" title="この結果をシェアする"
          preview="X・LINE・コピー"
          onClick={() => setSection('share')} />
      </div>

      <CrossFlowActions
        currentFlow="mbti"
        onSwitchFlow={onSwitchFlow}
        onRetry={onRetry}
      />
    </div>
  );
}
