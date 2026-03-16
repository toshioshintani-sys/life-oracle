import { useState, useEffect } from "react";
import {
  QUESTIONS,
  JUNG_TYPE_MAP,
  BIAS_MAP,
  OCCUPATIONS_18,
  GENERATIONS_7,
  calcResults,
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

function primaryBtnStyle(enabled) {
  return {
    width: "100%",
    padding: 14,
    background: enabled ? ACCENT : "#333",
    border: "none",
    borderRadius: 10,
    color: enabled ? "#0f0f1a" : "#666",
    fontSize: 14,
    cursor: enabled ? "pointer" : "not-allowed",
  };
}

function getTypeName(results) {
  return results.isLight ? results.jungInfo?.light : results.jungInfo?.shadow;
}

function generatePersonalPrompt(results, typeProfile, occupationLabel, generationLabel) {
  const typeName = getTypeName(results);
  const lightShadow = results.isLight ? "光" : "影";
  const praise = typeProfile?.praiseText ?? "";
  const habit = typeProfile?.habitText ?? "";
  const bias1 = results.biasInfo?.name ?? "";
  const bias1Desc = results.biasInfo?.desc ?? "";
  const bias2 = results.biasInfo2 ? `${results.biasInfo2.name}（${results.biasInfo2.desc}）` : "";

  return `あなたは私の性格と行動傾向をよく理解したAIアシスタントです。
以下が私のプロフィールです。

【性格タイプ】${typeName}（${lightShadow}）
【特徴】${results.jungInfo?.name}（${results.topJung}）
【職種】${occupationLabel ?? "未選択"}
【年代】${generationLabel ?? "未選択"}

【私の強み】
${praise}

【私が持ちやすい心の癖】
${habit}

【私の行動バイアス傾向】
最も強いバイアス：${bias1}（${bias1Desc}）${bias2 ? `\n次に：${bias2}` : ""}

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
  const [jungDone, setJungDone] = useState(false);
  const [selected, setSelected] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);

  const [typeProfiles, setTypeProfiles] = useState(null);
  const [prescriptions, setPrescriptions] = useState(null);

  const occupations = OCCUPATIONS_18;
  const generations = GENERATIONS_7;

  const currentPhaseQuestions = jungDone ? QUESTIONS.bias : QUESTIONS.jung;
  const currentQuestion = currentPhaseQuestions[currentQ];
  const totalQ = QUESTIONS.jung.length + QUESTIONS.bias.length;
  const answeredQ = Object.keys(answers).length;
  const progress = totalQ > 0 ? (answeredQ / totalQ) * 100 : 0;

  const results = phase === "result" ? (() => { try { return calcResults(answers); } catch { return null; } })() : null;
  const typeId = results ? `${results.topJung}-${results.isLight ? "光" : "影"}` : "";
  const occupationLabel = occupation ? occupations.find((o) => o.id === occupation)?.label : "";
  const generationLabel = generation ? generations.find((g) => g.id === generation)?.label : "";
  const prescriptionKey =
    occupation && typeId && generationLabel
      ? `${occupation}_${typeId}_${generationLabel}`
      : "";
  const typeProfile = typeProfiles?.[typeId] ?? null;
  const prescriptionText = prescriptions?.[prescriptionKey]?.text ?? null;

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
  }, [phase]);

  function handleAnswer(type) {
    if (animating) return;
    setSelected(type);
    setAnimating(true);
    setTimeout(() => {
      const newAnswers = { ...answers, [currentQuestion.id]: type };
      setAnswers(newAnswers);
      setSelected(null);
      setAnimating(false);

      if (!jungDone) {
        if (currentQ + 1 < QUESTIONS.jung.length) setCurrentQ((prev) => prev + 1);
        else {
          setJungDone(true);
          setCurrentQ(0);
          setSelected(null);
          setPhase("bias_intro");
        }
      } else {
        if (currentQ + 1 < QUESTIONS.bias.length) setCurrentQ((prev) => prev + 1);
        else setPhase("result");
      }
    }, 400);
  }

  function handleReset() {
    setPhase("intro");
    setOccupation(null);
    setGeneration(null);
    setCurrentQ(0);
    setAnswers({});
    setJungDone(false);
    setSelected(null);
    setAnimating(false);
    setPromptCopied(false);
    setTypeProfiles(null);
    setPrescriptions(null);
  }

  function handleCopyPrompt() {
    const prompt = generatePersonalPrompt(results, typeProfile, occupationLabel, generationLabel);
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

  const shareText = results
    ? `${getTypeName(results)}（${results.jungInfo?.name}） #ライフオラクル`
    : "";
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
              所要時間：約10〜12分（全31問）
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

        {/* Step 2: Occupation (18) */}
        {phase === "occupation" && (
          <div style={CARD_STYLE}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: ACCENT, marginBottom: 8 }}>Step 1 / 4</div>
            <h2 style={{ fontSize: 18, marginBottom: 8, textAlign: "center" }}>あなたの職種に近いのは？</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 20 }}>
              {occupations.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setOccupation(o.id)}
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
            <button
              onClick={() => occupation && setPhase("generation")}
              disabled={!occupation}
              style={primaryBtnStyle(occupation)}
            >
              次へ
            </button>
          </div>
        )}

        {/* Step 3: Generation (7) */}
        {phase === "generation" && (
          <div style={CARD_STYLE}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: ACCENT, marginBottom: 8 }}>Step 2 / 4</div>
            <h2 style={{ fontSize: 18, marginBottom: 16, textAlign: "center" }}>あなたの年代は？</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
              {generations.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGeneration(g.id)}
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
            <button
              onClick={() => generation && setPhase("jung")}
              disabled={!generation}
              style={primaryBtnStyle(generation)}
            >
              診断を開始する
            </button>
          </div>
        )}

        {/* Step 4 & 5: Question */}
        {(phase === "jung" || phase === "bias") && currentQuestion && (
          <div style={{ ...CARD_STYLE, opacity: animating ? 0.7 : 1 }}>
            <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, marginBottom: 12 }}>
              <div style={{ height: "100%", width: `${progress}%`, background: ACCENT, borderRadius: 2, transition: "width 0.3s" }} />
            </div>
            <div style={{ fontSize: 11, color: TEXT_MUTED, marginBottom: 16 }}>{answeredQ} / {totalQ} 問</div>
            <div style={{ fontSize: 10, letterSpacing: 2, color: ACCENT, marginBottom: 8 }}>
              {phase === "jung" ? "Step 3 / 4 — ユング診断" : "Step 4 / 4 — バイアス診断"}
            </div>
            <div style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 12 }}>テーマ：{currentQuestion.theme}</div>
            <p style={{ fontSize: 17, lineHeight: 1.7, marginBottom: 24 }}>{currentQuestion.question}</p>
            {currentQuestion.options.map((opt) => (
              <button
                key={opt.label}
                onClick={() => handleAnswer(opt.type)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "14px 16px",
                  marginBottom: 10,
                  background: selected === opt.type ? "rgba(196,148,10,0.12)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${selected === opt.type ? ACCENT : "rgba(196,148,10,0.2)"}`,
                  borderRadius: 10,
                  color: TEXT,
                  fontSize: 14,
                  lineHeight: 1.5,
                  cursor: "pointer",
                }}
              >
                <span style={{ color: ACCENT, marginRight: 8 }}>{opt.label}</span>
                {opt.text}
              </button>
            ))}
          </div>
        )}

        {/* Bias intro */}
        {phase === "bias_intro" && (
          <div style={{ ...CARD_STYLE, textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>⚖️</div>
            <h2 style={{ fontSize: 18, marginBottom: 12 }}>次のフェーズへ</h2>
            <p style={{ fontSize: 14, color: TEXT_MUTED, lineHeight: 1.8, marginBottom: 24 }}>
              ユング診断が完了しました。次は「意思決定パターン」の診断です。
            </p>
            <button
              onClick={() => setPhase("bias")}
              style={{
                width: "100%",
                padding: 16,
                background: "rgba(196,148,10,0.2)",
                border: `1px solid ${ACCENT}`,
                borderRadius: 12,
                color: TEXT,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              続ける
            </button>
          </div>
        )}

        {/* Step 6: Result - Loading */}
        {phase === "result" && results && (!typeProfiles || !prescriptions) && (
          <div style={{ ...CARD_STYLE, textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 14, color: TEXT_MUTED }}>結果を読み込み中...</div>
          </div>
        )}

        {/* Step 6: Result */}
        {phase === "result" && results && typeProfiles && prescriptions && (
          <>
            <div style={CARD_STYLE}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: ACCENT, marginBottom: 8 }}>Your Life Oracle Profile</div>
              <h2 style={{ fontSize: 26, textAlign: "center", marginBottom: 8 }}>
                {getTypeName(results)}
              </h2>
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 16px",
                  borderRadius: 20,
                  fontSize: 12,
                  marginBottom: 24,
                  border: `1px solid ${results.isLight ? "rgba(168,216,168,0.5)" : "rgba(216,168,168,0.5)"}`,
                  background: results.isLight ? "rgba(168,216,168,0.1)" : "rgba(216,168,168,0.1)",
                  color: results.isLight ? "#a8d8a8" : "#d8a8a8",
                }}
              >
                {results.isLight ? "✦ 光のパターン" : "◈ 影のパターン"}
              </div>

              {/* 大絶賛・心の癖 */}
              {typeProfile && (
                <>
                  <h3 style={{ fontSize: 14, color: ACCENT, marginBottom: 8 }}>あなたの強み（大絶賛）</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.8, marginBottom: 20, whiteSpace: "pre-wrap" }}>{typeProfile.praiseText}</p>
                  <h3 style={{ fontSize: 14, color: ACCENT, marginBottom: 8 }}>心の癖</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.8, marginBottom: 20, whiteSpace: "pre-wrap" }}>{typeProfile.habitText}</p>
                </>
              )}

              {/* バイアス 1〜2 */}
              <h3 style={{ fontSize: 14, color: ACCENT, marginBottom: 8 }}>行動バイアス傾向</h3>
              <p style={{ fontSize: 14, lineHeight: 1.8, marginBottom: 8 }}>
                あなたは{results.biasInfo?.name}が強い傾向があります。（{results.biasInfo?.desc}）
              </p>
              {results.biasInfo2 && (
                <p style={{ fontSize: 14, lineHeight: 1.8, marginBottom: 20 }}>
                  次に、{results.biasInfo2.name}も見られます。（{results.biasInfo2.desc}）
                </p>
              )}
            </div>

            {/* 処方箋 */}
            <div style={CARD_STYLE}>
              <h3 style={{ fontSize: 14, color: ACCENT, marginBottom: 12 }}>処方箋（{occupationLabel} × {getTypeName(results)} × {generationLabel}）</h3>
              {prescriptionText ? (
                <div style={{ fontSize: 14, lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{prescriptionText}</div>
              ) : (
                <p style={{ color: TEXT_MUTED, fontSize: 14 }}>該当する処方箋のデータがありません。ExcelからJSONを生成して public/data/prescriptions.json に配置してください。</p>
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
          </>
        )}
      </div>
    </div>
  );
}
