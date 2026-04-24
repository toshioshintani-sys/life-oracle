import { useState, useEffect, useRef } from "react";
import { questions } from "./data/questions.js";
import { biasQuestions } from "./data/biasQuestions.js";
import { calcScore, getTypeName, calcBiasScores, biasInfo, getTendencyLabel } from "./utils/scoring.js";
import { OCCUPATIONS_18, GENERATIONS_7 } from "../life_oracle_questions_data.js";
import MapPage from "./pages/MapPage.jsx";
import { biasBooksData, getAmazonAffiliateUrl } from "./data/types.js";

// ─── 定数 ────────────────────────────────────────────────
const CARD_STYLE = {
  background: "#ffffff",
  border: "1px solid rgba(184, 131, 63, 0.18)",
  borderRadius: 16,
  padding: "24px 20px",
  marginBottom: 20,
  boxShadow: "0 1px 6px rgba(184,131,63,0.07)",
};
const ACCENT = "#b8833f";
const TEXT = "#2d2318";
const TEXT_MUTED = "#8a7060";

const backBtnStyle = {
  background: "none",
  border: "none",
  color: TEXT_MUTED,
  fontSize: 12,
  cursor: "pointer",
  padding: "0 0 12px 0",
};

// 羅針盤アイコン（ブランドのシグネチャ）
function CompassIcon({ size = 24, color = "currentColor", strokeWidth = 1.5, decorative = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <circle cx="50" cy="50" r="44" />
      {decorative && <circle cx="50" cy="50" r="34" strokeOpacity="0.35" />}
      <polygon points="50,10 56,50 50,90 44,50" />
      <polygon points="10,50 50,44 90,50 50,56" />
      <polygon points="50,10 56,50 44,50" fill={color} stroke="none" />
      {decorative && (
        <>
          <line x1="24" y1="24" x2="33" y2="33" />
          <line x1="76" y1="24" x2="67" y2="33" />
          <line x1="24" y1="76" x2="33" y2="67" />
          <line x1="76" y1="76" x2="67" y2="67" />
        </>
      )}
      <circle cx="50" cy="50" r="2.5" fill={color} stroke="none" />
    </svg>
  );
}

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
  ENTJ: { dominant: 'Te', shadow: 'Ti', lightName: '指揮者', shadowName: '堂々巡り', todayAction: '今日の会議で、結論を出す前に「他に意見は？」と一言だけ聞いてみる' },
  INTJ: { dominant: 'Ni', shadow: 'Ne', lightName: '先読み人', shadowName: '独走者', todayAction: '今日は遠い未来の心配より、「今日の夕方にできること」1つに絞って動く' },
  ENTP: { dominant: 'Ne', shadow: 'Ni', lightName: '発明家', shadowName: '三日坊主', todayAction: '今日は1つのアイデアを、最後まで実行してから次のアイデアに移る' },
  INTP: { dominant: 'Ti', shadow: 'Te', lightName: '職人', shadowName: '鉄砲玉', todayAction: '今日は「完璧な分析」より「60点の行動」を1つ先に起こしてみる' },
  ENFJ: { dominant: 'Fe', shadow: 'Fi', lightName: '聴き手', shadowName: '頑固者', todayAction: '誰かに親切にする前に、まず「自分は今どう感じているか」を10秒だけ確認する' },
  INFJ: { dominant: 'Ni', shadow: 'Ne', lightName: '先読み人', shadowName: '独走者', todayAction: '今日は遠い未来の心配より、「今日の夕方にできること」1つに絞って動く' },
  ENFP: { dominant: 'Ne', shadow: 'Ni', lightName: '発明家', shadowName: '三日坊主', todayAction: '今日は1つのアイデアを、最後まで実行してから次のアイデアに移る' },
  INFP: { dominant: 'Fi', shadow: 'Fe', lightName: '求道者', shadowName: '八方美人', todayAction: '今日1つだけ、周りの期待でなく「自分がやりたいこと」を選ぶ' },
  ESTJ: { dominant: 'Te', shadow: 'Ti', lightName: '指揮者', shadowName: '堂々巡り', todayAction: '今日の会議で、結論を出す前に「他に意見は？」と一言だけ聞いてみる' },
  ISTJ: { dominant: 'Si', shadow: 'Se', lightName: 'コツコツ人', shadowName: '思いつき人', todayAction: '今日は「いつものやり方」のうち1つだけ、意図的に違う方法を試してみる' },
  ESTP: { dominant: 'Se', shadow: 'Si', lightName: '今を楽しむ人', shadowName: '現状維持人', todayAction: '衝動的に動く前に3秒止まり、「これは本当に今やる必要がある？」と自問する' },
  ISTP: { dominant: 'Ti', shadow: 'Te', lightName: '職人', shadowName: '鉄砲玉', todayAction: '今日は「完璧な分析」より「60点の行動」を1つ先に起こしてみる' },
  ESFJ: { dominant: 'Fe', shadow: 'Fi', lightName: '聴き手', shadowName: '頑固者', todayAction: '誰かに親切にする前に、まず「自分は今どう感じているか」を10秒だけ確認する' },
  ISFJ: { dominant: 'Si', shadow: 'Se', lightName: 'コツコツ人', shadowName: '思いつき人', todayAction: '今日は「いつものやり方」のうち1つだけ、意図的に違う方法を試してみる' },
  ESFP: { dominant: 'Se', shadow: 'Si', lightName: '今を楽しむ人', shadowName: '現状維持人', todayAction: '衝動的に動く前に3秒止まり、「これは本当に今やる必要がある？」と自問する' },
  ISFP: { dominant: 'Fi', shadow: 'Fe', lightName: '求道者', shadowName: '八方美人', todayAction: '今日1つだけ、周りの期待でなく「自分がやりたいこと」を選ぶ' },
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

// ─── EI仮判定（マイルストーン用）──────────────────────────
function getProvisionalEI(jungAnswers) {
  let score = 0;
  const eiQs = questions.filter(q => q.axis === 'EI');
  for (const q of eiQs) {
    const v = jungAnswers[q.id];
    if (v === undefined) continue;
    score += q.reversed ? v : (3 - v);
  }
  return score >= 13 ? 'E' : 'I';
}

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
  const [shareCopied, setShareCopied] = useState(false);

  const [rssLinks, setRssLinks] = useState([]);
  const [rssLoading, setRssLoading] = useState(false);

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
  const biasResult = phase === "result" ? (() => { try { return calcBiasScores(biasAnswers); } catch { return null; } })() : null;
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
    if (phase !== "result" || !mbtiType) return;

    const cf = cognitiveFunctionMap[mbtiType];
    const b1 = top2[0] ? biasInfo[top2[0]]?.name : "";
    const b2 = top2[1] ? biasInfo[top2[1]]?.name : "";
    const b1s = top2[0] ? biasInfo[top2[0]]?.short : "";
    const b2s = top2[1] ? biasInfo[top2[1]]?.short : "";

    const keywords = [
      mbtiType, typeLabels[mbtiType], cf?.lightName, cf?.shadowName, b1, b2, b1s, b2s
    ].filter(Boolean);

    setRssLoading(true);
    fetch("/api/rss")
      .then(res => res.text())
      .then(xmlStr => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlStr, "application/xml");
        const items = Array.from(doc.querySelectorAll("item"));
        const matched = [];
        items.forEach(item => {
          const title = item.querySelector("title")?.textContent || "";
          const link = item.querySelector("link")?.textContent || "";
          if (keywords.some(kw => title.includes(kw))) {
            matched.push({ title, link });
          }
        });
        setRssLinks(matched);
      })
      .catch(err => console.error("RSS fetch error:", err))
      .finally(() => setRssLoading(false));
  }, [phase, mbtiType, top2]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, chatLoading]);

  // EI軸の問題数
  const EI_COUNT = questions.filter(q => q.axis === 'EI').length;

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
        // EI軸の最後の問題に答えたらマイルストーンへ
        if (currentQ + 1 === EI_COUNT) {
          setCurrentQ(EI_COUNT);
          setPhase("ei_milestone");
        } else if (currentQ + 1 < questions.length) {
          setCurrentQ((prev) => prev + 1);
        } else {
          setCurrentQ(0);
          setPhase("bias");
        }
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
    else if (phase === "ei_milestone") {
      // マイルストーンから最後のEI問題に戻る
      const lastEIQ = questions[EI_COUNT - 1];
      const newAnswers = { ...jungAnswers };
      delete newAnswers[lastEIQ.id];
      setJungAnswers(newAnswers);
      setCurrentQ(EI_COUNT - 1);
      setPhase("jung");
    }
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

  function handleShareCopy() {
    const cf = cognitiveFunctionMap[mbtiType];
    const text = [
      `私の「光の状態」は『${cf?.lightName ?? mbtiType}』`,
      `でも消耗しているなら、影の『${cf?.shadowName ?? ''}』が出ているサイン。`,
      ``,
      `思考のクセ1位：${biasInfo[top2[0]]?.name ?? ''}`,
      ``,
      `自分の動き方を知ると、職場での消耗が変わる。`,
      `#ライフオラクル で無料診断`,
      `https://life-oracle.jp/`,
    ].filter(s => s !== undefined).join('\n');
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
    <div style={{ minHeight: "100vh", background: "#faf6f1", color: TEXT, fontFamily: "Hiragino Sans, Hiragino Kaku Gothic ProN, sans-serif", padding: "20px 16px", paddingBottom: 40 }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ textAlign: "center", paddingTop: 24, paddingBottom: 16 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, color: ACCENT }}>
            <CompassIcon size={22} strokeWidth={1.6} />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: TEXT, letterSpacing: "0.02em", margin: 0 }}>ライフオラクル</h1>
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: 1, color: TEXT_MUTED, marginTop: 6 }}>ユング心理学 × 行動経済学</div>
        </div>

        {/* Intro */}
        {phase === "intro" && (
          <div style={{ ...CARD_STYLE, animation: "lo-fade-in 320ms var(--ease-out)" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20, color: ACCENT }}>
              <CompassIcon size={120} strokeWidth={1.2} decorative />
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.9, color: TEXT_MUTED, marginBottom: 28, textAlign: "center" }}>
              自分の動き方を知ることは、<br />
              行動を変えるはじめの一歩。<br /><br />
              所要時間：約10〜12分（ユング32問 + バイアス16問）
            </p>
            <button onClick={() => setPhase("occupation")} style={{ fontFamily: 'var(--font-body)', width: "100%", padding: "16px 16px", background: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: 10, color: "#ffffff", fontSize: 15, fontWeight: 600, letterSpacing: "0.04em", cursor: "pointer", marginBottom: 12, boxShadow: "var(--shadow-sm)" }}>
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
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 19, marginBottom: 12, textAlign: "center", fontWeight: 500, letterSpacing: "0.02em" }}>あなたの職種に近いのは？</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {occupations.map((o) => (
                <button key={o.id} onClick={() => { setOccupation(o.id); setPhase("generation"); }}
                  style={{ padding: 14, background: occupation === o.id ? "rgba(184,131,63,0.12)" : "rgba(255,255,255,0.7)", border: `1px solid ${occupation === o.id ? ACCENT : "rgba(184,131,63,0.18)"}`, borderRadius: 10, color: TEXT, fontSize: 13, cursor: "pointer", textAlign: "center" }}>
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
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 19, marginBottom: 20, textAlign: "center", fontWeight: 500, letterSpacing: "0.02em" }}>あなたの年代は？</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {generations.map((g) => (
                <button key={g.id} onClick={() => { setGeneration(g.id); setPhase("jung"); }}
                  style={{ padding: 14, background: generation === g.id ? "rgba(184,131,63,0.12)" : "rgba(255,255,255,0.7)", border: `1px solid ${generation === g.id ? ACCENT : "rgba(184,131,63,0.18)"}`, borderRadius: 10, color: TEXT, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
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
            <div style={{ height: 3, background: "rgba(184,131,63,0.12)", borderRadius: 2, marginBottom: 10 }}>
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {ANSWER_LABELS.map((label, i) => {
                const activeAnswers = isBiasPhase ? biasAnswers : jungAnswers;
                const isSelected = selected === i || activeAnswers[currentQuestion.id] === i;
                return (
                  <button key={i} onClick={() => handleAnswer(i)}
                    style={{ padding: "12px 4px", background: isSelected ? "rgba(184,131,63,0.14)" : "rgba(255,255,255,0.7)", border: `1px solid ${isSelected ? ACCENT : "rgba(184,131,63,0.18)"}`, borderRadius: 10, color: isSelected ? ACCENT : TEXT, fontSize: 12, lineHeight: 1.4, cursor: "pointer", textAlign: "center", fontWeight: isSelected ? 600 : 400, transition: "all 0.15s" }}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* EIマイルストーン */}
        {phase === "ei_milestone" && (() => {
          const eiTendency = getProvisionalEI(jungAnswers);
          const isE = eiTendency === 'E';
          return (
            <div style={{ ...CARD_STYLE, animation: "lo-fade-in 320ms var(--ease-out)" }}>
              <button onClick={handleBack} style={backBtnStyle}>← 戻る</button>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: ACCENT, marginBottom: 16 }}>
                  最初の8問が完了しました
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 72, height: 72, borderRadius: "50%", background: "rgba(184,131,63,0.10)", border: `2px solid ${ACCENT}`, marginBottom: 16 }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: ACCENT }}>{eiTendency}</span>
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: TEXT, marginBottom: 8 }}>
                  {isE ? '外向（E）寄り' : '内向（I）寄り'}です
                </h2>
                <p style={{ fontSize: 13, lineHeight: 1.8, color: TEXT_MUTED, marginBottom: 4 }}>
                  {isE
                    ? '会話や外部との交流からエネルギーを得やすいタイプです。'
                    : '一人の時間や内省からエネルギーを回復しやすいタイプです。'}
                </p>
                <p style={{ fontSize: 12, color: TEXT_MUTED }}>
                  残り24問で、あなたの全体像が見えてきます。
                </p>
              </div>
              <button
                onClick={() => { setPhase("jung"); }}
                style={{ width: "100%", padding: "16px", background: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: 10, color: "#ffffff", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                続けて診断する →
              </button>
            </div>
          );
        })()}

        {/* Loading */}
        {phase === "result" && scoreResult && (!typeProfiles || !prescriptions || !biasMessages) && (
          <div style={{ ...CARD_STYLE, textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 14, color: TEXT_MUTED }}>結果を読み込み中...</div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            結果画面（大改修版）
            順序：タイプ発表 → 処方箋 → AIチャット →
                  思考のクセ → 強み/心の癖 → 今日のアクション →
                  Xシェア → note記事 → 書籍 → note導線
        ═══════════════════════════════════════════════ */}
        {phase === "result" && scoreResult && biasResult && typeProfiles && prescriptions && biasMessages && (
          <>
            {/* ① タイプ発表 */}
            <div style={CARD_STYLE}>
              <div style={{ fontSize: 11, letterSpacing: 1, color: ACCENT, marginBottom: 8 }}>診断結果</div>
              {cognitiveFunctionMap[mbtiType] && (() => {
                const cf = cognitiveFunctionMap[mbtiType];
                return (
                  <>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, textAlign: "center", marginBottom: 4, fontWeight: 700, letterSpacing: "0.02em", color: ACCENT }}>{cf.lightName}</h2>
                    <div style={{ textAlign: "center", fontSize: 12, color: TEXT_MUTED, marginBottom: 12 }}>あなたの光の状態 / {mbtiType}</div>
                    {famousPeople[mbtiType] && (
                      <div style={{ textAlign: "center", fontSize: 12, color: ACCENT, marginBottom: 16 }}>
                        {famousPeople[mbtiType].name}と同じタイプ
                      </div>
                    )}
                    <div style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(184,131,63,0.15)", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 0" }}>
                        <span style={{ fontSize: 11, width: 80, flexShrink: 0, color: "#3d7a5a" }}>光の状態</span>
                        <span style={{ fontSize: 14, fontWeight: 500, flex: 1, color: TEXT }}>{cf.lightName}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 0" }}>
                        <span style={{ fontSize: 11, width: 80, flexShrink: 0, color: "#a05050" }}>影の状態</span>
                        <span style={{ fontSize: 14, fontWeight: 500, flex: 1, color: TEXT }}>{cf.shadowName}</span>
                      </div>
                    </div>
                  </>
                );
              })()}
              {!cognitiveFunctionMap[mbtiType] && (
                <>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, textAlign: "center", marginBottom: 6, fontWeight: 700, letterSpacing: "0.04em", color: ACCENT }}>{mbtiType}</h2>
                  <div style={{ textAlign: "center", fontSize: 15, color: TEXT_MUTED, marginBottom: 6 }}>{typeLabels[mbtiType]}</div>
                </>
              )}
              {/* 軸スコア（折りたたみ） */}
              <details style={{ marginTop: 8 }}>
                <summary style={{ fontSize: 12, color: TEXT_MUTED, cursor: "pointer", listStyle: "none", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 10, color: ACCENT }}>▶</span> 軸スコアを見る
                </summary>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginTop: 12 }}>
                  {[
                    { axis: "EI", left: "E（外向）", right: "I（内向）", score: scoreResult.scores.EI, isLeft: scoreResult.E },
                    { axis: "SN", left: "S（感覚）", right: "N（直観）", score: scoreResult.scores.SN, isLeft: scoreResult.S },
                    { axis: "TF", left: "T（思考）", right: "F（感情）", score: scoreResult.scores.TF, isLeft: scoreResult.T },
                    { axis: "JP", left: "J（判断）", right: "P（知覚）", score: scoreResult.scores.JP, isLeft: scoreResult.J },
                  ].map(({ axis, left, right, score, isLeft }) => (
                    <div key={axis} style={{ background: "rgba(184,131,63,0.06)", border: "1px solid rgba(184,131,63,0.15)", borderRadius: 10, padding: "10px 12px" }}>
                      <div style={{ fontSize: 11, color: ACCENT, marginBottom: 4 }}>{isLeft ? left : right}</div>
                      <div style={{ fontSize: 11, color: TEXT_MUTED }}>{score}点 / 24点 &nbsp;·&nbsp; {getTendencyLabel(isLeft ? score : 24 - score)}</div>
                      <div style={{ height: 3, background: "rgba(184,131,63,0.12)", borderRadius: 2, marginTop: 6 }}>
                        <div style={{ height: "100%", width: `${(score / 24) * 100}%`, background: ACCENT, borderRadius: 2 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            </div>

            {/* ② 処方箋（ヒーローコンテンツ） */}
            <div style={{ ...CARD_STYLE, borderColor: "rgba(184,131,63,0.35)" }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: ACCENT, marginBottom: 4 }}>あなただけの処方箋</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: TEXT, marginBottom: 4, fontWeight: 600 }}>
                {occupationLabel} × {mbtiType} × {generationLabel}
              </h3>
              <div style={{ fontSize: 11, color: TEXT_MUTED, marginBottom: 16, lineHeight: 1.6 }}>
                職種・タイプ・年代の組み合わせ2,016通りから、あなた専用の処方箋を導き出しました。
              </div>
              {prescriptionText ? (
                <div style={{ fontSize: 14, lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{prescriptionText}</div>
              ) : (
                <p style={{ color: TEXT_MUTED, fontSize: 14 }}>該当する処方箋のデータがありません。</p>
              )}
            </div>

            {/* ③ AIに今すぐ相談する（一次CTA） */}
            <div style={{ ...CARD_STYLE, borderColor: "rgba(184,131,63,0.3)" }}>
              <h3 style={{ fontSize: 15, color: ACCENT, marginBottom: 4, fontWeight: 700 }}>AIに今すぐ相談する</h3>
              <p style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 14 }}>
                診断結果をベースに、あなたの職場の悩みに答えます。
              </p>
              {/* 質問テンプレート */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {[
                  "転職・異動後に「思っていたのと違う」と感じる理由を教えてください",
                  "職場で噛み合わない人との関係を改善するにはどうすればいいですか？",
                  "やる気が続かない根本的な原因と、私に合った対処法を教えてください",
                ].map((template, i) => (
                  <button
                    key={i}
                    onClick={() => setChatInput(template)}
                    style={{
                      padding: "10px 14px",
                      background: "rgba(184,131,63,0.06)",
                      border: "1px solid rgba(184,131,63,0.2)",
                      borderRadius: 10,
                      color: TEXT_MUTED,
                      fontSize: 12,
                      cursor: "pointer",
                      textAlign: "left",
                      lineHeight: 1.6,
                    }}>
                    💬 {template}
                  </button>
                ))}
              </div>
              {/* チャット本体 */}
              <div ref={chatContainerRef} style={{ maxHeight: 400, overflowY: "auto", marginBottom: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                {chatLoading && visibleMessages.length === 0 && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <div style={{ padding: "10px 16px", borderRadius: "16px 16px 16px 4px", background: "rgba(255,255,255,0.8)", border: "1px solid rgba(184,131,63,0.12)", fontSize: 14, color: TEXT_MUTED }}>
                      あなたの診断結果を分析中...
                    </div>
                  </div>
                )}
                {visibleMessages.map((msg, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                    <div style={{
                      maxWidth: "85%", padding: "10px 14px",
                      borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: msg.role === "user" ? "rgba(184,131,63,0.12)" : "rgba(255,255,255,0.8)",
                      border: `1px solid ${msg.role === "user" ? "rgba(184,131,63,0.3)" : "rgba(184,131,63,0.12)"}`,
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
                    <div style={{ padding: "10px 16px", borderRadius: "16px 16px 16px 4px", background: "rgba(255,255,255,0.8)", border: "1px solid rgba(184,131,63,0.12)", fontSize: 14, color: TEXT_MUTED }}>
                      考え中...
                    </div>
                  </div>
                )}
                {chatError && (
                  <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(180,80,80,0.08)", border: "1px solid rgba(180,80,80,0.25)", fontSize: 13, color: "#a04040" }}>
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
                  style={{ flex: 1, padding: "10px 12px", background: "rgba(255,255,255,0.8)", border: "1px solid rgba(184,131,63,0.25)", borderRadius: 10, color: TEXT, fontSize: 14, resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.5 }}
                />
                <button
                  onClick={handleChatSend}
                  disabled={!chatInput.trim() || chatLoading}
                  style={{
                    padding: "0 16px",
                    background: (!chatInput.trim() || chatLoading) ? "rgba(184,131,63,0.06)" : ACCENT,
                    border: `1px solid ${(!chatInput.trim() || chatLoading) ? "rgba(184,131,63,0.15)" : ACCENT}`,
                    borderRadius: 10,
                    color: (!chatInput.trim() || chatLoading) ? TEXT_MUTED : "#ffffff",
                    fontSize: 14,
                    cursor: (!chatInput.trim() || chatLoading) ? "not-allowed" : "pointer",
                    minWidth: 60,
                    alignSelf: "stretch",
                    fontWeight: 600,
                  }}
                >
                  送信
                </button>
              </div>
            </div>

            {/* ④ 思考のクセ */}
            <div style={CARD_STYLE}>
              <h3 style={{ fontSize: 14, color: ACCENT, marginBottom: 16 }}>あなたの思考のクセ</h3>
              {top2.map((biasId, index) => {
                const info = biasInfo[biasId];
                const msg = index === 0 ? biasMsg1 : biasMsg2;
                return (
                  <div key={biasId} style={{
                    background: index === 0 ? "rgba(184,131,63,0.08)" : "rgba(255,255,255,0.6)",
                    border: `1px solid ${index === 0 ? "rgba(184,131,63,0.25)" : "rgba(184,131,63,0.12)"}`,
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

            {/* ⑤ 強み・心の癖 */}
            {typeProfile && (
              <div style={CARD_STYLE}>
                <h3 style={{ fontSize: 14, color: ACCENT, marginBottom: 8 }}>あなたの強み</h3>
                <p style={{ fontSize: 14, lineHeight: 1.8, marginBottom: 20, whiteSpace: "pre-wrap" }}>{typeProfile.praiseText}</p>
                <h3 style={{ fontSize: 14, color: ACCENT, marginBottom: 8 }}>心の癖</h3>
                <p style={{ fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-wrap", margin: 0 }}>{typeProfile.habitText}</p>
              </div>
            )}

            {/* ⑥ 今日のアクション */}
            {cognitiveFunctionMap[mbtiType]?.todayAction && (
              <div style={{
                background: "rgba(61,122,90,0.05)",
                border: "1px solid rgba(61,122,90,0.25)",
                borderRadius: 14,
                padding: "20px 20px",
                marginBottom: 20,
              }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: "#3d7a5a", marginBottom: 10 }}>
                  今日のアクション
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.8, color: TEXT, margin: 0, fontWeight: 500 }}>
                  {cognitiveFunctionMap[mbtiType].todayAction}
                </p>
                <div style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 10 }}>
                  小さな一歩が、行動変容のはじまりです。
                </div>
              </div>
            )}

            {/* ⑦ Xシェア（バイラル型） */}
            <div style={CARD_STYLE}>
              <h3 style={{ fontSize: 14, color: ACCENT, marginBottom: 8 }}>診断結果をシェア</h3>
              <p style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 14, lineHeight: 1.6 }}>
                あなたと同じ悩みを抱えた人に届くかもしれません。
              </p>
              <button onClick={handleShareCopy}
                style={{ width: "100%", padding: 14, marginBottom: 10, background: shareCopied ? "rgba(61,122,90,0.1)" : "rgba(184,131,63,0.1)", border: `1px solid ${shareCopied ? "#3d7a5a" : ACCENT}`, borderRadius: 10, color: TEXT, fontSize: 14, cursor: "pointer" }}>
                {shareCopied ? "✓ コピーしました" : "投稿テキストをコピーする"}
              </button>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `私の「光の状態」は『${cognitiveFunctionMap[mbtiType]?.lightName ?? mbtiType}』\n消耗しているなら影の『${cognitiveFunctionMap[mbtiType]?.shadowName ?? ''}』が出ているサイン。\n\n思考のクセ1位：${biasInfo[top2[0]]?.name ?? ''}\n\n自分の動き方を知ると、職場での消耗が変わる。\n#ライフオラクル で無料診断`
                )}&url=${encodeURIComponent('https://life-oracle.jp/')}`}
                target="_blank" rel="noopener noreferrer"
                style={{ display: "block", width: "100%", padding: 14, background: "#2d2318", border: "1px solid rgba(45,35,24,0.3)", borderRadius: 10, color: "#faf6f1", fontSize: 14, textAlign: "center", textDecoration: "none", boxSizing: "border-box" }}>
                Xでシェア（#ライフオラクル）
              </a>
            </div>

            {/* ⑧ あなたにおすすめの深掘り記事（RSS） */}
            {rssLinks.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, letterSpacing: 1, color: ACCENT, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>✨</span> あなたのタイプに関連する深掘り記事
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {rssLinks.map((item, idx) => (
                    <a
                      key={idx}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "block",
                        padding: "16px",
                        background: "rgba(184,131,63,0.07)",
                        border: "1px solid rgba(184,131,63,0.22)",
                        borderRadius: 10,
                        color: TEXT,
                        textDecoration: "none",
                        transition: "background 0.2s",
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.5 }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 8, textAlign: "right" }}>
                        noteで読む →
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* ⑨ おすすめ書籍 */}
            {top2[0] && biasBooksData[top2[0]] && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, letterSpacing: 2, color: TEXT_MUTED, marginBottom: 8 }}>
                  自己理解を深めるおすすめ書籍
                </div>
                <p style={{ fontSize: 13, color: TEXT_MUTED, lineHeight: 1.7, marginBottom: 12 }}>
                  あなたの思考のクセ1位は<span style={{ color: TEXT }}>{biasInfo[top2[0]]?.name}</span>でした。{biasBooksData[top2[0]].description}。
                </p>
                <a
                  href={getAmazonAffiliateUrl(biasBooksData[top2[0]].asin)}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px',
                    background: 'rgba(184,131,63,0.06)',
                    border: '1px solid rgba(184,131,63,0.18)',
                    borderRadius: 10,
                    textDecoration: 'none',
                    color: TEXT,
                    transition: 'background 0.2s',
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#8c5f28', marginBottom: 4 }}>
                      {biasBooksData[top2[0]].title}
                    </div>
                    <div style={{ fontSize: 11, color: TEXT_MUTED, lineHeight: 1.5 }}>
                      {biasBooksData[top2[0]].author}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: TEXT_MUTED, marginLeft: 10 }}>Amazonで見る ▶︎</div>
                </a>
                <div style={{ fontSize: 10, color: TEXT_MUTED, marginTop: 6, textAlign: 'right' }}>
                  ※ 当リンクにはAmazonアソシエイトIDが含まれます
                </div>
              </div>
            )}

            {/* ⑩ note・メンバーシップ導線 */}
            <div style={{
              background: "rgba(184,131,63,0.04)",
              border: "1px solid rgba(184,131,63,0.18)",
              borderRadius: 14,
              padding: "20px 18px",
              marginBottom: 20,
            }}>
              <div style={{ fontSize: 11, letterSpacing: 2, color: TEXT_MUTED, marginBottom: 14 }}>
                もっと深く知りたい方へ
              </div>
              <a
                href="https://note.com/lifeoraclejp"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                  background: "rgba(184,131,63,0.07)", border: "1px solid rgba(184,131,63,0.22)",
                  borderRadius: 10, textDecoration: "none", color: TEXT, marginBottom: 10,
                }}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>📝</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                    ライフオラクルの考え方をnoteで読む
                  </div>
                  <div style={{ fontSize: 11, color: TEXT_MUTED, lineHeight: 1.6 }}>
                    光と影の仕組み・バイアスとの関係・MBTIとの違いなど
                  </div>
                </div>
                <span style={{ marginLeft: "auto", fontSize: 12, color: TEXT_MUTED }}>→</span>
              </a>
              <a
                href="https://note.com/lifeoraclejp/membership"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                  background: "rgba(184,131,63,0.12)", border: `1px solid ${ACCENT}`,
                  borderRadius: 10, textDecoration: "none", color: TEXT,
                }}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>🧭</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, color: ACCENT }}>
                    メンバーシップでより深い処方箋を
                  </div>
                  <div style={{ fontSize: 11, color: TEXT_MUTED, lineHeight: 1.6 }}>
                    あなたのタイプ専用の深掘りコンテンツが届きます
                  </div>
                </div>
                <span style={{ marginLeft: "auto", fontSize: 12, color: ACCENT }}>→</span>
              </a>
            </div>

            {/* ボトムナビ */}
            <button
              onClick={() => { setMapFrom('result'); setPage('map'); }}
              style={{ width: "100%", padding: 14, background: "rgba(184,131,63,0.08)", border: `1px solid rgba(184,131,63,0.25)`, borderRadius: 10, color: TEXT, fontSize: 14, cursor: "pointer", marginBottom: 12 }}>
              16タイプ 全体マップを見る
            </button>
            <button onClick={handleReset}
              style={{ width: "100%", padding: 14, background: "transparent", border: `1px solid rgba(184,131,63,0.2)`, borderRadius: 10, color: TEXT_MUTED, fontSize: 14, cursor: "pointer", marginBottom: 20 }}>
              もう一度診断する
            </button>
          </>
        )}
      </div>
    </div>
  );
}
