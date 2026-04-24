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

// ─── 軸境界値 ──────────────────────────────────────────
const AXIS_END = (() => {
  let ei = 0, sn = 0, tf = 0, jp = 0;
  questions.forEach(q => {
    if (q.axis === 'EI') ei++;
    else if (q.axis === 'SN') sn++;
    else if (q.axis === 'TF') tf++;
    else if (q.axis === 'JP') jp++;
  });
  return { EI: ei, SN: ei + sn, TF: ei + sn + tf, JP: ei + sn + tf + jp };
})();

const AXIS_INFO = {
  EI: {
    axisNum: 1, axis: 'EI',
    leftPole: 'E', rightPole: 'I',
    leftLabel: '外向（E）', rightLabel: '内向（I）',
    leftDesc: '会話や外部との交流からエネルギーを得やすいタイプです。発言することで思考がまとまる傾向があります。',
    rightDesc: '一人の時間や内省からエネルギーを回復しやすいタイプです。頭の中で整理してから話す傾向があります。',
    remaining: 24, nextLabel: '続ける → あと24問',
  },
  SN: {
    axisNum: 2, axis: 'SN',
    leftPole: 'S', rightPole: 'N',
    leftLabel: '感覚（S）', rightLabel: '直観（N）',
    leftDesc: '目の前の現実・事実・経験を重視する傾向があります。具体的なデータや実績を大切にします。',
    rightDesc: 'パターンや可能性・未来のビジョンに惹かれる傾向があります。「なぜ？」「どうすれば？」を考えがちです。',
    remaining: 16, nextLabel: '続ける → あと16問',
  },
  TF: {
    axisNum: 3, axis: 'TF',
    leftPole: 'T', rightPole: 'F',
    leftLabel: '思考（T）', rightLabel: '感情（F）',
    leftDesc: '論理・分析・客観性で判断する傾向があります。感情より筋道を大切にします。',
    rightDesc: '人への影響・価値観・共感で判断する傾向があります。関係性の調和を大切にします。',
    remaining: 8, nextLabel: '続ける → あと8問',
  },
  JP: {
    axisNum: 4, axis: 'JP',
    leftPole: 'J', rightPole: 'P',
    leftLabel: '判断（J）', rightLabel: '知覚（P）',
    leftDesc: '計画・構造・決断を好む傾向があります。物事に見通しがある状態が安心です。',
    rightDesc: '柔軟・オープン・状況適応を好む傾向があります。選択肢を開いておくことが安心です。',
    remaining: 0, nextLabel: '最後の16問へ → 思考のクセを調べる',
  },
};

const MILESTONE_PHASES = ['ei_milestone', 'sn_milestone', 'tf_milestone', 'jp_milestone'];
const PHASE_TO_AXIS = { ei_milestone: 'EI', sn_milestone: 'SN', tf_milestone: 'TF', jp_milestone: 'JP' };

// ─── 今の悩みクイックピック ───────────────────────────────
const CONCERN_PICKS = [
  { id: 'transfer',    icon: '🔄', label: '転職・異動後の「違和感」を解消したい' },
  { id: 'relation',   icon: '👥', label: '上司・部下・同僚との関係がうまくいかない' },
  { id: 'motivation', icon: '🔋', label: 'やる気・モチベーションが続かない' },
  { id: 'strength',   icon: '💡', label: '自分の強みが職場で活かせていない' },
  { id: 'fit',        icon: '🧭', label: '仕事が「向いていない」気がしている' },
  { id: 'recognition',icon: '🏆', label: '頑張っているのに評価・結果が出ない' },
];

// 羅針盤アイコン
function CompassIcon({ size = 24, color = "currentColor", strokeWidth = 1.5, decorative = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke={color}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" style={{ display: "block" }}>
      <circle cx="50" cy="50" r="44" />
      {decorative && <circle cx="50" cy="50" r="34" strokeOpacity="0.35" />}
      <polygon points="50,10 56,50 50,90 44,50" />
      <polygon points="10,50 50,44 90,50 50,56" />
      <polygon points="50,10 56,50 44,50" fill={color} stroke="none" />
      {decorative && (<>
        <line x1="24" y1="24" x2="33" y2="33" /><line x1="76" y1="24" x2="67" y2="33" />
        <line x1="24" y1="76" x2="33" y2="67" /><line x1="76" y1="76" x2="67" y2="67" />
      </>)}
      <circle cx="50" cy="50" r="2.5" fill={color} stroke="none" />
    </svg>
  );
}

const ANSWER_LABELS = ["強くそう", "ややそう", "ややちがう", "強くちがう"];

export const typeLabels = {
  ENFP: '直観と情熱の探求者', INFP: '理想を追い続ける詩人',
  ENFJ: '人を導くカリスマ', INFJ: '静かなるビジョナリー',
  ENTP: 'アイデアが止まらない論客', INTP: '理論を極める哲学者',
  ENTJ: '目標を貫く指揮官', INTJ: '孤高の戦略家',
  ESFP: '場を明るくするエンターテイナー', ISFP: '感性豊かなアーティスト',
  ESFJ: 'みんなの世話焼きリーダー', ISFJ: '縁の下の力持ち',
  ESTP: 'リスクを楽しむ行動派', ISTP: '黙って手を動かす職人',
  ESTJ: '秩序を守る現場監督', ISTJ: '堅実に積み上げる責任者',
};

const famousPeople = {
  ENFP: { people: ['坂本龍馬', 'ウォルト・ディズニー'] },
  INFP: { people: ['宮崎駿', 'マイケル・ジャクソン'] },
  ENFJ: { people: ['松下幸之助', 'バラク・オバマ'] },
  INFJ: { people: ['村上春樹', 'マーティン・ルーサー・キング'] },
  ENTP: { people: ['手塚治虫', 'スティーブ・ジョブズ'] },
  INTP: { people: ['夏目漱石', 'アルベルト・アインシュタイン'] },
  ENTJ: { people: ['織田信長', 'ナポレオン・ボナパルト'] },
  INTJ: { people: ['羽生善治', 'イーロン・マスク'] },
  ESFP: { people: ['明石家さんま', 'マリリン・モンロー'] },
  ISFP: { people: ['坂本龍一', 'ボブ・ディラン'] },
  ESFJ: { people: ['吉永小百合', 'マザー・テレサ'] },
  ISFJ: { people: ['黒柳徹子', 'オードリー・ヘプバーン'] },
  ESTP: { people: ['本田圭佑', 'アーネスト・ヘミングウェイ'] },
  ISTP: { people: ['羽生結弦', 'クリント・イーストウッド'] },
  ESTJ: { people: ['渋沢栄一', 'ジョージ・ワシントン'] },
  ISTJ: { people: ['稲盛和夫', 'ウォーレン・バフェット'] },
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
  ESTJ: 'Te-光', ENTJ: 'Te-影', ESFJ: 'Fe-光', ENFJ: 'Fe-影',
  ESTP: 'Se-光', ESFP: 'Se-影', ENTP: 'Ne-光', ENFP: 'Ne-影',
  ISTJ: 'Si-光', ISFJ: 'Si-影', ISTP: 'Ti-光', INTP: 'Ti-影',
  INTJ: 'Ni-光', INFJ: 'Ni-影', ISFP: 'Fi-光', INFP: 'Fi-影',
};

// 軸仮判定
function getProvisionalAxis(jungAnswers, axis) {
  let score = 0;
  const axisQs = questions.filter(q => q.axis === axis);
  for (const q of axisQs) {
    const v = jungAnswers[q.id];
    if (v === undefined) continue;
    score += q.reversed ? v : (3 - v);
  }
  return score >= 13;
}

// ─── システムプロンプト（相談モード）─────────────────────
function buildSystemPrompt(mbtiType, axisScores, biasTop2, typeProfile, occupationLabel, generationLabel) {
  const cf = cognitiveFunctionMap[mbtiType];
  const biasLine = biasTop2?.length >= 2
    ? `${biasInfo[biasTop2[0]]?.name}（${biasInfo[biasTop2[0]]?.short}）、${biasInfo[biasTop2[1]]?.name}（${biasInfo[biasTop2[1]]?.short}）`
    : '';
  return `あなたは私の職場・キャリアの悩みに寄り添うAIコンサルタントです。
私のプロフィールを完全に把握した上で、相談に答えてください。

【タイプ】${mbtiType}（光の状態：${cf?.lightName ?? ''}、影の状態：${cf?.shadowName ?? ''}）
【職種】${occupationLabel ?? "未選択"}
【年代】${generationLabel ?? "未選択"}
【主な思考のクセ】${biasLine}
【強みの傾向】${typeProfile?.praiseText?.slice(0, 80) ?? ''}…
【陥りやすい心の癖】${typeProfile?.habitText?.slice(0, 80) ?? ''}…

回答の構成：
① なぜそうなるのか（私のタイプ・思考のクセの観点から1〜2文で説明）
② どうすれば良いか（今日から使える具体的なアクションを1〜2つ提案）

表現ルール：
- 断定せず「〜かもしれません」「〜ではないでしょうか」を使う
- 「あなたの${cf?.lightName ?? 'タイプ'}として〜」のように私のタイプ名を自然に使う
- 回答は300〜500文字程度`;
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
  const [typeProfiles, setTypeProfiles] = useState(null);
  const [prescriptions, setPrescriptions] = useState(null);
  const [biasMessages, setBiasMessages] = useState(null);

  // チャット
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);
  // 選択済み悩み（クイックピック用）
  const [selectedConcern, setSelectedConcern] = useState(null);
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

  useEffect(() => {
    if (phase !== "result" || !mbtiType) return;
    const cf = cognitiveFunctionMap[mbtiType];
    const keywords = [mbtiType, typeLabels[mbtiType], cf?.lightName, cf?.shadowName,
      top2[0] ? biasInfo[top2[0]]?.name : "", top2[1] ? biasInfo[top2[1]]?.name : ""].filter(Boolean);
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
          if (keywords.some(kw => title.includes(kw))) matched.push({ title, link });
        });
        setRssLinks(matched);
      })
      .catch(() => {});
  }, [phase, mbtiType, top2]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, chatLoading]);

  // ─── 悩みクイックピック → 即AIへ送信 ─────────────────
  async function handleConcernSelect(pick) {
    if (chatLoading || !typeProfiles || !biasMessages) return;
    setSelectedConcern(pick.id);

    const userContent = `「${pick.label}」という悩みがあります。私のタイプ（${mbtiType}・${occupationLabel}・${generationLabel}）と思考のクセを踏まえて、①なぜそうなりやすいのか、②どう対処すればいいかを教えてください。`;
    const userMsg = { role: "user", content: userContent, display: pick.label };
    setChatMessages([userMsg]);
    setChatLoading(true);
    setChatError(null);

    const systemPrompt = buildSystemPrompt(mbtiType, scoreResult.scores, top2, typeProfile, occupationLabel, generationLabel);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemPrompt, messages: [{ role: "user", content: userContent }] }),
      });
      const data = await res.json();
      if (!res.ok) setChatError(data?.error ?? "エラーが発生しました");
      else setChatMessages([userMsg, { role: "assistant", content: data.content }]);
    } catch {
      setChatError("通信エラーが発生しました。");
    } finally {
      setChatLoading(false);
    }
  }

  // ─── チャット送信 ────────────────────────────────────
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
      if (!res.ok) setChatError(data?.error ?? "エラーが発生しました");
      else setChatMessages([...newMessages, { role: "assistant", content: data.content }]);
    } catch {
      setChatError("通信エラーが発生しました。");
    } finally {
      setChatLoading(false);
    }
  }

  function handleChatKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChatSend(); }
  }

  // ─── handleAnswer ────────────────────────────────────
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
        const next = currentQ + 1;
        if (next === AXIS_END.EI)      { setCurrentQ(next); setPhase("ei_milestone"); }
        else if (next === AXIS_END.SN) { setCurrentQ(next); setPhase("sn_milestone"); }
        else if (next === AXIS_END.TF) { setCurrentQ(next); setPhase("tf_milestone"); }
        else if (next === AXIS_END.JP) { setPhase("jp_milestone"); }
        else                           { setCurrentQ(next); }
      } else if (isBiasPhase) {
        const newAnswers = { ...biasAnswers, [currentQuestion.id]: value };
        setBiasAnswers(newAnswers);
        if (currentQ + 1 < biasQuestions.length) setCurrentQ((prev) => prev + 1);
        else setPhase("result");
      }
    }, 300);
  }

  // ─── handleBack ─────────────────────────────────────
  function handleBack() {
    if (phase === "occupation") { setPhase("intro"); }
    else if (phase === "generation") { setPhase("occupation"); }
    else if (MILESTONE_PHASES.includes(phase)) {
      const axis = PHASE_TO_AXIS[phase];
      const lastQIdx = AXIS_END[axis] - 1;
      const newAnswers = { ...jungAnswers };
      delete newAnswers[questions[lastQIdx].id];
      setJungAnswers(newAnswers);
      setCurrentQ(lastQIdx);
      setPhase("jung");
    }
    else if (phase === "jung") {
      if (currentQ > 0) {
        const newAnswers = { ...jungAnswers };
        delete newAnswers[questions[currentQ - 1].id];
        setJungAnswers(newAnswers);
        setCurrentQ((prev) => prev - 1);
        setSelected(null);
      } else { setPhase("generation"); }
    }
    else if (phase === "bias") {
      if (currentQ > 0) {
        const newAnswers = { ...biasAnswers };
        delete newAnswers[biasQuestions[currentQ - 1].id];
        setBiasAnswers(newAnswers);
        setCurrentQ((prev) => prev - 1);
        setSelected(null);
      } else {
        setPhase("jp_milestone");
      }
    }
  }

  function handleReset() {
    setPage('top'); setPhase("intro"); setOccupation(null); setGeneration(null);
    setCurrentQ(0); setJungAnswers({}); setBiasAnswers({}); setSelected(null);
    setAnimating(false); setShareCopied(false);
    setTypeProfiles(null); setPrescriptions(null); setBiasMessages(null);
    setChatMessages([]); setChatInput(""); setChatLoading(false); setChatError(null);
    setSelectedConcern(null);
  }

  function handleShareCopy() {
    const cf = cognitiveFunctionMap[mbtiType];
    const text = [
      `私の「光の状態」は『${cf?.lightName ?? mbtiType}』`,
      `消耗しているなら、影の『${cf?.shadowName ?? ''}』が出ているサイン。`,
      ``, `思考のクセ1位：${biasInfo[top2[0]]?.name ?? ''}`,
      ``, `自分の動き方を知ると、職場での消耗が変わる。`,
      `#ライフオラクル で無料診断`, `https://life-oracle.jp/`,
    ].join('\n');
    const onSuccess = () => { setShareCopied(true); setTimeout(() => setShareCopied(false), 2000); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(onSuccess).catch(() => fallbackCopy(text, onSuccess));
    else fallbackCopy(text, onSuccess);
  }

  function fallbackCopy(text, onSuccess) {
    const el = document.createElement("textarea");
    el.value = text; el.style.cssText = "position:fixed;top:-9999px;left:-9999px";
    document.body.appendChild(el); el.select();
    try { if (document.execCommand("copy")) onSuccess(); } finally { document.body.removeChild(el); }
  }

  const visibleMessages = chatMessages.filter((m) => !m.hidden);
  const isConsultationReady = typeProfiles && biasMessages;

  if (page === 'map') return <MapPage onBack={() => setPage(mapFrom)} />;

  return (
    <div style={{ minHeight: "100vh", background: "#faf6f1", color: TEXT, fontFamily: "Hiragino Sans, Hiragino Kaku Gothic ProN, sans-serif", padding: "20px 16px", paddingBottom: 40 }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>

        {/* ヘッダー */}
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
            <button onClick={() => setPhase("occupation")} style={{ fontFamily: 'var(--font-body)', width: "100%", padding: "16px", background: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: 10, color: "#ffffff", fontSize: 15, fontWeight: 600, letterSpacing: "0.04em", cursor: "pointer", marginBottom: 12 }}>
              診断を始める
            </button>
            <button className="map-btn" onClick={() => { setMapFrom('top'); setPage('map'); }}>16タイプ 全体マップを見る</button>
          </div>
        )}

        {/* Occupation */}
        {phase === "occupation" && (
          <div style={CARD_STYLE}>
            <button onClick={handleBack} style={backBtnStyle}>← 戻る</button>
            <div style={{ fontSize: 10, letterSpacing: 2, color: ACCENT, marginBottom: 8 }}>Step 1 / 3</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 19, marginBottom: 12, textAlign: "center", fontWeight: 500 }}>あなたの職種に近いのは？</h2>
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
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 19, marginBottom: 20, textAlign: "center", fontWeight: 500 }}>あなたの年代は？</h2>
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
              {isBiasPhase && <div style={{ fontSize: 11, color: ACCENT, letterSpacing: 1 }}>思考のクセを調べます</div>}
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

        {/* 軸マイルストーン */}
        {MILESTONE_PHASES.includes(phase) && (() => {
          const axis = PHASE_TO_AXIS[phase];
          const info = AXIS_INFO[axis];
          const isLeft = getProvisionalAxis(jungAnswers, axis);
          const isJP = phase === 'jp_milestone';
          const provisionalE = getProvisionalAxis(jungAnswers, 'EI');
          const provisionalS = getProvisionalAxis(jungAnswers, 'SN');
          const provisionalT = getProvisionalAxis(jungAnswers, 'TF');
          const provisionalJ = isJP ? getProvisionalAxis(jungAnswers, 'JP') : null;
          const provisionalType = isJP
            ? (provisionalE ? 'E' : 'I') + (provisionalS ? 'S' : 'N') + (provisionalT ? 'T' : 'F') + (provisionalJ ? 'J' : 'P')
            : null;
          const provisionalCF = provisionalType ? cognitiveFunctionMap[provisionalType] : null;

          return (
            <div style={{ ...CARD_STYLE, animation: "lo-fade-in 320ms var(--ease-out)" }}>
              <button onClick={handleBack} style={backBtnStyle}>← 戻る</button>
              <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
                {['EI', 'SN', 'TF', 'JP'].map((ax, i) => (
                  <div key={ax} style={{ flex: 1 }}>
                    <div style={{ height: 5, borderRadius: 3, background: i < info.axisNum ? ACCENT : 'rgba(184,131,63,0.15)', transition: 'background 0.3s' }} />
                    <div style={{ fontSize: 9, color: i < info.axisNum ? ACCENT : TEXT_MUTED, marginTop: 3, textAlign: 'center' }}>{ax}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: TEXT_MUTED, textAlign: 'center', marginBottom: 20 }}>{info.axisNum} / 4 軸完了</div>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'rgba(184,131,63,0.10)', border: `2px solid ${ACCENT}`, marginBottom: 12 }}>
                  <span style={{ fontSize: 24, fontWeight: 700, color: ACCENT }}>{isLeft ? info.leftPole : info.rightPole}</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 6 }}>{isLeft ? info.leftLabel : info.rightLabel}</div>
                <p style={{ fontSize: 13, lineHeight: 1.8, color: TEXT_MUTED, margin: 0 }}>{isLeft ? info.leftDesc : info.rightDesc}</p>
              </div>
              {!isJP && info.axisNum > 1 && (
                <div style={{ background: 'rgba(184,131,63,0.05)', border: '1px solid rgba(184,131,63,0.15)', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: TEXT_MUTED, marginBottom: 8 }}>これまでの結果</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {info.axisNum >= 1 && <span style={{ fontSize: 12, fontWeight: 600, color: ACCENT, background: 'rgba(184,131,63,0.12)', padding: '4px 10px', borderRadius: 20 }}>{provisionalE ? 'E（外向）' : 'I（内向）'}</span>}
                    {info.axisNum >= 2 && <span style={{ fontSize: 12, fontWeight: 600, color: ACCENT, background: 'rgba(184,131,63,0.12)', padding: '4px 10px', borderRadius: 20 }}>{provisionalS ? 'S（感覚）' : 'N（直観）'}</span>}
                    {info.axisNum >= 3 && <span style={{ fontSize: 12, fontWeight: 600, color: ACCENT, background: 'rgba(184,131,63,0.12)', padding: '4px 10px', borderRadius: 20 }}>{provisionalT ? 'T（思考）' : 'F（感情）'}</span>}
                  </div>
                </div>
              )}
              {isJP && provisionalType && (
                <div style={{ background: 'rgba(184,131,63,0.07)', border: `1px solid ${ACCENT}`, borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: TEXT_MUTED, marginBottom: 10 }}>4軸の仮タイプ（確定前）</div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                    {[provisionalE ? 'E（外向）' : 'I（内向）', provisionalS ? 'S（感覚）' : 'N（直観）', provisionalT ? 'T（思考）' : 'F（感情）', provisionalJ ? 'J（判断）' : 'P（知覚）'].map((label, i) => (
                      <span key={i} style={{ fontSize: 12, fontWeight: 600, color: ACCENT, background: 'rgba(184,131,63,0.15)', padding: '4px 10px', borderRadius: 20 }}>{label}</span>
                    ))}
                  </div>
                  {provisionalCF && (
                    <>
                      <div style={{ fontSize: 22, fontWeight: 700, color: ACCENT, marginBottom: 4 }}>{provisionalCF.lightName}</div>
                      <div style={{ fontSize: 12, color: TEXT_MUTED }}>光：{provisionalCF.lightName} ／ 影：{provisionalCF.shadowName}</div>
                    </>
                  )}
                  <div style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 10, lineHeight: 1.6, borderTop: '1px solid rgba(184,131,63,0.15)', paddingTop: 10 }}>
                    次の16問で「なぜそう動いてしまうのか」の思考のクセが明らかになります。
                  </div>
                </div>
              )}
              <button onClick={() => { if (isJP) { setCurrentQ(0); setPhase("bias"); } else { setPhase("jung"); } }}
                style={{ width: "100%", padding: "16px", background: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: 10, color: "#ffffff", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                {info.nextLabel}
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
            結果画面
            順序：タイプ発表 → 悩み相談（主役） → 処方箋
                  → 思考のクセ → 強み/癖 → 今日のアクション
                  → シェア → 記事 → 書籍 → note導線
        ═══════════════════════════════════════════════ */}
        {phase === "result" && scoreResult && biasResult && typeProfiles && prescriptions && biasMessages && (
          <>
            {/* ① タイプ発表 */}
            <div style={CARD_STYLE}>
              <div style={{ fontSize: 11, letterSpacing: 1, color: ACCENT, marginBottom: 8 }}>診断完了</div>
              {cognitiveFunctionMap[mbtiType] && (() => {
                const cf = cognitiveFunctionMap[mbtiType];
                return (
                  <>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, textAlign: "center", marginBottom: 4, fontWeight: 700, color: ACCENT }}>{cf.lightName}</h2>
                    <div style={{ textAlign: "center", fontSize: 12, color: TEXT_MUTED, marginBottom: 12 }}>あなたの光の状態 / {mbtiType}</div>
                    {famousPeople[mbtiType] && (
                      <div style={{ textAlign: "center", fontSize: 12, color: ACCENT, marginBottom: 16 }}>
                        {famousPeople[mbtiType].people.join(' · ')} と同じタイプ
                      </div>
                    )}
                    <div style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(184,131,63,0.15)", borderRadius: 10, padding: "12px 16px", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 0" }}>
                        <span style={{ fontSize: 11, width: 80, flexShrink: 0, color: "#3d7a5a" }}>光の状態</span>
                        <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{cf.lightName}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 0" }}>
                        <span style={{ fontSize: 11, width: 80, flexShrink: 0, color: "#a05050" }}>影の状態</span>
                        <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{cf.shadowName}</span>
                      </div>
                    </div>
                  </>
                );
              })()}
              {!cognitiveFunctionMap[mbtiType] && (
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, textAlign: "center", fontWeight: 700, color: ACCENT }}>{mbtiType}</h2>
              )}
              <details style={{ marginTop: 12 }}>
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

            {/* ② 今の悩みを相談する（主役） */}
            <div style={{ ...CARD_STYLE, borderColor: "rgba(184,131,63,0.4)", boxShadow: "0 2px 12px rgba(184,131,63,0.10)" }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: ACCENT, marginBottom: 6 }}>あなた専用の相談窓口</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: TEXT, marginBottom: 4 }}>
                今、いちばん気になっていることは何ですか？
              </h3>
              <p style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 18, lineHeight: 1.7 }}>
                あなたのタイプ（{cognitiveFunctionMap[mbtiType]?.lightName ?? mbtiType}）・職種・年代・思考のクセをふまえて、
                なぜそうなるのか・どう対処すればいいかをAIが答えます。
              </p>

              {/* 悩みクイックピック */}
              {!selectedConcern && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                  {CONCERN_PICKS.map((pick) => (
                    <button
                      key={pick.id}
                      onClick={() => handleConcernSelect(pick)}
                      disabled={!isConsultationReady || chatLoading}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "14px 16px",
                        background: "rgba(184,131,63,0.06)",
                        border: "1px solid rgba(184,131,63,0.2)",
                        borderRadius: 12,
                        color: TEXT,
                        fontSize: 13,
                        cursor: (!isConsultationReady || chatLoading) ? "not-allowed" : "pointer",
                        textAlign: "left",
                        lineHeight: 1.5,
                        opacity: (!isConsultationReady || chatLoading) ? 0.6 : 1,
                        transition: "background 0.15s",
                      }}>
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{pick.icon}</span>
                      <span>{pick.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* チャット本体 */}
              {(selectedConcern || chatMessages.length > 0) && (
                <>
                  {selectedConcern && (
                    <div style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ background: "rgba(184,131,63,0.1)", padding: "4px 10px", borderRadius: 20, fontSize: 12, color: ACCENT, fontWeight: 600 }}>
                        {CONCERN_PICKS.find(p => p.id === selectedConcern)?.icon} {CONCERN_PICKS.find(p => p.id === selectedConcern)?.label}
                      </span>
                      <button onClick={() => { setSelectedConcern(null); setChatMessages([]); setChatError(null); }}
                        style={{ background: "none", border: "none", color: TEXT_MUTED, fontSize: 11, cursor: "pointer" }}>
                        ✕ 変える
                      </button>
                    </div>
                  )}
                  <div ref={chatContainerRef} style={{ maxHeight: 500, overflowY: "auto", marginBottom: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                    {chatLoading && visibleMessages.length === 0 && (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                        <div style={{ padding: "12px 16px", borderRadius: "16px 16px 16px 4px", background: "rgba(255,255,255,0.8)", border: "1px solid rgba(184,131,63,0.12)", fontSize: 13, color: TEXT_MUTED, lineHeight: 1.6 }}>
                          あなたのタイプと思考のクセをふまえて分析中...
                        </div>
                      </div>
                    )}
                    {visibleMessages.map((msg, i) => (
                      <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                        <div style={{
                          maxWidth: "88%", padding: "12px 16px",
                          borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                          background: msg.role === "user" ? "rgba(184,131,63,0.12)" : "#ffffff",
                          border: `1px solid ${msg.role === "user" ? "rgba(184,131,63,0.3)" : "rgba(184,131,63,0.15)"}`,
                          fontSize: 14, lineHeight: 1.8, color: TEXT, whiteSpace: "pre-wrap", wordBreak: "break-word",
                        }}>
                          {msg.display ?? msg.content}
                        </div>
                        <div style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 4, paddingLeft: 4, paddingRight: 4 }}>
                          {msg.role === "user" ? "あなた" : `AI（${cognitiveFunctionMap[mbtiType]?.lightName ?? mbtiType}タイプ向け）`}
                        </div>
                      </div>
                    ))}
                    {chatLoading && visibleMessages.length > 0 && (
                      <div style={{ display: "flex", alignItems: "flex-start" }}>
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
                  {/* 追加質問フィールド */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <textarea value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={handleChatKeyDown}
                      placeholder="さらに詳しく聞く… (Enterで送信)" rows={2}
                      style={{ flex: 1, padding: "10px 12px", background: "rgba(255,255,255,0.8)", border: "1px solid rgba(184,131,63,0.25)", borderRadius: 10, color: TEXT, fontSize: 14, resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.5 }}
                    />
                    <button onClick={handleChatSend} disabled={!chatInput.trim() || chatLoading}
                      style={{ padding: "0 16px", background: (!chatInput.trim() || chatLoading) ? "rgba(184,131,63,0.06)" : ACCENT, border: `1px solid ${(!chatInput.trim() || chatLoading) ? "rgba(184,131,63,0.15)" : ACCENT}`, borderRadius: 10, color: (!chatInput.trim() || chatLoading) ? TEXT_MUTED : "#ffffff", fontSize: 14, cursor: (!chatInput.trim() || chatLoading) ? "not-allowed" : "pointer", minWidth: 60, alignSelf: "stretch", fontWeight: 600 }}>
                      送信
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* ③ 処方箋 */}
            <div style={{ ...CARD_STYLE, borderColor: "rgba(184,131,63,0.3)" }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: ACCENT, marginBottom: 4 }}>あなただけの処方箋</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: TEXT, marginBottom: 4, fontWeight: 600 }}>
                {occupationLabel} × {mbtiType} × {generationLabel}
              </h3>
              <div style={{ fontSize: 11, color: TEXT_MUTED, marginBottom: 14, lineHeight: 1.6 }}>
                職種・タイプ・年代の組み合わせ2,016通りから、あなた専用の処方箋を導き出しました。
              </div>
              {prescriptionText
                ? <div style={{ fontSize: 14, lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{prescriptionText}</div>
                : <p style={{ color: TEXT_MUTED, fontSize: 14 }}>該当する処方箋のデータがありません。</p>
              }
            </div>

            {/* ④ 思考のクセ */}
            <div style={CARD_STYLE}>
              <h3 style={{ fontSize: 14, color: ACCENT, marginBottom: 16 }}>あなたの思考のクセ</h3>
              {top2.map((biasId, index) => {
                const info = biasInfo[biasId];
                const msg = index === 0 ? biasMsg1 : biasMsg2;
                return (
                  <div key={biasId} style={{ background: index === 0 ? "rgba(184,131,63,0.08)" : "rgba(255,255,255,0.6)", border: `1px solid ${index === 0 ? "rgba(184,131,63,0.25)" : "rgba(184,131,63,0.12)"}`, borderRadius: 12, padding: "16px 18px", marginBottom: index === 0 ? 12 : 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: index === 0 ? ACCENT : TEXT_MUTED, letterSpacing: 1 }}>{index + 1}位のクセ</span>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{info?.name}</span>
                    </div>
                    <div style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: msg ? 12 : 0 }}>{info?.short}</div>
                    <p style={{ fontSize: 14, lineHeight: 1.9, margin: 0 }}>{msg ?? info?.description}</p>
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
                <p style={{ fontSize: 14, lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>{typeProfile.habitText}</p>
              </div>
            )}

            {/* ⑥ 今日のアクション */}
            {cognitiveFunctionMap[mbtiType]?.todayAction && (
              <div style={{ background: "rgba(61,122,90,0.05)", border: "1px solid rgba(61,122,90,0.25)", borderRadius: 14, padding: "20px 20px", marginBottom: 20 }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: "#3d7a5a", marginBottom: 10 }}>今日のアクション</div>
                <p style={{ fontSize: 15, lineHeight: 1.8, color: TEXT, margin: 0, fontWeight: 500 }}>{cognitiveFunctionMap[mbtiType].todayAction}</p>
                <div style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 10 }}>小さな一歩が、行動変容のはじまりです。</div>
              </div>
            )}

            {/* ⑦ Xシェア */}
            <div style={CARD_STYLE}>
              <h3 style={{ fontSize: 14, color: ACCENT, marginBottom: 8 }}>診断結果をシェア</h3>
              <p style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 14, lineHeight: 1.6 }}>あなたと同じ悩みを抱えた人に届くかもしれません。</p>
              <button onClick={handleShareCopy}
                style={{ width: "100%", padding: 14, marginBottom: 10, background: shareCopied ? "rgba(61,122,90,0.1)" : "rgba(184,131,63,0.1)", border: `1px solid ${shareCopied ? "#3d7a5a" : ACCENT}`, borderRadius: 10, color: TEXT, fontSize: 14, cursor: "pointer" }}>
                {shareCopied ? "✓ コピーしました" : "投稿テキストをコピーする"}
              </button>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`私の「光の状態」は『${cognitiveFunctionMap[mbtiType]?.lightName ?? mbtiType}』\n消耗しているなら影の『${cognitiveFunctionMap[mbtiType]?.shadowName ?? ''}』が出ているサイン。\n\n思考のクセ1位：${biasInfo[top2[0]]?.name ?? ''}\n\n自分の動き方を知ると、職場での消耗が変わる。\n#ライフオラクル で無料診断`)}&url=${encodeURIComponent('https://life-oracle.jp/')}`}
                target="_blank" rel="noopener noreferrer"
                style={{ display: "block", width: "100%", padding: 14, background: "#2d2318", border: "1px solid rgba(45,35,24,0.3)", borderRadius: 10, color: "#faf6f1", fontSize: 14, textAlign: "center", textDecoration: "none", boxSizing: "border-box" }}>
                Xでシェア（#ライフオラクル）
              </a>
            </div>

            {/* ⑧ note関連記事 */}
            {rssLinks.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, letterSpacing: 1, color: ACCENT, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>✨</span> あなたのタイプに関連する深掘り記事
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {rssLinks.map((item, idx) => (
                    <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer"
                      style={{ display: "block", padding: "16px", background: "rgba(184,131,63,0.07)", border: "1px solid rgba(184,131,63,0.22)", borderRadius: 10, color: TEXT, textDecoration: "none" }}>
                      <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.5 }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 8, textAlign: "right" }}>noteで読む →</div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* ⑨ おすすめ書籍 */}
            {top2[0] && biasBooksData[top2[0]] && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, letterSpacing: 2, color: TEXT_MUTED, marginBottom: 8 }}>自己理解を深めるおすすめ書籍</div>
                <p style={{ fontSize: 13, color: TEXT_MUTED, lineHeight: 1.7, marginBottom: 12 }}>
                  あなたの思考のクセ1位は<span style={{ color: TEXT }}>{biasInfo[top2[0]]?.name}</span>でした。{biasBooksData[top2[0]].description}。
                </p>
                <a href={getAmazonAffiliateUrl(biasBooksData[top2[0]].asin)} target="_blank" rel="noopener noreferrer sponsored"
                  style={{ display: 'flex', alignItems: 'center', padding: '16px', background: 'rgba(184,131,63,0.06)', border: '1px solid rgba(184,131,63,0.18)', borderRadius: 10, textDecoration: 'none', color: TEXT, gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#8c5f28', marginBottom: 4 }}>{biasBooksData[top2[0]].title}</div>
                    <div style={{ fontSize: 11, color: TEXT_MUTED }}>{biasBooksData[top2[0]].author}</div>
                  </div>
                  <div style={{ fontSize: 12, color: TEXT_MUTED }}>Amazonで見る ▶︎</div>
                </a>
                <div style={{ fontSize: 10, color: TEXT_MUTED, marginTop: 6, textAlign: 'right' }}>※ Amazonアソシエイトリンクが含まれます</div>
              </div>
            )}

            {/* ⑩ note・メンバーシップ導線 */}
            <div style={{ background: "rgba(184,131,63,0.04)", border: "1px solid rgba(184,131,63,0.18)", borderRadius: 14, padding: "20px 18px", marginBottom: 20 }}>
              <div style={{ fontSize: 11, letterSpacing: 2, color: TEXT_MUTED, marginBottom: 14 }}>もっと深く知りたい方へ</div>
              <a href="https://note.com/lifeoraclejp" target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "rgba(184,131,63,0.07)", border: "1px solid rgba(184,131,63,0.22)", borderRadius: 10, textDecoration: "none", color: TEXT, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>📝</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>ライフオラクルの考え方をnoteで読む</div>
                  <div style={{ fontSize: 11, color: TEXT_MUTED, lineHeight: 1.6 }}>光と影の仕組み・バイアスとの関係・MBTIとの違いなど</div>
                </div>
                <span style={{ marginLeft: "auto", fontSize: 12, color: TEXT_MUTED }}>→</span>
              </a>
              <a href="https://note.com/lifeoraclejp/membership" target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "rgba(184,131,63,0.12)", border: `1px solid ${ACCENT}`, borderRadius: 10, textDecoration: "none", color: TEXT }}>
                <span style={{ fontSize: 18 }}>🧭</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, color: ACCENT }}>メンバーシップでより深い処方箋を</div>
                  <div style={{ fontSize: 11, color: TEXT_MUTED, lineHeight: 1.6 }}>あなたのタイプ専用の深掘りコンテンツが届きます</div>
                </div>
                <span style={{ marginLeft: "auto", fontSize: 12, color: ACCENT }}>→</span>
              </a>
            </div>

            <button onClick={() => { setMapFrom('result'); setPage('map'); }}
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
