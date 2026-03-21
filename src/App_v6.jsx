import { useState, useEffect, useRef } from "react";
import { questions } from "./data/questions.js";
import { biasQuestions } from "./data/biasQuestions.js";
import { calcScore, getTypeName, calcBiasScores, biasInfo } from "./utils/scoring.js";
import { OCCUPATIONS_18, GENERATIONS_7 } from "../life_oracle_questions_data.js";
import MapPage from "./pages/MapPage.jsx";
import ResultCard from "./components/ResultCard.jsx";

// ─── 定数 ────────────────────────────────────────────────
const CARD_STYLE = {
  background: "#1a1a2e",
  border: "1px solid rgba(196, 148, 10, 0.25)",
  borderRadius: 16,
  padding: "24px 20px",
  marginBottom: 20,
};
const ACCENT = "#C4940A";
const TEXT = "#e8e0d0";
const TEXT_MUTED = "#8a7a6a";

const backBtnStyle = {
  background: "none",
  border: "none",
  color: TEXT_MUTED,
  fontSize: 12,
  cursor: "pointer",
  padding: "0 0 12px 0",
};

const ANSWER_LABELS = ["強くそう", "ややそう", "ややちがう", "強くちがう"];

export const typeLabels = {
  ENFP: '直観と情熱の探求者',
  INFP: '理想を追い続ける詩人',
  ENFJ: '人を導くカリスマ',
  INFJ: '静かなるビジョナリー',
  ENTP: 'アイデアが止まらない論客',
  INTP: '理論を極める哲学者',
  ENTJ: '目標を貫く指揮官',
  INTJ: '孤高の戦略家',
  ESFP: '場を明るくするエンターテイナー',
  ISFP: '感性豊かなアーティスト',
  ESFJ: 'みんなの世話焼きリーダー',
  ISFJ: '縁の下の力持ち',
  ESTP: 'リスクを楽しむ行動派',
  ISTP: '黙って手を動かす職人',
  ESTJ: '秩序を守る現場監督',
  ISTJ: '堅実に積み上げる責任者',
};

const famousPeople = {
  ENFP: { name: 'アン・フランク' },
  INFP: { name: '宮崎駿' },
  ENFJ: { name: 'バラク・オバマ' },
  INFJ: { name: 'マーティン・ルーサー・キング' },
  ENTP: { name: 'スティーブ・ジョブズ' },
  INTP: { name: 'アルベルト・アインシュタイン' },
  ENTJ: { name: 'ナポレオン・ボナパルト' },
  INTJ: { name: 'イーロン・マスク' },
  ESFP: { name: 'マリリン・モンロー' },
  ISFP: { name: 'マイケル・ジャクソン' },
  ESFJ: { name: 'テレサ修道女' },
  ISFJ: { name: 'ベアトリクス女王' },
  ESTP: { name: 'アーネスト・ヘミングウェイ' },
  ISTP: { name: 'クリント・イーストウッド' },
  ESTJ: { name: 'ジョージ・ワシントン' },
  ISTJ: { name: 'ウォーレン・バフェット' },
};

const cognitiveFunctionMap = {
  ENTJ: { dominant: 'Te', shadow: 'Ti', lightName: '指揮者',       shadowName: '堂々巡り' },
  INTJ: { dominant: 'Ni', shadow: 'Ne', lightName: '先読み人',     shadowName: '三日坊主' },
  ENTP: { dominant: 'Ne', shadow: 'Ni', lightName: '発明家',       shadowName: '独走者' },
  INTP: { dominant: 'Ti', shadow: 'Te', lightName: '職人',         shadowName: '鉄砲玉' },
  ENFJ: { dominant: 'Fe', shadow: 'Fi', lightName: '聴き手',       shadowName: '頑固者' },
  INFJ: { dominant: 'Ni', shadow: 'Ne', lightName: '先読み人',     shadowName: '三日坊主' },
  ENFP: { dominant: 'Ne', shadow: 'Ni', lightName: '発明家',       shadowName: '独走者' },
  INFP: { dominant: 'Fi', shadow: 'Fe', lightName: '求道者',       shadowName: '八方美人' },
  ESTJ: { dominant: 'Te', shadow: 'Ti', lightName: '指揮者',       shadowName: '堂々巡り' },
  ISTJ: { dominant: 'Si', shadow: 'Se', lightName: 'コツコツ人',   shadowName: '思いつき人' },
  ESTP: { dominant: 'Se', shadow: 'Si', lightName: '今を楽しむ人', shadowName: '現状維持人' },
  ISTP: { dominant: 'Ti', shadow: 'Te', lightName: '職人',         shadowName: '鉄砲玉' },
  ESFJ: { dominant: 'Fe', shadow: 'Fi', lightName: '聴き手',       shadowName: '頑固者' },
  ISFJ: { dominant: 'Si', shadow: 'Se', lightName: 'コツコツ人',   shadowName: '思いつき人' },
  ESFP: { dominant: 'Se', shadow: 'Si', lightName: '今を楽しむ人', shadowName: '現状維持人' },
  ISFP: { dominant: 'Fi', shadow: 'Fe', lightName: '求道者',       shadowName: '八方美人' },
};

const MBTI_TO_JUNG = {
  ESTJ: 'Te-光', ENTJ: 'Te-影',
  ESFJ: 'Fe-光', ENFJ: 'Fe-影',
  ESTP: 'Se-光', ESFP: 'Se-影',
  ENTP: 'Ne-光', ENFP: 'Ne-影',
  ISTJ: 'Si-光', ISFJ: 'Si-影',
  ISTP: 'Ti-光', INTP: 'Ti-影',
  INTJ: 'Ni-光', INFJ: 'Ni-影',
  ISFP: 'Fi-光', INFP: 'Fi-影',
};

// ─── プロンプト生成 ───────────────────────────────────────
function buildSystemPrompt(mbtiType, axisScores, biasTop2, typeProfile, occupationLabel, generationLabel) {
  const praise = typeProfile?.praiseText ?? "";
  const habit = typeProfile?.habitText ?? "";
  const axes = [
    `EI: ${axisScores.EI}点（${axisScores.EI >= 13 ? 'E寄り' : 'I寄り'}）`,
    `SN: ${axisScores.SN}点（${axisScores.SN >= 13 ? 'S寄り' : 'N寄り'}）`,
    `TF: ${axisScores.TF}点（${axisScores.TF >= 13 ? 'T寄り' : 'F寄り'}）`,
    `JP: ${axisScores.JP}点（${axisScores.JP >= 13 ? 'J寄り' : 'P寄り'}）`,
  ].join("\n");
  const biasLine = biasTop2?.length >= 2
    ? `主なクセ：${biasInfo[biasTop2[0]]?.name}（${biasInfo[biasTop2[0]]?.short}）、${biasInfo[biasTop2[1]]?.name}（${biasInfo[biasTop2[1]]?.short}）`
    : '';
  return `あなたは私の性格と行動傾向をよく理解したAIアシスタントです。
以下が私のプロフィールです。

【MBTIタイプ】${mbtiType}（${typeLabels[mbtiType] ?? ''}）
【職種】${occupationLabel ?? "未選択"}
【年代】${generationLabel ?? "未選択"}

【軸スコア（各軸8問×最大3点=最大24点）】
${axes}

${biasLine}

【私の強み】
${praise}

【私が持ちやすい心の癖】
${habit}

このプロフィールを踏まえた上で、私の相談に寄り添いながら答えてください。
断定せず、「〜かもしれません」「〜ではないでしょうか」という表現を使ってください。
私の強みを活かしながら、心の癖にも気づきを促すようなアドバイスをお願いします。
回答は簡潔に、200〜400文字程度を目安にしてください。`;
}

function buildCopyPrompt(mbtiType, axisScores, biasTop2, typeProfile, occupationLabel, generationLabel) {
  const praise = typeProfile?.praiseText ?? "";
  const habit = typeProfile?.habitText ?? "";
  const axes = [
    `EI: ${axisScores.EI}点（${axisScores.EI >= 13 ? 'E寄り' : 'I寄り'}）`,
    `SN: ${axisScores.SN}点（${axisScores.SN >= 13 ? 'S寄り' : 'N寄り'}）`,
    `TF: ${axisScores.TF}点（${axisScores.TF >= 13 ? 'T寄り' : 'F寄り'}）`,
    `JP: ${axisScores.JP}点（${axisScores.JP >= 13 ? 'J寄り' : 'P寄り'}）`,
  ].join("\n");
  const biasLine = biasTop2?.length >= 2
    ? `主なクセ：${biasInfo[biasTop2[0]]?.name}（${biasInfo[biasTop2[0]]?.short}）、${biasInfo[biasTop2[1]]?.name}（${biasInfo[biasTop2[1]]?.short}）`
    : '';
  return `あなたは私の性格と行動傾向をよく理解したAIアシスタントです。
以下が私のプロフィールです。

【MBTIタイプ】${mbtiType}（${typeLabels[mbtiType] ?? ''}）
【職種】${occupationLabel ?? "未選択"}
【年代】${generationLabel ?? "未選択"}

【軸スコア（各軸8問×最大3点=最大24点）】
${axes}

${biasLine}

【私の強み】
${praise}

【私が持ちやすい心の癖】
${habit}

このプロフィールを踏まえた上で、私の相談に寄り添いながら答えてください。
断定せず、「〜かもしれません」「〜ではないでしょうか」という表現を使ってください。
私の強みを活かしながら、心の癖にも気づきを促すようなアドバイスをお願いします。`;
}

// ─── App ────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState('top');
  const [mapFrom, setMapFrom] = useState('top');
  const [phase, setPhase] = useState("intro");
  const [occupation, setOccupation] = useState(null);
  const [generation, setGeneration] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [jungAnswers, setJungAnswers] = useState({});
  const [biasAnswers, setBiasAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const [typeProfiles, setTypeProfiles] = useState(null);
  const [prescriptions, setPrescriptions] = useState(null);
  const [biasMessages, setBiasMessages] = useState(null);

  // AI チャット状態
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [chatInitialized, setChatInitialized] = useState(false);
  const chatContainerRef = useRef(null);

  const occupations = OCCUPATIONS_18;
  const generations = GENERATIONS_7;

  const isJungPhase = phase === "jung";
  const isBiasPhase = phase === "bias";
  const activeQuestions = isBiasPhase ? biasQuestions : questions;
  const currentQuestion = (isJungPhase || isBiasPhase) ? activeQuestions[currentQ] : null;
  const totalQ = activeQuestions.length;
  const answeredQ = Object.keys(isBiasPhase ? biasAnswers : jungAnswers).length;
  const progress = totalQ > 0 ? (answeredQ / totalQ) * 100 : 0;

  const scoreResult = phase === "result" ? (() => { try { return calcScore(jungAnswers); } catch { return null; } })() : null;
  const biasResult  = phase === "result" ? (() => { try { return calcBiasScores(biasAnswers); } catch { return null; } })() : null;
  const mbtiType = scoreResult ? getTypeName(scoreResult) : "";
  const jungTypeId = mbtiType ? (MBTI_TO_JUNG[mbtiType] ?? mbtiType) : "";
  const occupationLabel = occupation ? occupations.find((o) => o.id === occupation)?.label : "";
  const generationLabel = generation ? generations.find((g) => g.id === generation)?.label : "";
  const prescriptionKey = occupation && jungTypeId && generationLabel ? `${occupation}_${jungTypeId}_${generationLabel}` : "";
  const typeProfile = typeProfiles?.[jungTypeId] ?? null;
  const prescriptionText = prescriptions?.[prescriptionKey]?.text ?? null;

  const top2 = biasResult?.top2 ?? [];
  const biasMsgKey1 = top2[0] ? `${jungTypeId}_${biasInfo[top2[0]]?.messageKey}` : null;
  const biasMsgKey2 = top2[1] ? `${jungTypeId}_${biasInfo[top2[1]]?.messageKey}` : null;
  const biasMsg1 = biasMsgKey1 && biasMessages ? (biasMessages[biasMsgKey1] ?? null) : null;
  const biasMsg2 = biasMsgKey2 && biasMessages ? (biasMessages[biasMsgKey2] ?? null) : null;

  useEffect(() => {
    if (phase !== "result") return;
    fetch("/data/type_profiles.json").then((r) => r.json()).then(setTypeProfiles).catch(() => setTypeProfiles({}));
    fetch("/data/prescriptions.json").then((r) => r.json()).then(setPrescriptions).catch(() => setPrescriptions({}));
    fetch("/data/bias_messages.json").then((r) => r.json()).then(setBiasMessages).catch(() => setBiasMessages({}));
  }, [phase]);

  // 全データ揃ったら初回AIメッセージを自動生成
  useEffect(() => {
    if (!typeProfiles || !prescriptions || !biasMessages || chatInitialized || !scoreResult || !biasResult) return;
    setChatInitialized(true);
    setChatLoading(true);

    const systemPrompt = buildSystemPrompt(mbtiType, scoreResult.scores, top2, typeProfile, occupationLabel, generationLabel);
    const triggerContent = `私のプロフィール（${mbtiType}・${occupationLabel}・${generationLabel}）を踏まえて、私の特徴・強み・心の癖を300文字程度で紹介してください。最後に「何か聞きたいことはありますか？」で締めてください。`;
    const hiddenTrigger = { role: "user", content: triggerContent, hidden: true };

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemPrompt, messages: [{ role: "user", content: triggerContent }] }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.content) {
          setChatMessages([hiddenTrigger, { role: "assistant", content: data.content }]);
        }
      })
      .catch(() => { setChatError("初回メッセージの取得に失敗しました。"); })
      .finally(() => setChatLoading(false));
  }, [typeProfiles, prescriptions, biasMessages, chatInitialized]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, chatLoading]);

  function handleAnswer(value) {
    if (animating) return;
    setSelected(value);
    setAnimating(true);
    setTimeout(() => {
      setSelected(null);
      setAnimating(false);
      if (isJungPhase) {
        const newAnswers = { ...jungAnswers, [currentQuestion.id]: value };
        setJungAnswers(newAnswers);
        if (currentQ + 1 < questions.length) { setCurrentQ((prev) => prev + 1); }
        else { setCurrentQ(0); setPhase("bias"); }
      } else if (isBiasPhase) {
        const newAnswers = { ...biasAnswers, [currentQuestion.id]: value };
        setBiasAnswers(newAnswers);
        if (currentQ + 1 < biasQuestions.length) { setCurrentQ((prev) => prev + 1); }
        else { setPhase("result"); }
      }
    }, 300);
  }

  function handleBack() {
    if (phase === "occupation") { setPhase("intro"); }
    else if (phase === "generation") { setPhase("occupation"); }
    else if (phase === "jung") {
      if (currentQ > 0) {
        const prevQ = questions[currentQ - 1];
        const newAnswers = { ...jungAnswers };
        delete newAnswers[prevQ.id];
        setJungAnswers(newAnswers);
        setCurrentQ((prev) => prev - 1);
        setSelected(null);
      } else { setPhase("generation"); }
    } else if (phase === "bias") {
      if (currentQ > 0) {
        const prevQ = biasQuestions[currentQ - 1];
        const newAnswers = { ...biasAnswers };
        delete newAnswers[prevQ.id];
        setBiasAnswers(newAnswers);
        setCurrentQ((prev) => prev - 1);
        setSelected(null);
      } else {
        const lastJungQ = questions[questions.length - 1];
        const newJungAnswers = { ...jungAnswers };
        delete newJungAnswers[lastJungQ.id];
        setJungAnswers(newJungAnswers);
        setCurrentQ(questions.length - 1);
        setPhase("jung");
      }
    }
  }

  function handleReset() {
    setPage('top');
    setPhase("intro");
    setOccupation(null);
    setGeneration(null);
    setCurrentQ(0);
    setJungAnswers({});
    setBiasAnswers({});
    setSelected(null);
    setAnimating(false);
    setPromptCopied(false);
    setShareCopied(false);
    setTypeProfiles(null);
    setPrescriptions(null);
    setBiasMessages(null);
    setChatMessages([]);
    setChatInput("");
    setChatLoading(false);
    setChatError(null);
    setChatInitialized(false);
  }

  function handleCopyPrompt() {
    if (!scoreResult) return;
    const prompt = buildCopyPrompt(mbtiType, scoreResult.scores, top2, typeProfile, occupationLabel, generationLabel);
    const onSuccess = () => { setPromptCopied(true); setTimeout(() => setPromptCopied(false), 2000); };
    if (navigator.clipboard) navigator.clipboard.writeText(prompt).then(onSuccess).catch(() => fallbackCopy(prompt, onSuccess));
    else fallbackCopy(prompt, onSuccess);
  }

  function handleShareCopy() {
    const cf = cognitiveFunctionMap[mbtiType];
    const text = [
      '【ライフオラクル診断結果】',
      `タイプ：${mbtiType}（${typeLabels[mbtiType] ?? ''}）`,
      cf ? `主機能：${cf.lightName} / 影：${cf.shadowName}` : '',
      top2.length >= 2 ? `思考のクセ：${biasInfo[top2[0]]?.name} / ${biasInfo[top2[1]]?.name}` : '',
      '',
      '🔮 ライフオラクルで診断する',
      'https://incredible-llama-51caa2.netlify.app/',
    ].filter(Boolean).join('\n');
    const onSuccess = () => { setShareCopied(true); setTimeout(() => setShareCopied(false), 2000); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(onSuccess).catch(() => fallbackCopy(text, onSuccess));
    else fallbackCopy(text, onSuccess);
  }

  function fallbackCopy(text, onSuccess) {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.cssText = "position:fixed;top:-9999px;left:-9999px";
    document.body.appendChild(el);
    el.select();
    try { if (document.execCommand("copy")) onSuccess(); } finally { document.body.removeChild(el); }
  }

  async function handleChatSend() {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    const userMsg = { role: "user", content: text };
    const apiMessages = [...chatMessages.map(({ role, content }) => ({ role, content })), userMsg];
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setChatInput("");
    setChatLoading(true);
    setChatError(null);
    const systemPrompt = buildSystemPrompt(mbtiType, scoreResult.scores, top2, typeProfile, occupationLabel, generationLabel);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemPrompt, messages: apiMessages }),
      });
      const data = await res.json();
      if (!res.ok) { setChatError(data?.error ?? "エラーが発生しました"); }
      else { setChatMessages([...newMessages, { role: "assistant", content: data.content }]); }
    } catch {
      setChatError("通信エラーが発生しました。しばらくしてから再試行してください。");
    } finally {
      setChatLoading(false);
    }
  }

  function handleChatKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChatSend(); }
  }

  const visibleMessages = chatMessages.filter((m) => !m.hidden);

  // ─── マップページ ──────────────────────────────────────
  if (page === 'map') {
    return <MapPage onBack={() => setPage(mapFrom)} />;
  }

  // ─── render ───────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a", color: TEXT, fontFamily: "Hiragino Sans, Hiragino Kaku Gothic ProN, sans-serif", padding: "20px 16px", paddingBottom: 40 }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ textAlign: "center", paddingTop: 24, paddingBottom: 16 }}>
          <div style={{ fontSize: 12, letterSpacing: 4, color: ACCENT }}>LIFE ORACLE</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: TEXT, marginTop: 8 }}>ライフオラクル</h1>
        </div>

        {/* Intro */}
        {phase === "intro" && (
          <div style={CARD_STYLE}>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: TEXT_MUTED, marginBottom: 24, textAlign: "center" }}>
              ユング心理学と行動経済学に基づく性格診断で、<br />
              あなただけの処方箋とAI相談を提供します。<br /><br />
              所要時間：約10〜12分（ユング32問 + バイアス16問）
            </p>
            <button onClick={() => setPhase("occupation")} style={{ width: "100%", padding: 16, background: "linear-gradient(135deg, #2d1b69, #1a0a2e)", border: `1px solid ${ACCENT}`, borderRadius: 12, color: TEXT, fontSize: 14, letterSpacing: 2, cursor: "pointer", marginBottom: 12 }}>
              診断を始める
            </button>
            <button className="map-btn" onClick={() => { setMapFrom('top'); setPage('map'); }}>
              16タイプ 全体マップを見る
            </button>
          </div>
        )}

        {/* Occupation */}
        {phase === "occupation" && (
          <div style={CARD_STYLE}>
            <button onClick={handleBack} style={backBtnStyle}>← 戻る</button>
            <div style={{ fontSize: 10, letterSpacing: 2, color: ACCENT, marginBottom: 8 }}>Step 1 / 3</div>
            <h2 style={{ fontSize: 18, marginBottom: 8, textAlign: "center" }}>あなたの職種に近いのは？</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {occupations.map((o) => (
                <button key={o.id} onClick={() => { setOccupation(o.id); setPhase("generation"); }}
                  style={{ padding: 14, background: occupation === o.id ? "rgba(196,148,10,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${occupation === o.id ? ACCENT : "rgba(196,148,10,0.2)"}`, borderRadius: 10, color: TEXT, fontSize: 13, cursor: "pointer", textAlign: "center" }}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Generation */}
        {phase === "generation" && (
          <div style={CARD_STYLE}>
            <button onClick={handleBack} style={backBtnStyle}>← 戻る</button>
            <div style={{ fontSize: 10, letterSpacing: 2, color: ACCENT, marginBottom: 8 }}>Step 2 / 3</div>
            <h2 style={{ fontSize: 18, marginBottom: 16, textAlign: "center" }}>あなたの年代は？</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {generations.map((g) => (
                <button key={g.id} onClick={() => { setGeneration(g.id); setPhase("jung"); }}
                  style={{ padding: 14, background: generation === g.id ? "rgba(196,148,10,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${generation === g.id ? ACCENT : "rgba(196,148,10,0.2)"}`, borderRadius: 10, color: TEXT, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ユング診断 / バイアス測定 */}
        {(phase === "jung" || phase === "bias") && currentQuestion && (
          <div style={{ ...CARD_STYLE, opacity: animating ? 0.7 : 1, transition: "opacity 0.2s" }}>
            <button onClick={handleBack} style={backBtnStyle}>← 戻る</button>
            <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, marginBottom: 10 }}>
              <div style={{ height: "100%", width: `${progress}%`, background: ACCENT, borderRadius: 2, transition: "width 0.3s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ fontSize: 11, color: TEXT_MUTED }}>Q{currentQ + 1} / {totalQ}</div>
              {isBiasPhase && <div style={{ fontSize: 11, color: ACCENT, letterSpacing: 1 }}>あなたのクセを調べます</div>}
            </div>
            <div style={{ fontSize: 10, letterSpacing: 2, color: ACCENT, marginBottom: 6 }}>
              {isJungPhase ? "Step 3 / 3 — 性格診断" : "Step 3 / 3 — バイアス測定"}
            </div>
            {isJungPhase && <div style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 14 }}>テーマ：{currentQuestion.tag}</div>}
            <p style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>{currentQuestion.stem}</p>
            {isJungPhase && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: TEXT_MUTED, marginBottom: 12, padding: "0 2px" }}>
                <span style={{ color: ACCENT }}>{currentQuestion.leftLabel} 寄り</span>
                <span>←──────────→</span>
                <span style={{ color: ACCENT }}>{currentQuestion.rightLabel} 寄り</span>
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {ANSWER_LABELS.map((label, i) => {
                const activeAnswers = isBiasPhase ? biasAnswers : jungAnswers;
                const isSelected = selected === i || activeAnswers[currentQuestion.id] === i;
                return (
                  <button key={i} onClick={() => handleAnswer(i)}
                    style={{ padding: "12px 4px", background: isSelected ? "rgba(196,148,10,0.18)" : "rgba(255,255,255,0.04)", border: `1px solid ${isSelected ? ACCENT : "rgba(196,148,10,0.2)"}`, borderRadius: 10, color: isSelected ? ACCENT : TEXT, fontSize: 12, lineHeight: 1.4, cursor: "pointer", textAlign: "center", fontWeight: isSelected ? 600 : 400, transition: "all 0.15s" }}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Loading */}
        {phase === "result" && scoreResult && (!typeProfiles || !prescriptions || !biasMessages) && (
          <div style={{ ...CARD_STYLE, textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 14, color: TEXT_MUTED }}>結果を読み込み中...</div>
          </div>
        )}

        {/* 結果画面 */}
        {phase === "result" && scoreResult && biasResult && typeProfiles && prescriptions && biasMessages && (
          <>
            {/* ① タイプ表示 */}
            <div style={CARD_STYLE}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: ACCENT, marginBottom: 8 }}>Your Life Oracle Profile</div>
              <h2 style={{ fontSize: 40, textAlign: "center", marginBottom: 4, letterSpacing: 6, fontWeight: 700 }}>{mbtiType}</h2>
              <div style={{ textAlign: "center", fontSize: 15, color: TEXT_MUTED, marginBottom: 6 }}>{typeLabels[mbtiType]}</div>
              {famousPeople[mbtiType] && (
                <div style={{ textAlign: "center", fontSize: 12, color: ACCENT, marginBottom: 12 }}>
                  {famousPeople[mbtiType].name}と同じタイプ
                </div>
              )}
              {cognitiveFunctionMap[mbtiType] && (() => {
                const cf = cognitiveFunctionMap[mbtiType];
                return (
                  <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(196,148,10,0.15)", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 0" }}>
                      <span style={{ fontSize: 11, width: 80, flexShrink: 0, color: "#a8d8a8" }}>主機能（光）</span>
                      <span style={{ fontSize: 14, fontWeight: 500, flex: 1, color: TEXT }}>{cf.lightName}</span>
                      <span style={{ fontSize: 11, color: TEXT_MUTED }}>{cf.dominant}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 0" }}>
                      <span style={{ fontSize: 11, width: 80, flexShrink: 0, color: "#d8a8a8" }}>影</span>
                      <span style={{ fontSize: 14, fontWeight: 500, flex: 1, color: TEXT }}>{cf.shadowName}</span>
                      <span style={{ fontSize: 11, color: TEXT_MUTED }}>{cf.shadow}</span>
                    </div>
                  </div>
                );
              })()}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 24 }}>
                {[
                  { axis: "EI", left: "E（外向）", right: "I（内向）", score: scoreResult.scores.EI, isLeft: scoreResult.E },
                  { axis: "SN", left: "S（感覚）", right: "N（直観）", score: scoreResult.scores.SN, isLeft: scoreResult.S },
                  { axis: "TF", left: "T（思考）", right: "F（感情）", score: scoreResult.scores.TF, isLeft: scoreResult.T },
                  { axis: "JP", left: "J（判断）", right: "P（知覚）", score: scoreResult.scores.JP, isLeft: scoreResult.J },
                ].map(({ axis, left, right, score, isLeft }) => (
                  <div key={axis} style={{ background: "rgba(196,148,10,0.06)", border: "1px solid rgba(196,148,10,0.15)", borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ fontSize: 11, color: ACCENT, marginBottom: 4 }}>{isLeft ? left : right}</div>
                    <div style={{ fontSize: 11, color: TEXT_MUTED }}>{score}点 / 24点</div>
                    <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, marginTop: 6 }}>
                      <div style={{ height: "100%", width: `${(score / 24) * 100}%`, background: ACCENT, borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
              </div>
              {typeProfile ? (
                <>
                  <h3 style={{ fontSize: 14, color: ACCENT, marginBottom: 8 }}>あなたの強み</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.8, marginBottom: 20, whiteSpace: "pre-wrap" }}>{typeProfile.praiseText}</p>
                  <h3 style={{ fontSize: 14, color: ACCENT, marginBottom: 8 }}>心の癖</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{typeProfile.habitText}</p>
                </>
              ) : (
                <p style={{ color: TEXT_MUTED, fontSize: 13 }}>タイプ {mbtiType} のプロフィールデータを準備中です。</p>
              )}
            </div>

            {/* ② 処方箋 */}
            <div style={CARD_STYLE}>
              <h3 style={{ fontSize: 14, color: ACCENT, marginBottom: 12 }}>
                処方箋（{occupationLabel} × {mbtiType} × {generationLabel}）
              </h3>
              {prescriptionText ? (
                <div style={{ fontSize: 14, lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{prescriptionText}</div>
              ) : (
                <p style={{ color: TEXT_MUTED, fontSize: 14 }}>該当する処方箋のデータがありません。</p>
              )}
            </div>

            {/* ③ 思考のクセ */}
            <div style={CARD_STYLE}>
              <h3 style={{ fontSize: 14, color: ACCENT, marginBottom: 16 }}>あなたの思考のクセ</h3>
              {top2.map((biasId, index) => {
                const info = biasInfo[biasId];
                const msg = index === 0 ? biasMsg1 : biasMsg2;
                return (
                  <div key={biasId} style={{
                    background: index === 0 ? "rgba(196,148,10,0.07)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${index === 0 ? "rgba(196,148,10,0.25)" : "rgba(196,148,10,0.12)"}`,
                    borderRadius: 12, padding: "16px 18px", marginBottom: index === 0 ? 12 : 0,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: index === 0 ? ACCENT : TEXT_MUTED, letterSpacing: 1 }}>{index + 1}位のクセ</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>{info?.name}</span>
                    </div>
                    <div style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: msg ? 12 : 0 }}>{info?.short}</div>
                    {msg
                      ? <p style={{ fontSize: 14, lineHeight: 1.9, margin: 0 }}>{msg}</p>
                      : <p style={{ fontSize: 13, color: TEXT_MUTED, margin: 0 }}>{info?.description}</p>
                    }
                  </div>
                );
              })}
            </div>

            {/* ④ AIに相談する */}
            <div style={CARD_STYLE}>
              <h3 style={{ fontSize: 14, color: ACCENT, marginBottom: 4 }}>AIに相談する</h3>
              <p style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 16 }}>
                診断結果をもとにAIがあなたの傾向を分析します。気になることは何でも聞いてください。
              </p>
              <div ref={chatContainerRef} style={{ maxHeight: 480, overflowY: "auto", marginBottom: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                {chatLoading && visibleMessages.length === 0 && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <div style={{ padding: "10px 16px", borderRadius: "16px 16px 16px 4px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 14, color: TEXT_MUTED }}>
                      あなたの診断結果を分析中...
                    </div>
                  </div>
                )}
                {visibleMessages.map((msg, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                    <div style={{
                      maxWidth: "85%", padding: "10px 14px",
                      borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: msg.role === "user" ? "rgba(196,148,10,0.18)" : "rgba(255,255,255,0.06)",
                      border: `1px solid ${msg.role === "user" ? "rgba(196,148,10,0.35)" : "rgba(255,255,255,0.1)"}`,
                      fontSize: 14, lineHeight: 1.7, color: TEXT, whiteSpace: "pre-wrap", wordBreak: "break-word",
                    }}>
                      {msg.content}
                    </div>
                    <div style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 4, paddingLeft: 4, paddingRight: 4 }}>
                      {msg.role === "user" ? "あなた" : "AI"}
                    </div>
                  </div>
                ))}
                {chatLoading && visibleMessages.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <div style={{ padding: "10px 16px", borderRadius: "16px 16px 16px 4px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 14, color: TEXT_MUTED }}>
                      考え中...
                    </div>
                  </div>
                )}
                {chatError && (
                  <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(216,100,100,0.1)", border: "1px solid rgba(216,100,100,0.3)", fontSize: 13, color: "#d86464" }}>
                    {chatError}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleChatKeyDown}
                  placeholder="質問や相談を入力… (Enterで送信)"
                  rows={2}
                  style={{ flex: 1, padding: "10px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(196,148,10,0.25)", borderRadius: 10, color: TEXT, fontSize: 14, resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.5 }}
                />
                <button
                  onClick={handleChatSend}
                  disabled={!chatInput.trim() || chatLoading}
                  style={{
                    padding: "0 16px",
                    background: (!chatInput.trim() || chatLoading) ? "rgba(196,148,10,0.08)" : "rgba(196,148,10,0.2)",
                    border: `1px solid ${(!chatInput.trim() || chatLoading) ? "rgba(196,148,10,0.15)" : ACCENT}`,
                    borderRadius: 10, color: (!chatInput.trim() || chatLoading) ? TEXT_MUTED : TEXT,
                    fontSize: 14, cursor: (!chatInput.trim() || chatLoading) ? "not-allowed" : "pointer",
                    minWidth: 60, alignSelf: "stretch",
                  }}
                >
                  送信
                </button>
              </div>
            </div>

            {/* ⑤ 結果カード画像シェア */}
            <div style={CARD_STYLE}>
              <h3 style={{ fontSize: 14, color: ACCENT, marginBottom: 12 }}>結果カードを画像保存</h3>
              <ResultCard typeName={mbtiType} top2Biases={top2} />
            </div>

            {/* ⑥ テキストシェア */}
            <div style={CARD_STYLE}>
              <h3 style={{ fontSize: 14, color: ACCENT, marginBottom: 12 }}>結果をシェア</h3>
              <button onClick={handleShareCopy}
                style={{ width: "100%", padding: 14, marginBottom: 10, background: shareCopied ? "rgba(168,216,168,0.2)" : "rgba(196,148,10,0.15)", border: `1px solid ${shareCopied ? "#a8d8a8" : ACCENT}`, borderRadius: 10, color: TEXT, fontSize: 14, cursor: "pointer" }}>
                {shareCopied ? "✓ コピーしました" : "結果をコピーする"}
              </button>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`【ライフオラクル】${mbtiType}（${typeLabels[mbtiType] ?? ''}）#ライフオラクル`)}&url=${encodeURIComponent('https://incredible-llama-51caa2.netlify.app/')}`}
                target="_blank" rel="noopener noreferrer"
                style={{ display: "block", width: "100%", padding: 14, background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, color: TEXT, fontSize: 14, textAlign: "center", textDecoration: "none", boxSizing: "border-box" }}>
                Xでシェア（#ライフオラクル）
              </a>
            </div>

            {/* 個人専用プロンプト */}
            <div style={CARD_STYLE}>
              <h3 style={{ fontSize: 14, color: ACCENT, marginBottom: 12 }}>ChatGPT・Claude用 個人専用プロンプト</h3>
              <button onClick={handleCopyPrompt}
                style={{ width: "100%", padding: 14, background: promptCopied ? "rgba(168,216,168,0.2)" : "rgba(196,148,10,0.15)", border: `1px solid ${promptCopied ? "#a8d8a8" : ACCENT}`, borderRadius: 10, color: TEXT, fontSize: 14, cursor: "pointer" }}>
                {promptCopied ? "✓ コピーしました" : "プロンプトを生成してコピー"}
              </button>
              <p style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 10, textAlign: "center" }}>
                ChatGPTやClaudeに貼り付けて使うと、あなたに合わせた回答をしてくれます
              </p>
            </div>

            <button
              onClick={() => { setMapFrom('result'); setPage('map'); }}
              style={{ width: "100%", padding: 14, background: "rgba(196,148,10,0.08)", border: `1px solid rgba(196,148,10,0.3)`, borderRadius: 10, color: TEXT, fontSize: 14, cursor: "pointer", marginBottom: 12 }}>
              16タイプ 全体マップを見る
            </button>

            <button onClick={handleReset}
              style={{ width: "100%", padding: 14, background: "transparent", border: `1px solid rgba(196,148,10,0.2)`, borderRadius: 10, color: TEXT_MUTED, fontSize: 14, cursor: "pointer", marginBottom: 20 }}>
              もう一度診断する
            </button>
          </>
        )}
      </div>
    </div>
  );
}
