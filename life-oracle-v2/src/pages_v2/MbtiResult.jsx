import { useState, useEffect } from 'react';
import { cognitiveFunctionMap, famousPeople } from '../data_v2/meta/cognitiveFunctions.js';
import { biasInfo } from '../data_v2/meta/biasInfo.js';

const MBTI_TO_JUNG = {
  ESTJ: 'Te-光', ENTJ: 'Te-影', ESFJ: 'Fe-光', ENFJ: 'Fe-影',
  ESTP: 'Se-光', ESFP: 'Se-影', ENTP: 'Ne-光', ENFP: 'Ne-影',
  ISTJ: 'Si-光', ISFJ: 'Si-影', ISTP: 'Ti-光', INTP: 'Ti-影',
  INTJ: 'Ni-光', INFJ: 'Ni-影', ISFP: 'Fi-光', INFP: 'Fi-影',
};

// 結果冒頭の「私はこう読みました」
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

export function MbtiResult({ result, occupation, generation, onRetry }) {
  const [typeProfiles, setTypeProfiles]   = useState(null);
  const [prescriptions, setPrescriptions] = useState(null);
  const [biasMessages, setBiasMessages]   = useState(null);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
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

  if (!result) return null;

  const { mbtiType, biasScores } = result;
  const jungTypeId  = MBTI_TO_JUNG[mbtiType] ?? mbtiType;
  const cf          = cognitiveFunctionMap[mbtiType] ?? {};
  const famous      = famousPeople[mbtiType]?.people ?? [];
  const reading     = TYPE_READING[mbtiType] ?? null;
  const typeProfile = typeProfiles?.[jungTypeId] ?? null;

  const prescriptionKey  = occupation && jungTypeId && generation
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

  return (
    <div className="mbti-result-screen">

      {/* 私はこう読みました */}
      {reading && (
        <div className="mbti-result-reading-intro">
          <p className="mbti-result-reading-label">私はこう読みました。</p>
          <p className="mbti-result-reading-text">{reading}</p>
        </div>
      )}

      {/* タイプ発表 */}
      <div className="mbti-result-type-block">
        <p className="mbti-result-type-code">{mbtiType}</p>
        <p className="mbti-result-light-name">{cf.lightName}</p>
        {famous.length > 0 && (
          <p className="mbti-result-famous-inline">{famous.join(' · ')} と同じタイプ</p>
        )}
        <div className="mbti-result-poles">
          <span className="mbti-result-pole mbti-result-pole--light">光：{cf.lightName}</span>
          <span className="mbti-result-pole mbti-result-pole--shadow">影：{cf.shadowName}</span>
        </div>
      </div>

      {/* 処方箋 */}
      {loading ? (
        <div className="mbti-result-loading">処方箋を読み込んでいます...</div>
      ) : (
        <div className="mbti-result-prescription">
          <p className="mbti-result-section-label">あなただけの処方箋</p>
          <p className="mbti-result-prescription-meta">
            {occupation} × {mbtiType} × {generation}
          </p>
          <p className="mbti-result-prescription-sub">
            職種・タイプ・年代の組み合わせ2,016通りから、あなた専用の処方箋を導き出しました。
          </p>
          {prescriptionText
            ? <p className="mbti-result-prescription-text">{prescriptionText}</p>
            : <p className="mbti-result-prescription-empty">該当する処方箋のデータがありません。</p>
          }
        </div>
      )}

      {/* 思考のクセ */}
      {top2.length > 0 && (
        <div className="mbti-result-biases">
          <p className="mbti-result-section-label">あなたの思考のクセ</p>
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
        </div>
      )}

      {/* 強み・心の癖 */}
      {typeProfile && (
        <div className="mbti-result-profile">
          <p className="mbti-result-section-label">あなたの強み</p>
          <p className="mbti-result-profile-text">{typeProfile.praiseText}</p>
          <p className="mbti-result-section-label" style={{ marginTop: 16 }}>心の癖</p>
          <p className="mbti-result-profile-text">{typeProfile.habitText}</p>
        </div>
      )}

      {/* 今日のアクション */}
      {cf.todayAction && (
        <div className="mbti-result-action">
          <p className="mbti-result-action-label">今日ひとつだけ試すなら</p>
          <p className="mbti-result-action-text">{cf.todayAction}</p>
        </div>
      )}

      <button className="mbti-result-retry" onClick={onRetry}>
        もう一度診断する
      </button>
    </div>
  );
}
