import { useState, useEffect } from 'react';
import { cognitiveFunctionMap, famousPeople } from '../data_v2/meta/cognitiveFunctions.js';
import { biasInfo }          from '../data_v2/meta/biasInfo.js';
import mechanismsJson        from '../data_v2/meta/prescriptions_mechanism.json';
import CrossFlowActions      from '../components/CrossFlowActions.jsx';
import { NotePromo }         from '../components/NotePromo.jsx';
import { ResultDetail }      from '../components/ResultDetail.jsx';
import { OracleWall }        from './OracleWall.jsx';
import { incrementOnce }     from '../lib/stats.js';

const MECHANISMS = mechanismsJson.mechanisms;

// 処方箋の絞り込み用（任意・後から選べる）
const OCCUPATIONS = [
  '会社員', '公務員', '医療職', '教育職', '士業',
  'クリエイター', '接客', '調理', '理美容師', '介護',
  'フリーランス', '自営業', '一次産業', '建設業',
  '主婦/主夫', '非正規雇用', '学生', '無職',
];
const GENERATIONS = ['10代', '20代', '30代', '40代', '50代', '60代', '70代以上'];

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

export function MbtiResult({ result, occupation: occProp, generation: genProp, onRetry, onSwitchFlow }) {
  const [section, setSection]             = useState(null);
  const [typeProfiles, setTypeProfiles]   = useState(null);
  const [prescriptions, setPrescriptions] = useState(null);
  const [biasMessages, setBiasMessages]   = useState(null);
  const [loading, setLoading]             = useState(true);
  const [loadError, setLoadError]         = useState(false);
  const [presLoading, setPresLoading]     = useState(false);

  // 処方箋の絞り込みは「結果を読んだあと」に任意で選ぶ（診断直後はテキストを優先）
  const [occupation, setOccupation] = useState(occProp ?? null);
  const [generation, setGeneration] = useState(genProp ?? null);

  // 初期ロード: 表示に必要な2ファイルのみ（5.5MB のprescriptionsは除外）
  useEffect(() => {
    incrementOnce('mbti');
    Promise.all([
      fetch('/data/type_profiles.json').then(r => r.json()),
      fetch('/data/bias_messages.json').then(r => r.json()),
    ]).then(([tp, bm]) => {
      setTypeProfiles(tp);
      setBiasMessages(bm);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
      setLoadError(true);
    });
  }, []);

  // 処方箋は職業・年代が両方そろったときだけ遅延ロード（5.5MB）
  useEffect(() => {
    if (!occupation || !generation || prescriptions || presLoading) return;
    setPresLoading(true);
    fetch('/data/prescriptions.json')
      .then(r => r.json())
      .then(pr => { setPrescriptions(pr); setPresLoading(false); })
      .catch(() => setPresLoading(false));
  }, [occupation, generation, prescriptions, presLoading]);

  useEffect(() => { if (section) window.scrollTo({ top: 0, behavior: 'instant' }); }, [section]);

  if (!result) return null;

  if (loadError) {
    return (
      <div className="result-load-error">
        <p>データの読み込みに失敗しました。<br />通信状況を確認してもう一度お試しください。</p>
        <button onClick={onRetry}>もう一度試す</button>
      </div>
    );
  }

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

  // biasInfo に存在する正規のバイアス(B1-B12)だけを対象にする。
  // SIT など非バイアスのキーが混ざると表示が壊れるためフィルタする。
  const top2 = Object.entries(biasScores ?? {})
    .filter(([key, score]) => biasInfo[key] && score > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([key]) => key);

  const biasMsg = (idx) => (biasMessages && top2[idx])
    ? (biasMessages[`${jungTypeId}_${biasInfo[top2[idx]]?.messageKey}`] ?? null) : null;

  // ── 詳細ページ（今日の一歩・note・みんなのひとこと だけカード式）──────────
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

  if (section === 'wall') {
    return (
      <ResultDetail backLabel="結果に戻る" onBack={() => setSection(null)}>
        <OracleWall typeName={typeName} category="mbti" />
      </ResultDetail>
    );
  }

  if (section === 'note') {
    const typeNoteUrl = cognitiveFunctionMap[mbtiType]?.noteUrl ?? null;
    return (
      <ResultDetail backLabel="結果に戻る" onBack={() => setSection(null)}>
        <p className="detail-eyebrow">このタイプをもっと深く読む</p>
        {typeNoteUrl && (
          <a href={typeNoteUrl} target="_blank" rel="noopener noreferrer"
             className="detail-note-link">
            {typeName}の記事を読む →
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
          全記事一覧を見る →
        </a>
      </ResultDetail>
    );
  }

  // ── メイン結果（まず文章で読み切れる）────────────────────────────
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

      {/* ── 本文（インラインで読める。タップ不要）── */}
      <div className="result-readout">

        {/* なぜそれが起きるか */}
        {mechanism && (
          <section className="readout-block">
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
          </section>
        )}

        {/* 強み・心の癖 */}
        {typeProfile && (
          <section className="readout-block">
            <p className="detail-eyebrow">あなたの強み</p>
            <p className="detail-body">{typeProfile.praiseText}</p>
            <p className="detail-eyebrow" style={{ marginTop: 20 }}>心の癖</p>
            <p className="detail-body">{typeProfile.habitText}</p>
          </section>
        )}

        {/* 思考のクセ（バイアス上位2） */}
        {top2.length > 0 && (
          <section className="readout-block">
            <p className="detail-eyebrow">あなたの思考のクセ</p>
            {top2.map((biasId, idx) => {
              const info = biasInfo[biasId];
              const msg  = biasMsg(idx);
              return (
                <div key={biasId} className={`mbti-bias-card${idx === 0 ? ' mbti-bias-card--top' : ''}`}>
                  <div className="mbti-bias-card-header">
                    <span className="mbti-bias-rank">{idx + 1}位</span>
                    <span className="mbti-bias-name">{info?.name}</span>
                  </div>
                  <p className="mbti-bias-short">{info?.short}</p>
                  <p className="mbti-bias-msg">{msg ?? info?.description}</p>
                  {info?.noteUrl && new Date() >= new Date(info.noteScheduledAt ?? 0) && (
                    <a href={info.noteUrl} target="_blank" rel="noopener noreferrer" className="bias-note-link">
                      このバイアスを深掘りする →
                    </a>
                  )}
                </div>
              );
            })}
          </section>
        )}

        {/* 処方箋（職業・年代は任意・あとから選べる）*/}
        <section className="readout-block">
          <p className="detail-eyebrow">あなた専用の処方箋</p>
          {prescriptionText ? (
            <>
              <p className="detail-note" style={{ marginBottom: 10 }}>
                {[occupation, generation].filter(Boolean).join(' × ')}
              </p>
              <p className="detail-body">{prescriptionText}</p>
            </>
          ) : (
            <>
              <p className="detail-body" style={{ marginBottom: 14 }}>
                職業と年代を選ぶと、2,016通りからあなた専用の処方箋を表示します。
              </p>
              <div className="pres-picker">
                <p className="pres-picker-label">職業</p>
                <div className="pres-picker-grid">
                  {OCCUPATIONS.map(o => (
                    <button key={o}
                      className={`post-quiz-chip${occupation === o ? ' selected' : ''}`}
                      onClick={() => setOccupation(prev => prev === o ? null : o)}>
                      {o}
                    </button>
                  ))}
                </div>
                <p className="pres-picker-label" style={{ marginTop: 14 }}>年代</p>
                <div className="pres-picker-grid">
                  {GENERATIONS.map(g => (
                    <button key={g}
                      className={`post-quiz-chip${generation === g ? ' selected' : ''}`}
                      onClick={() => setGeneration(prev => prev === g ? null : g)}>
                      {g}
                    </button>
                  ))}
                </div>
                {occupation && generation && presLoading && (
                  <p className="detail-body" style={{ marginTop: 12 }}>処方箋を読み込んでいます…</p>
                )}
                {occupation && generation && !presLoading && prescriptions && !prescriptionText && (
                  <p className="detail-body" style={{ marginTop: 12 }}>該当するデータがありません。</p>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      {/* ── ここから下はカード（今日の一歩 以下）── */}
      <div className="hub-cards">
        {cf.todayAction && (
          <HubCard icon="⚡" title="今日ひとつだけ試すなら"
            preview={cf.todayAction.slice(0, 35) + '…'}
            onClick={() => setSection('action')} />
        )}
        <HubCard icon="📖" title="note で深く読む"
          preview="記事・シリーズ・メンバーシップ"
          onClick={() => setSection('note')} />
        <HubCard icon="🗣" title="みんなのひとこと"
          preview="同じタイプの人たちのコメント"
          onClick={() => setSection('wall')} />
      </div>

      <CrossFlowActions
        currentFlow="mbti"
        onSwitchFlow={onSwitchFlow}
        onRetry={onRetry}
      />
    </div>
  );
}
