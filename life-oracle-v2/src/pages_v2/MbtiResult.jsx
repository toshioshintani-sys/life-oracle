import { useState, useEffect } from 'react';
import { cognitiveFunctionMap, famousPeople, MBTI_TO_JUNG, JUNG_LABEL } from '../data_v2/meta/cognitiveFunctions.js';
import { biasInfo }          from '../data_v2/meta/biasInfo.js';
import mechanismsJson        from '../data_v2/meta/prescriptions_mechanism.json';
import CrossFlowActions      from '../components/CrossFlowActions.jsx';
import { NotePromo }         from '../components/NotePromo.jsx';
import { ResultDetail }      from '../components/ResultDetail.jsx';
import { OracleWall }        from './OracleWall.jsx';
import { incrementOnce }     from '../lib/stats.js';
import { trackEvent }        from '../lib/analytics.js';

const MECHANISMS = mechanismsJson.mechanisms;

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

// 語りたくなる1行（殺し文句）— TYPE_READING の核だけを凝縮
const KILLER_LINE = {
  ENTJ: '「決める」ことで、周囲が動き出すのを知っている人です。',
  INTJ: '遠くを見ながら、静かに動いている人です。',
  ENTP: '「まだ誰も気づいていないこと」を見つけるのが好きな人です。',
  INTP: '自分の中に体系を持っている人です。',
  ENFJ: '人のことを、自分のことのように考えている人です。',
  INFJ: '静かですが、強い人です。',
  ENFP: '人に希望を与えることが、あなたの自然な在り方です。',
  INFP: '自分に正直に生きている人です。',
  ESTJ: '責任を引き受ける姿勢がある。頼まれると断れない人でもありますね。',
  ISTJ: '約束を守ることを、当たり前だと思っている人です。',
  ESTP: '考えるより先に動ける人です。',
  ISTP: '静かに観察してから動く人。無駄がない。',
  ESFJ: '場の空気を読むのが、自然にできてしまう人です。',
  ISFJ: '気づかれないところで、ずっと支えている人です。',
  ESFP: '一緒にいると、なぜか明るくなる人です。',
  ISFP: '感じたことに、正直な人です。',
};

// 「あなたを“神”にする」ChatGPTプロンプトを診断結果から組み立てる純関数。
// ・タイプ名ラベル（先読み人 等）は画像に出さず、性格の“表現”で描かせる
// ・処方箋は全文をプロンプトに載せ、画像内は要点1文に凝縮（可読性確保）
// ・性別はアプリで聞かず、ChatGPT に会話履歴から推定させる
function buildDeityPrompt({ generation, occupation, killerLine, praiseText, habitText, mechanismWhy, biasName, biasDesc, prescriptionText }) {
  const attrs   = [generation, occupation].filter(Boolean).join('・');
  const persona = [killerLine, praiseText, habitText].filter(Boolean).join(' ');
  const lines = [
    'あなた(ChatGPT)は「ライフオラクル」の神格化絵師です。次の手順で進めてください。',
    '',
    '【手順1：私の性別を推定（画像に反映するだけ・文章では説明しない）】',
    'これまでの私との会話やメモリから私の性別を推定し、画像に反映して。推定の説明文は書かないこと。確信が持てない場合のみ、一言だけ確認して。',
    attrs ? `私の固定属性：${attrs}。` : '',
    '',
    '【手順2：私を“神”として描く（縦長ポスター 2:3）】',
    '・上記の年代・性別・職業を母体にした日本の神。職業の要素（服装・道具）が神衣・神器へ昇華するように。',
    '・様式：荘厳でシネマティック、静謐で神秘的、神話画の品格。戦闘感は出さず「自然の化身」として。高精細。',
    '・光と色：アンバーゴールドの神光＋深い藍の高コントラスト。画面内に「金の羅針盤」を神器として必ず配置。',
    '・構図：中央に神。周囲の余白に和文を“密”だが判読できる荘厳さ（御札・曼荼羅風）で配置。文字は明朝系。',
    '',
    '【私の人物像（※タイプ名のラベルは画像に書かない。下記の“性格”を絵と言葉で表現して）】',
    persona,
    mechanismWhy ? `背景：${mechanismWhy}` : '',
    biasName ? `思考のクセ：${biasName}（${biasDesc ?? ''}）` : '',
    prescriptionText ? `私への処方箋（全文）：${prescriptionText}` : '',
    '',
    '【画像内に描く日本語テキスト】',
    '・神名（私の性格から荘厳に創作。タイプ名ラベルは使わない）',
    '・神徳：私の強みを3〜5語の箇条で',
    '・試練と学び：私が気をつける点を3〜4語の箇条で',
    biasName ? `・思考のクセ：${biasName}` : '',
    prescriptionText ? '・処方箋は要点1文に凝縮して荘厳に' : '',
    '・私への一言（私らしさを突いた一文）',
    '・最下部に小さく：life-oracle.jp ｜ 本物の診断はこちら',
    '',
    '性別の推定や手順の説明は文章にせず、画像のみを生成して。誤字や文字崩れが出た箇所だけ描き直して。',
  ];
  return lines.filter((l) => l !== '').join('\n');
}

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
  const [loadError, setLoadError]         = useState(false);
  const [presLoading, setPresLoading]     = useState(false);

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

  // 処方箋は職業・年代が両方そろっているときだけ遅延ロード（5.5MB）
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
  const killerLine      = KILLER_LINE[mbtiType] ?? null;
  const typeProfile     = typeProfiles?.[jungTypeId] ?? null;
  // 2026-07-08 修正：表示名は JUNG_LABEL[jungTypeId] を正とする（cf.shadowName は誤ったv1由来の
  // 値を含むため直接使わない。cf.lightName は両モデル一致のためフォールバックとして使用可）。
  const jungFunction    = jungTypeId?.split('-')[0];
  const lightLabel      = JUNG_LABEL[`${jungFunction}-光`] ?? cf.lightName;
  const shadowLabel     = JUNG_LABEL[`${jungFunction}-影`] ?? cf.shadowName;
  const typeName        = isShadow ? shadowLabel : lightLabel;
  const mechanism       = MECHANISMS[jungTypeId] ?? null;
  const prescriptionKey = occupation && jungTypeId && generation
    ? `${occupation}_${jungTypeId}_${generation}` : '';
  const prescriptionText = prescriptions?.[prescriptionKey]?.text ?? null;

  // 明日の一手: 処方箋の第1文 → todayAction の順でフォールバック
  const itteText = prescriptionText
    ? (prescriptionText.split('。')[0] + '。')
    : (cf.todayAction ?? null);

  // biasInfo に存在する正規のバイアス(B1-B12)のみ対象
  const top2 = Object.entries(biasScores ?? {})
    .filter(([key, score]) => biasInfo[key] && score > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([key]) => key);

  const biasMsg = (idx) => (biasMessages && top2[idx])
    ? (biasMessages[`${jungTypeId}_${biasInfo[top2[idx]]?.messageKey}`] ?? null) : null;

  // 「あなたを“神”にする」プロンプト（結果の翻訳層のみ流す・ラベルは出さない）
  const deityPrompt = buildDeityPrompt({
    generation,
    occupation,
    killerLine,
    praiseText:   typeProfile?.praiseText,
    habitText:    typeProfile?.habitText,
    mechanismWhy: mechanism?.whyItEmerges,
    biasName:     biasInfo[top2[0]]?.name,
    biasDesc:     biasInfo[top2[0]]?.short,
    prescriptionText,
  });

  // ── サブページ（今日の一歩・note・みんなのひとこと だけカード）────────────
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
        <a href="https://note.com/lifeoraclejp" target="_blank" rel="noopener noreferrer"
           className="detail-note-link" style={{ marginTop: 16, display: 'block' }}>
          全記事一覧を見る →
        </a>
      </ResultDetail>
    );
  }

  // ── メイン結果画面（スクロールだけで読み切れる）────────────────────────────
  return (
    <div className="result-hub">

      {/* 殺し文句（語りたくなる1行）*/}
      {killerLine && (
        <div className="killer-line">
          <p className="killer-line-text">{killerLine}</p>
        </div>
      )}

      {/* 「私はこう読みました」 */}
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
          <span className="hub-pole hub-pole--light">光：{lightLabel}</span>
          <span className="hub-pole hub-pole--shadow">影：{shadowLabel}</span>
        </div>
      </div>

      {/* ── インライン本文（タップ不要） ── */}
      <div className="result-readout">

        {/* ① 処方箋（主役 — 最初に表示）*/}
        <section className="readout-block readout-block--hero">
          <p className="detail-eyebrow">あなた専用の処方箋</p>
          {presLoading ? (
            <p className="detail-body">読み込んでいます…</p>
          ) : prescriptionText ? (
            <>
              <p className="detail-note" style={{ marginBottom: 10 }}>
                {[occupation, generation].filter(Boolean).join(' × ')} ×{' '}
                {jungTypeId}の組み合わせ 2,016通りから導きました
              </p>
              <p className="detail-body" style={{ fontSize: 16, lineHeight: 1.9 }}>{prescriptionText}</p>
            </>
          ) : (occupation && generation) ? (
            <p className="detail-body">該当するデータがありません。</p>
          ) : (
            <p className="detail-body" style={{ lineHeight: 1.9 }}>
              職業・年代を設定していないため表示できません。<br />
              「もう一度診断」のあと職業・年代を選ぶと、2,016通りから<br />あなた専用の処方箋が出ます。
            </p>
          )}
        </section>

        {/* ② なぜそれが起きるか */}
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

        {/* ③ 思考のクセ */}
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

        {/* ④ 強み・心の癖 */}
        {typeProfile && (
          <section className="readout-block">
            <p className="detail-eyebrow">あなたの強み</p>
            <p className="detail-body" style={{ fontSize: 15, lineHeight: 1.9 }}>{typeProfile.praiseText}</p>
            <p className="detail-eyebrow" style={{ marginTop: 20 }}>心の癖</p>
            <p className="detail-body" style={{ fontSize: 15, lineHeight: 1.9 }}>{typeProfile.habitText}</p>
          </section>
        )}
      </div>

      {/* ── 明日の一手 ── */}
      {itteText && (
        <div className="ashita-no-itte">
          <p className="ashita-label">明日の一手</p>
          <p className="ashita-text">{itteText}</p>
          <button
            className="ashita-copy-btn"
            onClick={() => {
              const APP_URL = 'https://life-oracle.jp/';
              // ラベル（先読み人 等）は他者に伝わらないので出さず、性格を表現した殺し文句で誘う
              const hook = killerLine ?? itteText ?? 'ライフオラクルで自分の動き方が分かりました。';
              const shareText = `${hook}\n\nあなたの動き方は？ 無料で診断できます。`;
              trackEvent('result_share_intent', { mode: 'mbti', section: 'app_share', mbti_type: mbtiType });
              if (navigator.share) {
                navigator
                  .share({ title: 'ライフオラクル — 自分の動き方診断', text: shareText, url: APP_URL })
                  .catch(() => {});
              } else {
                navigator.clipboard?.writeText(`${shareText}\n${APP_URL}`).catch(() => {});
              }
            }}
          >この結果をシェア</button>
        </div>
      )}

      {/* ── あなたを“神”にするプロンプト ── */}
      <div className="ashita-no-itte">
        <p className="ashita-label">あなたを“神”にする</p>
        <p className="ashita-text" style={{ fontSize: 14 }}>
          診断結果をもとに、ChatGPT で「自分を模した神」の一枚絵が作れます。
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            className="ashita-copy-btn"
            onClick={() => {
              navigator.clipboard?.writeText(deityPrompt).catch(() => {});
              trackEvent('deity_prompt_copy', { mode: 'mbti', mbti_type: mbtiType });
            }}
          >プロンプトをコピー</button>
          <button
            className="ashita-copy-btn"
            onClick={() => {
              navigator.clipboard?.writeText(deityPrompt).catch(() => {});
              window.open('https://chatgpt.com/', '_blank', 'noopener');
              trackEvent('deity_prompt_open_chatgpt', { mode: 'mbti', mbti_type: mbtiType });
            }}
          >ChatGPTで開く</button>
        </div>
        <p className="detail-note" style={{ marginTop: 8 }}>
          コピーしたプロンプトを ChatGPT に貼り付けてください。
        </p>
      </div>

      {/* ── 今日の一歩以下はカード ── */}
      <div className="hub-cards">
        {cf.todayAction && (
          <HubCard icon="⚡" title="今日ひとつだけ試すなら"
            preview={cf.todayAction.slice(0, 35) + '…'}
            onClick={() => setSection('action')} />
        )}
        <HubCard icon="📖" title="note で深く読む"
          preview="記事・シリーズ"
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
