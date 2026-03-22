import { useState, useEffect } from "react";
import { questions } from "./data/questions.js";
import { calcScore, getTypeName, getTendencyLabel } from "./utils/scoring.js";
import {
  BIAS_MAP,
  OCCUPATIONS_18,
  GENERATIONS_7,
} from "../life_oracle_questions_data.js";

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
// 値: 0=強くそう, 1=ややそう, 2=ややちがう, 3=強くちがう

function generatePersonalPrompt(mbtiType, axisScores, typeProfile, occupationLabel, generationLabel) {
  const praise = typeProfile?.praiseText ?? "";
  const habit = typeProfile?.habitText ?? "";
  const axes = [
    `EI: ${axisScores.EI}点（${axisScores.EI >= 13 ? "E寄り" : "I寄り"}）`,
    `SN: ${axisScores.SN}点（${axisScores.SN >= 13 ? "S寄り" : "N寄り"}）`,
    `TF: ${axisScores.TF}点（${axisScores.TF >= 13 ? "T寄り" : "F寄り"}）`,
    `JP: ${axisScores.JP}点（${axisScores.JP >= 13 ? "J寄り" : "P寄り"}）`,
  ].join("\n");

  return `あなたは私の性格と行動傾向をよく理解したAIアシスタントです。
以下が私のプロフィールです。

【MBTIタイプ】${mbtiType}
【職種】${occupationLabel ?? "未選択"}
【年代】${generationLabel ?? "未選択"}

【軸ごとのスコア（各軸8問×最大3点=最大24点）】
${axes}

【私の強み】
${praise}

【私が持ちやすい心の癖】
${habit}

このプロフィールを踏まえた上で、私の相談に寄り添いながら答えてください。
断定せず、「〜かもしれません」「〜ではないでしょうか」という表現を使ってください。
私の強みを活かしながら、心の癖にも気づきを促すようなアドバイスをお願いします。`;
}

export default function App() {
  const [phase, setPhase] = useState("intro");
  const [occupation, setOccupation] = useState(null);
  const [generation, setGeneration] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);

  const [typeProfiles, setTypeProfiles] = useState(null);
  const [prescriptions, setPrescriptions] = useState(null);
  const [biasMessages, setBiasMessages] = useState(null);

  const occupations = OCCUPATIONS_18;
  const generations = GENERATIONS_7;

  const totalQ = questions.length; // 32
  const currentQuestion = questions[currentQ];
  const answeredQ = Object.keys(answers).length;
  const progress = totalQ > 0 ? (answeredQ / totalQ) * 100 : 0;

  const scoreResult = phase === "result" ? (() => {
    try { return calcScore(answers); } catch { return null; }
  })() : null;
  const mbtiType = scoreResult ? getTypeName(scoreResult) : "";
  const typeId = mbtiType; // "ESTJ" 等
  const occupationLabel = occupation ? occupations.find((o) => o.id === occupation)?.label : "";
  const generationLabel = generation ? generations.find((g) => g.id === generation)?.label : "";
  const prescriptionKey =
    occupation && typeId && generationLabel
      ? `${occupation}_${typeId}_${generationLabel}`
      : "";
  const typeProfile = typeProfiles?.[typeId] ?? null;
  const prescriptionText = prescriptions?.[prescriptionKey]?.text ?? null;
  const biasMsg1 = null; // バイアス質問は新フォーマットでは別途設計
  const biasMsg2 = null;

  useEffect(() => {
    if (phase !== "result") return;
    fetch("/data/type_profiles.json")
      .then((r) => r.json())
      .then(setTypeProfiles)
      .catch(() => setTypeProfiles({}));
    fetch("/data/prescriptions.json")
      .then((r) => r.json())
      .then(setPrescriptions)
      .catch(() => setPrescriptions({}));
    fetch("/data/bias_messages.json")
      .then((r) => r.json())
      .then(setBiasMessages)
      .catch(() => setBiasMessages({}));
  }, [phase]);

  function handleAnswer(value) {
    // value: 0=強くそう, 1=ややそう, 2=ややちがう, 3=強くちがう
    if (animating) return;
    setSelected(value);
    setAnimating(true);
    setTimeout(() => {
      const newAnswers = { ...answers, [currentQuestion.id]: value };
      setAnswers(newAnswers);
      setSelected(null);
      setAnimating(false);
      if (currentQ + 1 < questions.length) {
        setCurrentQ((prev) => prev + 1);
      } else {
        setPhase("result");
      }
    }, 300);
  }

  function handleBack() {
    if (phase === "occupation") {
      setPhase("intro");
    } else if (phase === "generation") {
      setPhase("occupation");
    } else if (phase === "quiz") {
      if (currentQ > 0) {
        const prevQ = questions[currentQ - 1];
        const newAnswers = { ...answers };
        delete newAnswers[prevQ.id];
        setAnswers(newAnswers);
        setCurrentQ((prev) => prev - 1);
        setSelected(null);
      } else {
        setPhase("generation");
      }
    }
  }

  function handleReset() {
    setPhase("intro");
    setOccupation(null);
    setGeneration(null);
    setCurrentQ(0);
    setAnswers({});
    setSelected(null);
    setAnimating(false);
    setPromptCopied(false);
    setTypeProfiles(null);
    setPrescriptions(null);
    setBiasMessages(null);
  }

  function handleCopyPrompt() {
    if (!scoreResult) return;
    const prompt = generatePersonalPrompt(
      mbtiType,
      scoreResult.scores,
      typeProfile,
      occupationLabel,
      generationLabel
    );
    const onSuccess = () => {
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2000);
    };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(prompt).then(onSuccess).catch(() => fallbackCopy(prompt, onSuccess));
    } else {
      fallbackCopy(prompt, onSuccess);
    }
  }

  function fallbackCopy(text, onSuccess) {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.cssText = "position:fixed;top:-9999px;left:-9999px";
    document.body.appendChild(el);
    el.select();
    try {
      if (document.execCommand("copy")) onSuccess();
    } finally {
      document.body.removeChild(el);
    }
  }

  const shareText = mbtiType ? `MBTIタイプ：${mbtiType} #ライフオラクル` : "";
  const shareUrl = typeof window !== "undefined" ? encodeURIComponent(window.location.href) : "";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f1a",
        color: TEXT,
        fontFamily: "Hiragino Sans, Hiragino Kaku Gothic ProN, sans-serif",
        padding: "20px 16px",
        paddingBottom: 40,
      }}
    >
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ textAlign: "center", paddingTop: 24, paddingBottom: 16 }}>
          <div style={{ fontSize: 12, letterSpacing: 4, color: ACCENT }}>LIFE ORACLE</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: TEXT, marginTop: 8 }}>ライフオラクル</h1>
        </div>

        {/* Step 1: Intro */}
        {phase === "intro" && (
          <div style={CARD_STYLE}>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: TEXT_MUTED, marginBottom: 24, textAlign: "center" }}>
              ユング心理学と行動経済学に基づく性格診断で、
              <br />
              あなただけの処方箋と個人専用プロンプトを生成します。
              <br />
              <br />
              所要時間：約8〜10分（全32問）
            </p>
            <button
              onClick={() => setPhase("occupation")}
              style={{
                width: "100%",
                padding: 16,
                background: "linear-gradient(135deg, #2d1b69, #1a0a2e)",
                border: `1px solid ${ACCENT}`,
                borderRadius: 12,
                color: TEXT,
                fontSize: 14,
                letterSpacing: 2,
                cursor: "pointer",
              }}
            >
              診断を始める
            </button>
          </div>
        )}

        {/* Step 2: Occupation */}
        {phase === "occupation" && (
          <div style={CARD_STYLE}>
            <button onClick={handleBack} style={backBtnStyle}>← 戻る</button>
            <div style={{ fontSize: 10, letterSpacing: 2, color: ACCENT, marginBottom: 8 }}>Step 1 / 3</div>
            <h2 style={{ fontSize: 18, marginBottom: 8, textAlign: "center" }}>あなたの職種に近いのは？</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {occupations.map((o) => (
                <button
                  key={o.id}
                  onClick={() => { setOccupation(o.id); setPhase("generation"); }}
                  style={{
                    padding: 14,
                    background: occupation === o.id ? "rgba(196,148,10,0.15)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${occupation === o.id ? ACCENT : "rgba(196,148,10,0.2)"}`,
                    borderRadius: 10,
                    color: TEXT,
                    fontSize: 13,
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Generation */}
        {phase === "generation" && (
          <div style={CARD_STYLE}>
            <button onClick={handleBack} style={backBtnStyle}>← 戻る</button>
            <div style={{ fontSize: 10, letterSpacing: 2, color: ACCENT, marginBottom: 8 }}>Step 2 / 3</div>
            <h2 style={{ fontSize: 18, marginBottom: 16, textAlign: "center" }}>あなたの年代は？</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {generations.map((g) => (
                <button
                  key={g.id}
                  onClick={() => { setGeneration(g.id); setPhase("quiz"); }}
                  style={{
                    padding: 14,
                    background: generation === g.id ? "rgba(196,148,10,0.15)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${generation === g.id ? ACCENT : "rgba(196,148,10,0.2)"}`,
                    borderRadius: 10,
                    color: TEXT,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Quiz（32問・4段階横並び） */}
        {phase === "quiz" && currentQuestion && (
          <div style={{ ...CARD_STYLE, opacity: animating ? 0.7 : 1, transition: "opacity 0.2s" }}>
            <button onClick={handleBack} style={backBtnStyle}>← 戻る</button>

            {/* プログレスバー */}
            <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, marginBottom: 10 }}>
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: ACCENT,
                  borderRadius: 2,
                  transition: "width 0.3s",
                }}
              />
            </div>

            {/* 問番号 */}
            <div style={{ fontSize: 11, color: TEXT_MUTED, marginBottom: 4 }}>
              {currentQ + 1} / {totalQ}
            </div>
            <div style={{ fontSize: 10, letterSpacing: 2, color: ACCENT, marginBottom: 6 }}>
              Step 3 / 3 — 性格診断
            </div>
            <div style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 14 }}>
              テーマ：{currentQuestion.tag}
            </div>

            {/* 質問文 */}
            <p style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
              {currentQuestion.stem}
            </p>

            {/* 軸ラベル */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                color: TEXT_MUTED,
                marginBottom: 12,
                padding: "0 2px",
              }}
            >
              <span style={{ color: ACCENT }}>{currentQuestion.leftLabel} 寄り</span>
              <span>←──────────→</span>
              <span style={{ color: ACCENT }}>{currentQuestion.rightLabel} 寄り</span>
            </div>

            {/* 4段階ボタン（横並び） */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {ANSWER_LABELS.map((label, i) => {
                const isSelected = selected === i || answers[currentQuestion.id] === i;
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    style={{
                      padding: "12px 4px",
                      background: isSelected ? "rgba(196,148,10,0.18)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${isSelected ? ACCENT : "rgba(196,148,10,0.2)"}`,
                      borderRadius: 10,
                      color: isSelected ? ACCENT : TEXT,
                      fontSize: 12,
                      lineHeight: 1.4,
                      cursor: "pointer",
                      textAlign: "center",
                      fontWeight: isSelected ? 600 : 400,
                      transition: "all 0.15s",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Result: Loading */}
        {phase === "result" && scoreResult && (!typeProfiles || !prescriptions || !biasMessages) && (
          <div style={{ ...CARD_STYLE, textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 14, color: TEXT_MUTED }}>結果を読み込み中...</div>
          </div>
        )}

        {/* Result */}
        {phase === "result" && scoreResult && typeProfiles && prescriptions && biasMessages && (
          <>
            {/* タイプ結果 */}
            <div style={CARD_STYLE}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: ACCENT, marginBottom: 8 }}>Your Life Oracle Profile</div>
              <h2 style={{ fontSize: 36, textAlign: "center", marginBottom: 4, letterSpacing: 4, fontWeight: 700 }}>
                {mbtiType}
              </h2>

              {/* 軸スコア */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 8,
                  marginBottom: 24,
                  marginTop: 16,
                }}
              >
                {[
                  { axis: "EI", left: "E（外向）", right: "I（内向）", score: scoreResult.scores.EI, isLeft: scoreResult.E },
                  { axis: "SN", left: "S（感覚）", right: "N（直観）", score: scoreResult.scores.SN, isLeft: scoreResult.S },
                  { axis: "TF", left: "T（思考）", right: "F（感情）", score: scoreResult.scores.TF, isLeft: scoreResult.T },
                  { axis: "JP", left: "J（判断）", right: "P（知覚）", score: scoreResult.scores.JP, isLeft: scoreResult.J },
                ].map(({ axis, left, right, score, isLeft }) => (
                  <div
                    key={axis}
                    style={{
                      background: "rgba(196,148,10,0.06)",
                      border: "1px solid rgba(196,148,10,0.15)",
                      borderRadius: 10,
                      padding: "10px 12px",
                    }}
                  >
                    <div style={{ fontSize: 11, color: ACCENT, marginBottom: 4 }}>
                      {isLeft ? left : right}
                    </div>
                    <div style={{ fontSize: 11, color: TEXT_MUTED }}>
                      {score}点 / 24点 &nbsp;·&nbsp; {getTendencyLabel(isLeft ? score : 24 - score)}
                    </div>
                    {/* スコアバー */}
                    <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, marginTop: 6 }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${(score / 24) * 100}%`,
                          background: ACCENT,
                          borderRadius: 2,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* 強み・心の癖 */}
              {typeProfile ? (
                <>
                  <h3 style={{ fontSize: 14, color: ACCENT, marginBottom: 8 }}>あなたの強み（大絶賛）</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.8, marginBottom: 20, whiteSpace: "pre-wrap" }}>{typeProfile.praiseText}</p>
                  <h3 style={{ fontSize: 14, color: ACCENT, marginBottom: 8 }}>心の癖</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{typeProfile.habitText}</p>
                </>
              ) : (
                <p style={{ color: TEXT_MUTED, fontSize: 13 }}>
                  タイプ {mbtiType} のプロフィールデータを準備中です。
                </p>
              )}
            </div>

            {/* 処方箋 */}
            <div style={CARD_STYLE}>
              <h3 style={{ fontSize: 14, color: ACCENT, marginBottom: 12 }}>
                処方箋（{occupationLabel} × {mbtiType} × {generationLabel}）
              </h3>
              {prescriptionText ? (
                <div style={{ fontSize: 14, lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{prescriptionText}</div>
              ) : (
                <p style={{ color: TEXT_MUTED, fontSize: 14 }}>
                  該当する処方箋のデータがありません。
                </p>
              )}
            </div>

            {/* 個人専用プロンプト */}
            <div style={CARD_STYLE}>
              <h3 style={{ fontSize: 14, color: ACCENT, marginBottom: 12 }}>ChatGPT・Claude用 個人専用プロンプト</h3>
              <button
                onClick={handleCopyPrompt}
                style={{
                  width: "100%",
                  padding: 14,
                  background: promptCopied ? "rgba(168,216,168,0.2)" : "rgba(196,148,10,0.15)",
                  border: `1px solid ${promptCopied ? "#a8d8a8" : ACCENT}`,
                  borderRadius: 10,
                  color: TEXT,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                {promptCopied ? "✓ コピーしました" : "プロンプトを生成してコピー"}
              </button>
              <p style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 10, textAlign: "center" }}>
                ChatGPTやClaudeに貼り付けて使うと、あなたに合わせた回答をしてくれます
              </p>
            </div>

            {/* Xシェア */}
            <div style={CARD_STYLE}>
              <h3 style={{ fontSize: 14, color: ACCENT, marginBottom: 12 }}>結果をシェア</h3>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  width: "100%",
                  padding: 14,
                  background: "#1a1a2e",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 10,
                  color: TEXT,
                  fontSize: 14,
                  textAlign: "center",
                  textDecoration: "none",
                }}
              >
                Xでシェア（#ライフオラクル）
              </a>
            </div>

            {/* もう一度診断する */}
            <button
              onClick={handleReset}
              style={{
                width: "100%",
                padding: 14,
                background: "transparent",
                border: `1px solid rgba(196,148,10,0.3)`,
                borderRadius: 10,
                color: TEXT_MUTED,
                fontSize: 14,
                cursor: "pointer",
                marginBottom: 20,
              }}
            >
              もう一度診断する
            </button>

            {/* もっと深く知りたい方へ（note導線） */}
            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(196,148,10,0.15)",
                borderRadius: 12,
                padding: "20px 18px",
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 11, letterSpacing: 2, color: TEXT_MUTED, marginBottom: 12 }}>
                もっと深く知りたい方へ
              </div>
              <a
                href="https://note.com/lifeoraclejp"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  background: "rgba(196,148,10,0.07)",
                  border: "1px solid rgba(196,148,10,0.2)",
                  borderRadius: 10,
                  textDecoration: "none",
                  color: TEXT,
                  transition: "background 0.2s",
                }}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>📝</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                    ライフオラクルの考え方をnoteで読む
                  </div>
                  <div style={{ fontSize: 11, color: TEXT_MUTED, lineHeight: 1.6 }}>
                    光と影の仕組み、バイアスとの関係、MBTIとの違いなど。
                    <br />
                    診断結果をもっと深く理解したい方へ。
                  </div>
                </div>
                <span style={{ marginLeft: "auto", fontSize: 12, color: TEXT_MUTED }}>→</span>
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
