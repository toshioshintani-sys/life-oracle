import { useState, useEffect, useRef } from "react";
import { questions } from "./data/questions.js";
import { biasQuestions } from "./data/biasQuestions.js";
import {
  simpleJungQuestions,
  simpleBiasQuestions,
  calcSimpleJungScore,
  calcSimpleBiasResult,
} from "./data/simpleQuestions.js";
import { calcScore, getTypeName, calcBiasScores, biasInfo, getTendencyLabel } from "./utils/scoring.js";
import { OCCUPATIONS_18, GENERATIONS_7 } from "../life_oracle_questions_data.js";
import MapPage from "./pages/MapPage.jsx";
import GachijinPipelinePage from "./pages/GachijinPipelinePage.jsx";

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
    remaining: 24, nextLabel: '次へ進む（残り24問・約3分）',
  },
  SN: {
    axisNum: 2, axis: 'SN',
    leftPole: 'S', rightPole: 'N',
    leftLabel: '感覚（S）', rightLabel: '直観（N）',
    leftDesc: '目の前の現実・事実・経験を重視する傾向があります。具体的なデータや実績を大切にします。',
    rightDesc: 'パターンや可能性・未来のビジョンに惹かれる傾向があります。「なぜ？」「どうすれば？」を考えがちです。',
    remaining: 16, nextLabel: '次へ進む（残り16問・約2分）',
  },
  TF: {
    axisNum: 3, axis: 'TF',
    leftPole: 'T', rightPole: 'F',
    leftLabel: '思考（T）', rightLabel: '感情（F）',
    leftDesc: '論理・分析・客観性で判断する傾向があります。感情より筋道を大切にします。',
    rightDesc: '人への影響・価値観・共感で判断する傾向があります。関係性の調和を大切にします。',
    remaining: 8, nextLabel: '次へ進む（残り8問・約1分）',
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

// ─── 軸アイコン（質問ページのナッジ）─────────────────────
const AXIS_ICONS = { EI: '💬', SN: '🔭', TF: '⚖️', JP: '🗓️' };
const BIAS_ICON = '🧠';

// ─── 職種アイコン（ファイルは触らずApp内でマッピング）──────
const OCCUPATION_ICONS = {
  '会社員': '🏢', '教育職': '📚', '公務員': '🏛️', '医療職': '🏥',
  '士業': '⚖️', 'クリエイター': '🎨', '接客': '😊', '調理': '🍳',
  '理美容師': '✂️', '介護': '🤝', 'フリーランス': '💻', '自営業': '🏪',
  '一次産業': '🌾', '建設業': '🔨', '主婦/主夫': '🏠', '非正規雇用': '🗂️',
  '学生': '🎓', '無職': '🔍',
};

// ─── 月替わりの問い（隠しステージ・羅針盤裏面）───────────
const MONTHLY_QUESTIONS = [
  '', // index 0 unused
  '1月の問い：今年の自分が「過去を振り返らずに進める」場面はどこか。',
  '2月の問い：自分にいちばん優しくしたい瞬間は、どんな時か。',
  '3月の問い：終わらせたいのに終わらせられないことは何か。',
  '4月の問い：「もうやらなくていい」と決めたいことは何か。',
  '5月の問い：自分にとっての「ちょうどいい人との距離」はどこか。',
  '6月の問い：雨の日に整えたい、自分の小さな儀式はあるか。',
  '7月の問い：今年いちばん「自分らしい」と感じた瞬間はいつか。',
  '8月の問い：本当はもっと休みたい場所はどこか。',
  '9月の問い：今年の残り、何を捨てて何を残すか。',
  '10月の問い：誰かに伝えそびれた感謝はあるか。',
  '11月の問い：来年に持ち越したくない癖はあるか。',
  '12月の問い：今年の自分に「ありがとう」と言いたい瞬間はどこか。',
];

// ─── A/B variant（URL ?v=a / ?v=b、初回はランダム） ───────
function getVariant() {
  if (typeof window === 'undefined') return 'a';
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('v');
    if (fromUrl === 'a' || fromUrl === 'b') {
      localStorage.setItem('lo_variant', fromUrl);
      return fromUrl;
    }
    let stored = localStorage.getItem('lo_variant');
    if (stored !== 'a' && stored !== 'b') {
      stored = Math.random() < 0.5 ? 'a' : 'b';
      localStorage.setItem('lo_variant', stored);
    }
    return stored;
  } catch {
    return 'a';
  }
}
const VARIANT = typeof window !== 'undefined' ? getVariant() : 'a';

// ─── 今の悩みクイックピック ───────────────────────────────
const CONCERN_PICKS = [
  { id: 'transfer',    icon: '🔄', label: '転職・異動後の「違和感」を解消したい' },
  { id: 'relation',   icon: '👥', label: '上司・部下・同僚との関係がうまくいかない' },
  { id: 'motivation', icon: '🔋', label: 'やる気・モチベーションが続かない' },
  { id: 'strength',   icon: '💡', label: '自分の強みが職場で活かせていない' },
  { id: 'fit',        icon: '🧭', label: '仕事が「向いていない」気がしている' },
  { id: 'recognition',icon: '🏆', label: '頑張っているのに評価・結果が出ない' },
];

function trackEvent(action, params = {}) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, { event_category: 'diagnostic_flow', variant: VARIANT, ...params });
  }
}

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
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/gachijin")) {
    return <GachijinPipelinePage />;
  }

  const [page, setPage] = useState('top');
  const [mapFrom, setMapFrom] = useState('top');
  const [phase, setPhase] = useState("intro");
  const [mode, setMode] = useState(null); // 'simple' | 'precision' | null
  const [occupation, setOccupation] = useState(null);
  const [generation, setGeneration] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [jungAnswers, setJungAnswers] = useState({});
  const [biasAnswers, setBiasAnswers] = useState({});
  const [simpleJungAnswers, setSimpleJungAnswers] = useState({});
  const [simpleBiasAnswers, setSimpleBiasAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [biasShowAlt, setBiasShowAlt] = useState(false);
  const [jungShowAlt, setJungShowAlt] = useState(false);
  const [turboMode, setTurboMode] = useState(false);
  const [compassFlipped, setCompassFlipped] = useState(false);
  const [sliderValue, setSliderValue] = useState(2);
  const [sliderTouched, setSliderTouched] = useState(false);
  const sliderTimerRef = useRef(null);
  const titleTapsRef = useRef([]);
  const compassPressTimerRef = useRef(null);

  const [typeProfiles, setTypeProfiles] = useState(null);
  const [prescriptions, setPrescriptions] = useState(null);
  const [biasMessages, setBiasMessages] = useState(null);
  const [rssLinks, setRssLinks] = useState([]);

  // チャット
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);
  // 選択済み悩み（クイックピック用）
  const [selectedConcern, setSelectedConcern] = useState(null);
  const chatContainerRef = useRef(null);
  const retryFnRef = useRef(null);
  const resultTrackedRef = useRef(false);

  const occupations = OCCUPATIONS_18;
  const generations = GENERATIONS_7;

  const isJungPhase = phase === "jung";
  const isBiasPhase = phase === "bias";
  const isSimpleJungPhase = phase === "simple_jung";
  const isSimpleBiasPhase = phase === "simple_bias";
  const isSimplePhase = isSimpleJungPhase || isSimpleBiasPhase;
  const activeQuestions = isSimpleJungPhase
    ? simpleJungQuestions
    : isSimpleBiasPhase
      ? simpleBiasQuestions
      : isBiasPhase ? biasQuestions : questions;
  const currentQuestion = (isJungPhase || isBiasPhase || isSimplePhase) ? activeQuestions[currentQ] : null;
  const totalQ = activeQuestions.length;
  const simpleTotalQ = simpleJungQuestions.length + simpleBiasQuestions.length; // 12
  const answeredQ = Object.keys(
    isSimpleJungPhase ? simpleJungAnswers
    : isSimpleBiasPhase ? simpleBiasAnswers
    : isBiasPhase ? biasAnswers
    : jungAnswers
  ).length;
  const progress = totalQ > 0 ? (answeredQ / totalQ) * 100 : 0;
  const simpleOverallAnswered = Object.keys(simpleJungAnswers).length + Object.keys(simpleBiasAnswers).length;
  const simpleOverallProgress = (simpleOverallAnswered / simpleTotalQ) * 100;

  const scoreResult = phase === "result" ? (() => { try { return calcScore(jungAnswers); } catch { return null; } })() : null;
  const biasResult = phase === "result" ? (() => { try { return calcBiasScores(biasAnswers); } catch { return null; } })() : null;
  const simpleScoreResult = phase === "simple_result" ? (() => { try { return calcSimpleJungScore(simpleJungAnswers); } catch { return null; } })() : null;
  const simpleBiasResult = phase === "simple_result" ? (() => { try { return calcSimpleBiasResult(simpleBiasAnswers); } catch { return null; } })() : null;
  const simpleMbtiType = simpleScoreResult ? getTypeName(simpleScoreResult) : "";
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


  const OCCUPATION_RSS_KEYWORDS = {
    '会社員':    ['会社員', 'ITエンジニア', '事務職', '営業', 'ビジネス'],
    '教育職':    ['教育職', '教員', '保育士', '先生'],
    '公務員':    ['公務員'],
    '医療職':    ['医療職', '看護師', '医師', '医療'],
    '士業':      ['士業', '弁護士', '税理士'],
    'クリエイター': ['クリエイター', 'デザイナー', 'ライター'],
    '接客':      ['接客', 'サービス業'],
    '調理':      ['調理', '料理人', '飲食'],
    '理美容師':  ['理美容師', '美容師'],
    '介護':      ['介護', '福祉'],
    'フリーランス': ['フリーランス', '副業', '独立'],
    '自営業':    ['自営業', '経営者'],
    '一次産業':  ['一次産業', '農業', '農家'],
    '建設業':    ['建設業', '建設', '土木'],
    '主婦/主夫': ['主婦', '主夫'],
    '非正規雇用': ['非正規', 'パート', 'アルバイト'],
    '学生':      ['学生', '就活', '新入社員'],
    '無職':      ['無職', '転職活動'],
  };

  useEffect(() => {
    const isFullResult = phase === 'result' && mbtiType;
    const isSimpleResult = phase === 'simple_result' && simpleMbtiType;
    if (!isFullResult && !isSimpleResult) return;
    const activeType = isFullResult ? mbtiType : simpleMbtiType;
    const cf = cognitiveFunctionMap[activeType];
    const occKeywords = isFullResult
      ? (OCCUPATION_RSS_KEYWORDS[occupation] ?? [occupationLabel])
      : [];
    const keywords = [cf?.lightName, ...occKeywords].filter(Boolean);
    fetch('/api/rss')
      .then(res => res.text())
      .then(xmlStr => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlStr, 'application/xml');
        const items = Array.from(doc.querySelectorAll('item'));
        const matched = [];
        items.forEach(item => {
          const title = item.querySelector('title')?.textContent || '';
          const link = item.querySelector('link')?.textContent || '';
          if (keywords.some(kw => title.includes(kw))) matched.push({ title, link });
        });
        setRssLinks(matched.slice(0, 3));
      })
      .catch(() => {});
  }, [phase, mbtiType, simpleMbtiType, occupationLabel]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, chatLoading]);

  useEffect(() => { trackEvent('app_loaded'); }, []);
  useEffect(() => {
    if (phase !== 'intro') return;
    trackEvent('step_top');
    trackEvent('intro_view');
    const t = setTimeout(() => trackEvent('intro_5s_engaged'), 5000);
    return () => clearTimeout(t);
  }, [phase]);
  useEffect(() => { if (phase === 'jung' && currentQ === 0) trackEvent('step_q1_start'); }, [phase]);
  useEffect(() => { if (phase === 'simple_jung' && currentQ === 0) trackEvent('simple_jung_q1_start'); }, [phase]);

  // ─── スライダー値リセット（質問が変わるたび） ─────────────
  useEffect(() => {
    setSliderValue(2);
    setSliderTouched(false);
    if (sliderTimerRef.current) { clearTimeout(sliderTimerRef.current); sliderTimerRef.current = null; }
  }, [currentQ, phase]);

  // ─── コナミコマンド検知（PCキーボード） ───────────────────
  useEffect(() => {
    const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let buf = [];
    const handler = (e) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      buf.push(k);
      if (buf.length > KONAMI.length) buf = buf.slice(-KONAMI.length);
      if (buf.length === KONAMI.length && buf.every((x, i) => x === KONAMI[i])) {
        if (!turboMode) {
          setTurboMode(true);
          trackEvent('turbo_unlocked', { method: 'konami' });
        }
        buf = [];
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [turboMode]);

  // タイトル5タップ → ターボモード（モバイル）
  function handleTitleTap() {
    const now = Date.now();
    titleTapsRef.current = titleTapsRef.current.filter((t) => now - t < 2000).concat(now);
    if (titleTapsRef.current.length >= 5 && !turboMode) {
      setTurboMode(true);
      trackEvent('turbo_unlocked', { method: 'logo_tap' });
      titleTapsRef.current = [];
    }
  }

  // 羅針盤長押し → 裏面（隠しステージ）
  function handleCompassPressStart() {
    if (phase !== 'result') return;
    if (compassPressTimerRef.current) clearTimeout(compassPressTimerRef.current);
    compassPressTimerRef.current = setTimeout(() => {
      setCompassFlipped(true);
      trackEvent('compass_flip');
    }, 3000);
  }
  function handleCompassPressEnd() {
    if (compassPressTimerRef.current) { clearTimeout(compassPressTimerRef.current); compassPressTimerRef.current = null; }
  }
  useEffect(() => {
    if (phase === 'result' && scoreResult && typeProfiles && prescriptions && biasMessages && !resultTrackedRef.current) {
      const archetypeName = cognitiveFunctionMap[mbtiType]?.lightName ?? '';
      trackEvent('step_result_shown');
      trackEvent('diag_complete', { archetype: archetypeName, mbti_type: mbtiType });
      resultTrackedRef.current = true;
    }
  }, [phase, scoreResult, typeProfiles, prescriptions, biasMessages]);

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
    const doApiCall = async () => {
      setChatLoading(true);
      setChatError(false);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ systemPrompt, messages: [{ role: "user", content: userContent }] }),
        });
        const data = await res.json();
        if (!res.ok) {
          console.error("Chat API error:", res.status, data?.error);
          setChatError(true);
        } else {
          setChatMessages([userMsg, { role: "assistant", content: data.content }]);
        }
      } catch (err) {
        console.error("Chat fetch error:", err);
        setChatError(true);
      } finally {
        setChatLoading(false);
      }
    };
    retryFnRef.current = doApiCall;
    await doApiCall();
  }

  // ─── チャット送信 ────────────────────────────────────
  async function handleChatSend() {
    const text = chatInput.trim();
    if (!text || chatLoading || isChatLimitReached) return;
    const userMsg = { role: "user", content: text };
    const apiMessages = [...chatMessages.map(({ role, content }) => ({ role, content })), userMsg];
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setChatInput("");
    const systemPrompt = buildSystemPrompt(mbtiType, scoreResult.scores, top2, typeProfile, occupationLabel, generationLabel);
    const doApiCall = async () => {
      setChatLoading(true);
      setChatError(false);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ systemPrompt, messages: apiMessages }),
        });
        const data = await res.json();
        if (!res.ok) {
          console.error("Chat API error:", res.status, data?.error);
          setChatError(true);
        } else {
          setChatMessages([...newMessages, { role: "assistant", content: data.content }]);
        }
      } catch (err) {
        console.error("Chat fetch error:", err);
        setChatError(true);
      } finally {
        setChatLoading(false);
      }
    };
    retryFnRef.current = doApiCall;
    await doApiCall();
  }

  function handleChatKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChatSend(); }
  }

  // ─── handleAnswer ────────────────────────────────────
  function handleAnswer(value) {
    if (animating) return;
    setSelected(value);
    setAnimating(true);
    // ターボモードはアニメーション短縮（連打テスト・素早い再診断のため）
    const delay = turboMode ? 60 : 300;
    setTimeout(() => {
      setSelected(null);
      setAnimating(false);
      if (isJungPhase) {
        const newAnswers = { ...jungAnswers, [currentQuestion.id]: value };
        setJungAnswers(newAnswers);
        setJungShowAlt(false);
        const next = currentQ + 1;
        if (next === 4)  trackEvent('step_q4_pass');
        if (next === 12) trackEvent('step_q12_pass');
        if (next === 20) trackEvent('step_q20_pass');
        if (next === 28) trackEvent('step_q28_pass');
        if (next === AXIS_END.EI)      { setCurrentQ(next); setPhase("ei_milestone"); trackEvent('step_q8_pass'); }
        else if (next === AXIS_END.SN) { setCurrentQ(next); setPhase("sn_milestone"); trackEvent('step_q16_pass'); }
        else if (next === AXIS_END.TF) { setCurrentQ(next); setPhase("tf_milestone"); trackEvent('step_q24_pass'); }
        else if (next === AXIS_END.JP) { setPhase("jp_milestone"); trackEvent('step_jung_complete'); }
        else                           { setCurrentQ(next); }
      } else if (isBiasPhase) {
        const newAnswers = { ...biasAnswers, [currentQuestion.id]: value };
        setBiasAnswers(newAnswers);
        setBiasShowAlt(false);
        if (currentQ + 1 < biasQuestions.length) {
          if (currentQ + 1 === 4) trackEvent('step_bias_q4_pass');
          if (currentQ + 1 === 8) trackEvent('step_bias_q8_pass');
          setCurrentQ((prev) => prev + 1);
        } else {
          trackEvent('step_bias_complete');
          setPhase("result");
        }
      }
    }, delay);
  }

  // ─── スライダー操作（ユング・通常モード）────────────────
  function handleSliderChange(v) {
    setSliderValue(v);
    setSliderTouched(true);
    if (sliderTimerRef.current) clearTimeout(sliderTimerRef.current);
    // 600ms 操作が止まったら自動で回答を確定して次へ
    sliderTimerRef.current = setTimeout(() => {
      trackEvent('slider_committed', { q_id: currentQuestion?.id, value: v });
      handleAnswer(v);
    }, 600);
  }

  // ─── handleJungSkip（ユング質問・代替問への切替／無回答スキップ）─
  function handleJungSkip() {
    if (animating) return;
    if (!jungShowAlt) {
      trackEvent('jung_skip_to_alt', { q_id: currentQuestion.id });
      setJungShowAlt(true);
      return;
    }
    // 2回目: 無回答スキップ
    trackEvent('jung_skip_unanswered', { q_id: currentQuestion.id });
    setJungShowAlt(false);
    const next = currentQ + 1;
    if (next === 4)  trackEvent('step_q4_pass');
    if (next === 12) trackEvent('step_q12_pass');
    if (next === 20) trackEvent('step_q20_pass');
    if (next === 28) trackEvent('step_q28_pass');
    if (next === AXIS_END.EI)      { setCurrentQ(next); setPhase("ei_milestone"); trackEvent('step_q8_pass'); }
    else if (next === AXIS_END.SN) { setCurrentQ(next); setPhase("sn_milestone"); trackEvent('step_q16_pass'); }
    else if (next === AXIS_END.TF) { setCurrentQ(next); setPhase("tf_milestone"); trackEvent('step_q24_pass'); }
    else if (next === AXIS_END.JP) { setPhase("jp_milestone"); trackEvent('step_jung_complete'); }
    else                           { setCurrentQ(next); }
  }

  // ─── handleBiasSkip（バイアス質問・代替問への切替／無回答スキップ）─
  function handleBiasSkip() {
    if (animating) return;
    if (!biasShowAlt) {
      // 1回目のスキップ → 代替問に切替
      trackEvent('bias_skip_to_alt', { q_id: currentQuestion.id });
      setBiasShowAlt(true);
      return;
    }
    // 2回目のスキップ → 無回答のまま次の問へ
    trackEvent('bias_skip_unanswered', { q_id: currentQuestion.id });
    setBiasShowAlt(false);
    if (currentQ + 1 < biasQuestions.length) {
      if (currentQ + 1 === 4) trackEvent('step_bias_q4_pass');
      if (currentQ + 1 === 8) trackEvent('step_bias_q8_pass');
      setCurrentQ((prev) => prev + 1);
    } else {
      trackEvent('step_bias_complete');
      setPhase("result");
    }
  }

  // ─── handleSimpleAnswer（簡易診断・二択 0/1） ────────
  function handleSimpleAnswer(value) {
    if (animating) return;
    setSelected(value);
    setAnimating(true);
    setTimeout(() => {
      setSelected(null);
      setAnimating(false);
      if (isSimpleJungPhase) {
        const newAnswers = { ...simpleJungAnswers, [currentQuestion.id]: value };
        setSimpleJungAnswers(newAnswers);
        const next = currentQ + 1;
        if (next === 4) trackEvent('simple_jung_q4_pass');
        if (next < simpleJungQuestions.length) {
          setCurrentQ(next);
        } else {
          trackEvent('simple_jung_complete');
          setCurrentQ(0);
          setPhase("simple_bias");
        }
      } else if (isSimpleBiasPhase) {
        const newAnswers = { ...simpleBiasAnswers, [currentQuestion.id]: value };
        setSimpleBiasAnswers(newAnswers);
        const next = currentQ + 1;
        if (next < simpleBiasQuestions.length) {
          setCurrentQ(next);
        } else {
          trackEvent('simple_bias_complete');
          trackEvent('simple_result_shown');
          setPhase("simple_result");
        }
      }
    }, 250);
  }

  // ─── handleBack ─────────────────────────────────────
  function handleBack() {
    trackEvent('step_back_pressed', { step_name: phase });
    if (phase === "occupation") { setPhase("intro"); setMode(null); }
    else if (phase === "generation") { setPhase("occupation"); }
    else if (phase === "simple_jung") {
      if (currentQ > 0) {
        const newAnswers = { ...simpleJungAnswers };
        delete newAnswers[simpleJungQuestions[currentQ - 1].id];
        setSimpleJungAnswers(newAnswers);
        setCurrentQ((prev) => prev - 1);
        setSelected(null);
      } else { setPhase("intro"); setMode(null); }
    }
    else if (phase === "simple_bias") {
      if (currentQ > 0) {
        const newAnswers = { ...simpleBiasAnswers };
        delete newAnswers[simpleBiasQuestions[currentQ - 1].id];
        setSimpleBiasAnswers(newAnswers);
        setCurrentQ((prev) => prev - 1);
        setSelected(null);
      } else {
        // 簡易ユング最終問題へ戻る
        setCurrentQ(simpleJungQuestions.length - 1);
        setPhase("simple_jung");
      }
    }
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
      setJungShowAlt(false);
      if (currentQ > 0) {
        const newAnswers = { ...jungAnswers };
        delete newAnswers[questions[currentQ - 1].id];
        setJungAnswers(newAnswers);
        setCurrentQ((prev) => prev - 1);
        setSelected(null);
      } else { setPhase("generation"); }
    }
    else if (phase === "bias") {
      setBiasShowAlt(false);
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
    resultTrackedRef.current = false;
    setPage('top'); setPhase("intro"); setMode(null);
    setOccupation(null); setGeneration(null);
    setCurrentQ(0); setJungAnswers({}); setBiasAnswers({}); setSelected(null);
    setSimpleJungAnswers({}); setSimpleBiasAnswers({});
    setAnimating(false); setBiasShowAlt(false); setJungShowAlt(false);
    setCompassFlipped(false);
    setTypeProfiles(null); setPrescriptions(null); setBiasMessages(null);
    setChatMessages([]); setChatInput(""); setChatLoading(false); setChatError(null);
    setSelectedConcern(null);
  }

  // 簡易→精密診断への遷移（簡易回答は破棄、新規Q&A）
  function startPrecisionFromSimple() {
    trackEvent('simple_to_precision_clicked');
    setMode('precision');
    setCurrentQ(0); setJungAnswers({}); setBiasAnswers({}); setSelected(null);
    setBiasShowAlt(false);
    setPhase("occupation");
  }


  const visibleMessages = chatMessages.filter((m) => !m.hidden);
  const isConsultationReady = typeProfiles && biasMessages;
  const assistantTurnCount = chatMessages.filter((m) => m.role === "assistant").length;
  const isChatLimitReached = assistantTurnCount >= 3;

  if (page === 'map') return <MapPage onBack={() => setPage(mapFrom)} />;

  return (
    <div style={{ minHeight: "100vh", background: "#faf6f1", color: TEXT, fontFamily: "Hiragino Sans, Hiragino Kaku Gothic ProN, sans-serif", padding: "20px 16px", paddingBottom: 40 }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>

        {/* ヘッダー */}
        <div style={{ textAlign: "center", paddingTop: 24, paddingBottom: 16 }}>
          <div
            onClick={handleTitleTap}
            onMouseDown={handleCompassPressStart}
            onMouseUp={handleCompassPressEnd}
            onMouseLeave={handleCompassPressEnd}
            onTouchStart={handleCompassPressStart}
            onTouchEnd={handleCompassPressEnd}
            onTouchCancel={handleCompassPressEnd}
            style={{ display: "inline-flex", alignItems: "center", gap: 10, color: ACCENT, cursor: phase === 'result' ? "pointer" : "default", userSelect: "none" }}
          >
            <CompassIcon size={22} strokeWidth={1.6} />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: TEXT, letterSpacing: "0.02em", margin: 0 }}>ライフオラクル</h1>
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: 1, color: TEXT_MUTED, marginTop: 6 }}>ユング心理学 × 行動経済学</div>
        </div>

        {/* ⚡TURBOバッジ（コナミコマンド or ロゴ5タップで発動） */}
        {turboMode && (
          <div style={{
            position: 'fixed', top: 12, right: 12, zIndex: 100,
            background: ACCENT, color: '#ffffff',
            padding: '4px 10px', borderRadius: 12,
            fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
            animation: 'lo-fade-in 220ms var(--ease-out)',
            boxShadow: '0 2px 8px rgba(184,131,63,0.30)',
            pointerEvents: 'none',
          }}>
            ⚡ TURBO
          </div>
        )}

        {/* 羅針盤裏面オーバーレイ（隠しステージ：今月の問い） */}
        {compassFlipped && (
          <div
            onClick={() => setCompassFlipped(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(45, 35, 24, 0.78)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '24px',
              animation: 'lo-fade-in 320ms var(--ease-out)',
              cursor: 'pointer',
            }}
          >
            <div style={{
              maxWidth: 480, width: '100%',
              background: 'linear-gradient(135deg, #fdfbf7 0%, #f5efe8 100%)',
              borderRadius: 18, padding: '36px 28px',
              boxShadow: '0 20px 60px rgba(45,35,24,0.40)',
              textAlign: 'center',
              border: `1.5px solid ${ACCENT}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18, color: ACCENT, animation: 'lo-fade-in 600ms var(--ease-out)' }}>
                <CompassIcon size={56} strokeWidth={1.4} decorative />
              </div>
              <div style={{ fontSize: 11, letterSpacing: 2, color: ACCENT, marginBottom: 14, fontWeight: 600 }}>
                ─── 羅針盤の裏面 ───
              </div>
              <p style={{
                fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500,
                lineHeight: 2, color: TEXT, margin: 0,
              }}>
                {MONTHLY_QUESTIONS[new Date().getMonth() + 1] ?? '—'}
              </p>
              <div style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 22, letterSpacing: 0.5 }}>
                tap to close
              </div>
            </div>
          </div>
        )}

        {/* Intro */}
        {phase === "intro" && (
          <div style={{ ...CARD_STYLE, animation: "lo-fade-in 320ms var(--ease-out)" }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 19, fontWeight: 700, lineHeight: 1.6,
              color: TEXT, textAlign: "center", marginBottom: 20,
            }}>
              職場で<span style={{ color: ACCENT }}>「なぜかうまくいかない」</span>と<br />
              感じていませんか？
            </h2>

            <div style={{ marginBottom: 22 }}>
              <div className="lo-benefit-row">
                <span className="lo-benefit-check">✓</span>
                <span>自分の<strong>強み</strong>と無意識の<strong>行動パターン</strong>がわかる</span>
              </div>
              <div className="lo-benefit-row">
                <span className="lo-benefit-check">✓</span>
                <span>あなたのタイプ別の<strong>「思考のクセ」</strong>を可視化</span>
              </div>
              <div className="lo-benefit-row">
                <span className="lo-benefit-check">✓</span>
                <span>本格診断は<strong>処方箋とAI相談</strong>つき（ユング心理学×行動経済学）</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: 22, color: ACCENT }}>
              <CompassIcon size={64} strokeWidth={1.4} decorative />
            </div>

            <button
              className="lo-primary-cta"
              style={{ marginBottom: 6 }}
              onClick={() => {
                trackEvent('mode_selected_simple');
                trackEvent('step_start');
                setMode('simple');
                setCurrentQ(0);
                setSimpleJungAnswers({});
                setSimpleBiasAnswers({});
                setPhase("simple_jung");
              }}
            >
              60秒で簡易診断を試す（無料）
            </button>
            <div style={{ fontSize: 11, color: TEXT_MUTED, textAlign: "center", marginBottom: 16 }}>
              全12問・登録不要・あなたの仮タイプがわかる
            </div>

            <button
              className="lo-secondary-cta"
              style={{ marginBottom: 8 }}
              onClick={() => {
                trackEvent('mode_selected_precision');
                trackEvent('step_start');
                setMode('precision');
                setPhase("occupation");
              }}
            >
              精密診断で処方箋・AI相談を受ける（5〜7分）
            </button>
            <div style={{ fontSize: 11, color: TEXT_MUTED, textAlign: "center", marginBottom: 18 }}>
              職種×年代×タイプから2,016通りの個別処方箋
            </div>

            <button className="map-btn" onClick={() => { setMapFrom('top'); setPage('map'); }}>16タイプ 全体マップを見る</button>
          </div>
        )}

        {/* 簡易診断（ユング8問 + バイアス4問・二択） */}
        {(phase === "simple_jung" || phase === "simple_bias") && currentQuestion && (
          <div style={{ ...CARD_STYLE, opacity: animating ? 0.7 : 1, transition: "opacity 0.2s" }}>
            <button onClick={handleBack} style={backBtnStyle}>← 戻る</button>
            <div style={{ height: 7, background: "rgba(184,131,63,0.12)", borderRadius: 4, marginBottom: 10 }}>
              <div style={{ height: "100%", width: `${simpleOverallProgress}%`, background: ACCENT, borderRadius: 4, transition: "width 0.3s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>
                Q{simpleOverallAnswered + 1} / {simpleTotalQ}
              </div>
              <div style={{ fontSize: 11, color: ACCENT, letterSpacing: 1 }}>
                60秒診断・残り {simpleTotalQ - simpleOverallAnswered - (selected !== null ? 1 : 0)} 問
              </div>
            </div>
            <div style={{ fontSize: 10, letterSpacing: 2, color: ACCENT, marginBottom: 10 }}>
              {isSimpleJungPhase
                ? `${AXIS_ICONS[currentQuestion.axis] ?? ''} ${currentQuestion.scene}`
                : `${BIAS_ICON} ${currentQuestion.scene}`}
            </div>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: 17, fontWeight: 500, lineHeight: 1.9, marginBottom: 18, color: TEXT,
            }}>
              {currentQuestion.stem}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[currentQuestion.optionA, currentQuestion.optionB].map((text, i) => {
                const activeAnswers = isSimpleJungPhase ? simpleJungAnswers : simpleBiasAnswers;
                const isSelected = selected === i || activeAnswers[currentQuestion.id] === i;
                return (
                  <button
                    key={i}
                    onClick={() => handleSimpleAnswer(i)}
                    className={`lo-simple-answer-btn ${isSelected ? 'active' : ''}`}
                  >
                    <span style={{
                      display: "inline-block",
                      width: 22, height: 22, lineHeight: '22px',
                      textAlign: 'center', borderRadius: '50%',
                      background: isSelected ? ACCENT : "rgba(184,131,63,0.12)",
                      color: isSelected ? "#fff" : ACCENT,
                      fontSize: 12, fontWeight: 700,
                      marginRight: 10, verticalAlign: 'middle',
                    }}>
                      {i === 0 ? 'A' : 'B'}
                    </span>
                    <span style={{ verticalAlign: 'middle' }}>{text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 簡易診断結果 */}
        {phase === "simple_result" && simpleScoreResult && simpleBiasResult && (() => {
          const cf = cognitiveFunctionMap[simpleMbtiType];
          const flagged = simpleBiasResult.flagged;
          return (
            <>
              <div style={{ ...CARD_STYLE, animation: "lo-fade-in 320ms var(--ease-out)" }}>
                <div style={{ fontSize: 11, letterSpacing: 1, color: ACCENT, marginBottom: 4 }}>あなたの仮タイプ</div>
                {cf && (
                  <>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, textAlign: "center", marginBottom: 4, fontWeight: 700, color: ACCENT }}>{cf.lightName}</h2>
                    <div style={{ textAlign: "center", fontSize: 12, color: TEXT_MUTED, marginBottom: 10 }}>
                      {simpleMbtiType} · {typeLabels[simpleMbtiType] ?? ''}
                    </div>
                    {famousPeople[simpleMbtiType] && (
                      <div style={{ textAlign: "center", fontSize: 12, color: ACCENT, marginBottom: 14 }}>
                        {famousPeople[simpleMbtiType].people.join(' · ')} と同じタイプ
                      </div>
                    )}
                    <div style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(184,131,63,0.15)", borderRadius: 10, padding: "12px 16px" }}>
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
                )}
              </div>

              {/* バイアス傾向（簡易） */}
              {flagged.length > 0 && (
                <div style={CARD_STYLE}>
                  <h3 style={{ fontSize: 14, color: ACCENT, marginBottom: 10 }}>反応しやすい思考のクセ</h3>
                  {flagged.slice(0, 2).map((bid, idx) => {
                    const info = biasInfo[bid];
                    return (
                      <div key={bid} style={{ background: idx === 0 ? "rgba(184,131,63,0.08)" : "rgba(255,255,255,0.6)", border: `1px solid ${idx === 0 ? "rgba(184,131,63,0.25)" : "rgba(184,131,63,0.12)"}`, borderRadius: 12, padding: "14px 16px", marginBottom: idx === 0 && flagged.length > 1 ? 10 : 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: idx === 0 ? ACCENT : TEXT_MUTED, letterSpacing: 1 }}>第{idx + 1}傾向</span>
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{info?.name}</span>
                        </div>
                        <div style={{ fontSize: 12, color: TEXT_MUTED, lineHeight: 1.6 }}>{info?.short}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 精密診断ナッジ（最重要） */}
              <div className="lo-precision-nudge" style={{
                background: "rgba(184, 131, 63, 0.08)",
                border: `1.5px solid ${ACCENT}`,
                borderRadius: 14,
                padding: "20px 20px",
                marginBottom: 20,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT, marginBottom: 10, letterSpacing: "0.02em" }}>
                  💡 これは「表面的なあなた」の判定です
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.8, color: TEXT, margin: "0 0 14px 0" }}>
                  簡易診断は4軸を2問ずつで判定しています。本当のあなたは、潜在的に違う答えを持っているかもしれません。
                </p>
                <div style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(184,131,63,0.2)", borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: ACCENT, marginBottom: 8, fontWeight: 600 }}>精密診断（5〜7分）なら：</div>
                  <div style={{ fontSize: 13, lineHeight: 1.8, color: TEXT }}>
                    <div>✓ 32問+16問で正確なタイプを確定</div>
                    <div>✓ 職種×年代×タイプで絞った<strong>個別処方箋</strong></div>
                    <div>✓ AIコンサルタントへの<strong>個別相談</strong>（3回まで）</div>
                  </div>
                </div>
                <button
                  className="lo-primary-cta"
                  onClick={startPrecisionFromSimple}
                >
                  本当の自分を確かめる →
                </button>
              </div>

              {/* note記事3本（既存RSSから） */}
              {rssLinks.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 10, letterSpacing: 0.5 }}>
                    {cf?.lightName ?? simpleMbtiType} に関連する深掘り記事
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {rssLinks.map((item, idx) => (
                      <a key={idx} href={item.link} target='_blank' rel='noopener noreferrer'
                        onClick={() => trackEvent('simple_note_click', { article_index: idx })}
                        style={{ display: 'block', padding: '14px 16px', background: 'rgba(184,131,63,0.06)', border: '1px solid rgba(184,131,63,0.18)', borderRadius: 10, color: TEXT, textDecoration: 'none' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.5 }}>{item.title}</div>
                        <div style={{ fontSize: 11, color: ACCENT, marginTop: 6, textAlign: 'right' }}>noteで読む →</div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => { setMapFrom('simple_result'); setPage('map'); }}
                style={{ width: "100%", padding: 14, background: "rgba(184,131,63,0.08)", border: `1px solid rgba(184,131,63,0.25)`, borderRadius: 10, color: TEXT, fontSize: 14, cursor: "pointer", marginBottom: 12 }}>
                16タイプ 全体マップを見る
              </button>
              <button onClick={handleReset}
                style={{ width: "100%", padding: 14, background: "transparent", border: `1px solid rgba(184,131,63,0.2)`, borderRadius: 10, color: TEXT_MUTED, fontSize: 14, cursor: "pointer", marginBottom: 20 }}>
                もう一度診断する
              </button>
            </>
          );
        })()}

        {/* Occupation */}
        {phase === "occupation" && (
          <div style={CARD_STYLE}>
            <button onClick={handleBack} style={backBtnStyle}>← 戻る</button>
            <div style={{ display: "inline-block", fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: ACCENT, background: "rgba(184,131,63,0.10)", padding: "3px 10px", borderRadius: 12, marginBottom: 10 }}>Step 1 / 3</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 19, marginBottom: 14, textAlign: "center", fontWeight: 500 }}>あなたの職種に近いのは？</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {occupations.map((o) => {
                const icon = OCCUPATION_ICONS[o.label] ?? '💼';
                const active = occupation === o.id;
                return (
                  <button key={o.id} onClick={() => { setOccupation(o.id); trackEvent('step_job_selected'); setPhase("generation"); }}
                    style={{
                      padding: "14px 10px",
                      background: active ? "rgba(184,131,63,0.12)" : "rgba(255,255,255,0.7)",
                      border: `1px solid ${active ? ACCENT : "rgba(184,131,63,0.18)"}`,
                      borderRadius: 10,
                      color: TEXT, fontSize: 13, cursor: "pointer",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    }}>
                    <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
                    <span style={{ fontSize: 12, fontWeight: active ? 600 : 400 }}>{o.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Generation */}
        {phase === "generation" && (
          <div style={CARD_STYLE}>
            <button onClick={handleBack} style={backBtnStyle}>← 戻る</button>
            <div style={{ display: "inline-block", fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: ACCENT, background: "rgba(184,131,63,0.10)", padding: "3px 10px", borderRadius: 12, marginBottom: 10 }}>Step 2 / 3</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 19, marginBottom: 18, textAlign: "center", fontWeight: 500 }}>あなたの年代は？</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {generations.map((g) => {
                const active = generation === g.id;
                return (
                  <button key={g.id} onClick={() => { setGeneration(g.id); trackEvent('step_age_selected'); setPhase("jung"); }}
                    style={{ padding: 14, background: active ? "rgba(184,131,63,0.14)" : "rgba(255,255,255,0.7)", border: `1px solid ${active ? ACCENT : "rgba(184,131,63,0.18)"}`, borderRadius: 10, color: active ? ACCENT : TEXT, fontSize: 14, fontWeight: active ? 700 : 600, cursor: "pointer" }}>
                    {active && <span style={{ marginRight: 4 }}>✓</span>}{g.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ユング診断（スライダー or ターボモード4ボタン・代替問スキップつき） */}
        {phase === "jung" && currentQuestion && (() => {
          const displayed = jungShowAlt && currentQuestion.alt ? currentQuestion.alt : currentQuestion;
          const stem = displayed.stem;
          const tag = displayed.tag;
          const recordedValue = jungAnswers[currentQuestion.id];
          const TURBO_MARKS = ['●', '◐', '◑', '○'];
          return (
            <div style={{ ...CARD_STYLE, opacity: animating ? 0.7 : 1, transition: "opacity 0.2s" }}>
              <button onClick={handleBack} style={backBtnStyle}>← 戻る</button>
              <div style={{ height: 7, background: "rgba(184,131,63,0.12)", borderRadius: 4, marginBottom: 10 }}>
                <div style={{ height: "100%", width: `${progress}%`, background: ACCENT, borderRadius: 4, transition: "width 0.3s" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Q{currentQ + 1} / {totalQ}</div>
                <div style={{ fontSize: 11, color: ACCENT, letterSpacing: 1 }}>
                  性格診断・残り {totalQ - currentQ - 1} 問
                </div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: ACCENT, marginBottom: 8 }}>
                {AXIS_ICONS[currentQuestion.axis] ?? ''} {tag}
                {jungShowAlt && (
                  <span style={{ marginLeft: 8, color: TEXT_MUTED, fontWeight: 400, fontSize: 10 }}>
                    （別の聞き方）
                  </span>
                )}
              </div>
              <p style={{
                fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500,
                lineHeight: 1.9, marginBottom: 18, color: TEXT,
              }}>
                {stem}
              </p>

              {/* 強度マーク4ボタン（●◐◑○）。タップで即進む */}
              <div className="lo-spectrum-bar" style={{ marginBottom: 6 }}>
                <span>← そう（強い）</span>
                <span>（強い）ちがう →</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {TURBO_MARKS.map((mark, i) => {
                  const isSelected = selected === i || recordedValue === i;
                  return (
                    <button key={i} onClick={() => handleAnswer(i)}
                      className="lo-answer-btn"
                      aria-label={['強くそう','ややそう','ややちがう','強くちがう'][i]}
                      style={{
                        padding: "16px 4px",
                        background: isSelected ? "rgba(184,131,63,0.18)" : "rgba(255,255,255,0.85)",
                        border: `1.5px solid ${isSelected ? ACCENT : "rgba(184,131,63,0.22)"}`,
                        borderRadius: 10,
                        color: isSelected ? ACCENT : (i === 0 || i === 3 ? ACCENT : TEXT),
                        fontSize: 26, lineHeight: 1,
                        cursor: "pointer", textAlign: "center",
                        fontWeight: 500,
                        transition: "all 0.15s",
                      }}>
                      {mark}
                    </button>
                  );
                })}
              </div>

              {/* 飛ばすボタン */}
              <button
                onClick={handleJungSkip}
                disabled={animating}
                style={{
                  width: "100%",
                  padding: "8px 8px",
                  marginTop: 14,
                  background: "transparent",
                  border: `1px dashed rgba(184,131,63,0.30)`,
                  borderRadius: 10,
                  color: TEXT_MUTED,
                  fontSize: 11,
                  cursor: animating ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                }}>
                {jungShowAlt ? '答えづらいのでこの問は飛ばす →' : '別の聞き方で答える ↻'}
              </button>
            </div>
          );
        })()}

        {/* バイアス測定（○×2択・代替問スキップ機能つき） */}
        {phase === "bias" && currentQuestion && (() => {
          const displayed = biasShowAlt && currentQuestion.alt ? currentQuestion.alt : currentQuestion;
          const stem = displayed.stem;
          const scene = displayed.scene;
          const recordedValue = biasAnswers[currentQuestion.id];
          return (
            <div style={{ ...CARD_STYLE, opacity: animating ? 0.7 : 1, transition: "opacity 0.2s" }}>
              <button onClick={handleBack} style={backBtnStyle}>← 戻る</button>
              <div style={{ height: 7, background: "rgba(184,131,63,0.12)", borderRadius: 4, marginBottom: 10 }}>
                <div style={{ height: "100%", width: `${progress}%`, background: ACCENT, borderRadius: 4, transition: "width 0.3s" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Q{currentQ + 1} / {totalQ}</div>
                <div style={{ fontSize: 11, color: ACCENT, letterSpacing: 1 }}>
                  思考のクセ・残り {totalQ - currentQ - 1} 問
                </div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: ACCENT, marginBottom: 8 }}>
                {BIAS_ICON} {scene}
                {biasShowAlt && (
                  <span style={{ marginLeft: 8, color: TEXT_MUTED, fontWeight: 400, fontSize: 10 }}>
                    （別の聞き方）
                  </span>
                )}
              </div>
              <p style={{
                fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500,
                lineHeight: 1.9, marginBottom: 18, color: TEXT,
              }}>
                {stem}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                {/* ○ そう（value=0、3点扱い） */}
                <button
                  onClick={() => handleAnswer(0)}
                  className="lo-answer-btn"
                  style={{
                    padding: "16px 8px",
                    background: (selected === 0 || recordedValue === 0) ? "rgba(184,131,63,0.18)" : "rgba(255,255,255,0.85)",
                    border: `1.5px solid ${(selected === 0 || recordedValue === 0) ? ACCENT : "rgba(184,131,63,0.22)"}`,
                    borderRadius: 12,
                    color: (selected === 0 || recordedValue === 0) ? ACCENT : TEXT,
                    fontSize: 15, fontWeight: 600,
                    cursor: "pointer", textAlign: "center",
                    transition: "all 0.15s",
                  }}>
                  <span style={{ fontSize: 20, marginRight: 6 }}>○</span>そう
                </button>
                {/* × ちがう（value=3、0点扱い） */}
                <button
                  onClick={() => handleAnswer(3)}
                  className="lo-answer-btn"
                  style={{
                    padding: "16px 8px",
                    background: (selected === 3 || recordedValue === 3) ? "rgba(184,131,63,0.18)" : "rgba(255,255,255,0.85)",
                    border: `1.5px solid ${(selected === 3 || recordedValue === 3) ? ACCENT : "rgba(184,131,63,0.22)"}`,
                    borderRadius: 12,
                    color: (selected === 3 || recordedValue === 3) ? ACCENT : TEXT,
                    fontSize: 15, fontWeight: 600,
                    cursor: "pointer", textAlign: "center",
                    transition: "all 0.15s",
                  }}>
                  <span style={{ fontSize: 20, marginRight: 6 }}>×</span>ちがう
                </button>
              </div>
              <button
                onClick={handleBiasSkip}
                disabled={animating}
                style={{
                  width: "100%",
                  padding: "10px 8px",
                  background: "transparent",
                  border: `1px dashed rgba(184,131,63,0.35)`,
                  borderRadius: 10,
                  color: TEXT_MUTED,
                  fontSize: 12,
                  cursor: animating ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                }}>
                {biasShowAlt ? '答えづらいのでこの問は飛ばす →' : '別の聞き方で答える ↻'}
              </button>
            </div>
          );
        })()}

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
                <div className="lo-milestone-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'rgba(184,131,63,0.10)', border: `2px solid ${ACCENT}`, marginBottom: 12 }}>
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
              <button onClick={() => { if (isJP) { setCurrentQ(0); trackEvent('step_bias_start'); setPhase("bias"); } else { setPhase("jung"); } }}
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
            順序：タイプ発表 → 処方箋 → 思考のクセ
                  → 強み/癖 → 今日のアクション → AI相談（CTA）
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

            {/* ② 処方箋 */}
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

            {/* ⑥ AI相談（処方箋を読んだあとのCTA） */}
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
                      <div style={{ padding: "16px 18px", borderRadius: 12, background: "rgba(250,246,241,0.97)", border: "1px solid rgba(184,131,63,0.22)", fontSize: 13, color: "#5c4a32", lineHeight: 1.9 }}>
                        <div>申し訳ありません。</div>
                        <div>ただいまAI相談機能の一時メンテナンス中です。</div>
                        <div>診断結果と処方箋は引き続きご覧いただけますので、</div>
                        <div>ぜひ「思考のクセ」や「今日のアクション」を参考にしてみてください。</div>
                        <div style={{ marginTop: 8 }}>ご不便をおかけして申し訳ありません。</div>
                        <div>復旧までしばらくお待ちください。</div>
                        <button
                          onClick={() => retryFnRef.current?.()}
                          style={{ marginTop: 12, padding: "6px 16px", background: "rgba(184,131,63,0.1)", border: "1px solid rgba(184,131,63,0.3)", borderRadius: 8, color: "#8c5f28", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
                        >
                          もう一度試す
                        </button>
                      </div>
                    )}
                  </div>
                  {/* 追加質問フィールド / ターン上限到達 */}
                  {isChatLimitReached ? (
                    <div style={{ marginTop: 8, padding: "16px 18px", borderRadius: 12, background: "rgba(184,131,63,0.06)", border: "1px solid rgba(184,131,63,0.2)", textAlign: "center" }}>
                      <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.8, marginBottom: 14 }}>
                        今日の相談はここまでです。<br />
                        別の悩みがあれば、もう一度始めてみてください。
                      </div>
                      <button onClick={() => { setSelectedConcern(null); setChatMessages([]); setChatError(null); }}
                        style={{ padding: "10px 22px", background: ACCENT, border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                        別の悩みで新しく相談する
                      </button>
                    </div>
                  ) : (
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
                  )}
                </>
              )}
            </div>


            {/* note深掘り記事 */}
            {rssLinks.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 10, letterSpacing: 0.5 }}>
                  {cognitiveFunctionMap[mbtiType]?.lightName ?? mbtiType} ・ {occupationLabel} に関連する深掘り記事
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {rssLinks.map((item, idx) => (
                    <a key={idx} href={item.link} target='_blank' rel='noopener noreferrer'
                      style={{ display: 'block', padding: '14px 16px', background: 'rgba(184,131,63,0.06)', border: '1px solid rgba(184,131,63,0.18)', borderRadius: 10, color: TEXT, textDecoration: 'none' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.5 }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: ACCENT, marginTop: 6, textAlign: 'right' }}>noteで読む →</div>
                    </a>
                  ))}
                </div>
              </div>
            )}

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
