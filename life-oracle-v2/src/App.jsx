import { useState, useCallback, useRef } from 'react';
import { Entry }        from './pages_v2/Entry.jsx';
import { TopicSelect }  from './pages_v2/TopicSelect.jsx';
import { TargetSelect } from './pages_v2/TargetSelect.jsx';
import { Quiz }         from './pages_v2/Quiz.jsx';
import { PostQuiz }     from './pages_v2/PostQuiz.jsx';
import { MbtiResult }   from './pages_v2/MbtiResult.jsx';
import { Result }       from './pages_v2/Result.jsx';
import { AttackResult } from './pages_v2/AttackResult.jsx';
import { OracleWall }   from './pages_v2/OracleWall.jsx';

// MBTI engine
import { createSession as createMbtiSession } from './engine_v2/session.js';
import { applyAnswer, nextQuestion, buildResult as buildMbtiResult } from './engine_v2/flowSelf.js';
import { isFinished } from './engine_v2/selector.js';

// Situation engine
import {
  createSession as createSituSession,
  recordAnswer,
  shouldFinish,
  getNextQuestion,
  getSessionMessage,
  buildResult as buildSituResult,
} from './engine_v2/situationEngine.js';

// Attack engine
import {
  createAttackSession,
  recordAttackAnswer,
  shouldFinishAttack,
  getNextAttackQuestion,
  getAttackSessionMessage,
  buildAttackResult,
} from './engine_v2/attackEngine.js';

// Question pools
import { WORK_QUESTIONS }     from './data_v2/questions/work.js';
import { RELATION_QUESTIONS } from './data_v2/questions/relation.js';
import { SELF_QUESTIONS }     from './data_v2/questions/self.js';
import { FUTURE_QUESTIONS }   from './data_v2/questions/future.js';
import { DISCRIMINATING_QUESTIONS }     from './data_v2/questions/discriminating.js';
import { ATTACK_BOSS_QUESTIONS }           from './data_v2/questions/attack_boss.js';
import { ATTACK_COLLEAGUE_QUESTIONS }      from './data_v2/questions/attack_colleague.js';
import { ATTACK_SUBORDINATE_QUESTIONS }    from './data_v2/questions/attack_subordinate.js';
import { ATTACK_PARENT_QUESTIONS }         from './data_v2/questions/attack_parent.js';
import { ATTACK_CHILD_QUESTIONS }          from './data_v2/questions/attack_child.js';
import { ATTACK_SIBLING_QUESTIONS }        from './data_v2/questions/attack_sibling.js';
import { ATTACK_GRANDPARENT_QUESTIONS }    from './data_v2/questions/attack_grandparent.js';
import { ATTACK_PARTNER_QUESTIONS }        from './data_v2/questions/attack_partner.js';
import { ATTACK_ALMOST_PARTNER_QUESTIONS } from './data_v2/questions/attack_almost_partner.js';

const ATTACK_QUESTIONS_BY_TARGET = {
  boss:           ATTACK_BOSS_QUESTIONS,
  colleague:      ATTACK_COLLEAGUE_QUESTIONS,
  subordinate:    ATTACK_SUBORDINATE_QUESTIONS,
  parent:         ATTACK_PARENT_QUESTIONS,
  child:          ATTACK_CHILD_QUESTIONS,
  sibling:        ATTACK_SIBLING_QUESTIONS,
  grandparent:    ATTACK_GRANDPARENT_QUESTIONS,
  partner:        ATTACK_PARTNER_QUESTIONS,
  almost_partner: ATTACK_ALMOST_PARTNER_QUESTIONS,
};

import './App.css';

const MBTI_MAX_QUESTIONS    = 12;
const MBTI_ESTIMATED_TOTAL  = 12;
const SITU_ESTIMATED_TOTAL  = 8;
const SITU_MIN_QUESTIONS    = 4;
const ATTACK_ESTIMATED_TOTAL = 6;
const ATTACK_MIN_QUESTIONS  = 4;

// コールドリーディング：θの傾きから「読み」メッセージを生成
const MBTI_READINGS = {
  EI: {
    pos: '外で見せる顔と、一人の時の自分は少し違う人ですね。',
    neg: '一人の時間が、あなたを回復させるんですね。',
  },
  SN: {
    pos: '今あるものを確認してから動く。そういう着実さがありますね。',
    neg: '話の途中でふと、全然違う連想が頭をよぎることがありますね。',
  },
  TF: {
    pos: '感情より先に、「どうすれば解決するか」が浮かびますね。',
    neg: '頭より少し先に、胸のあたりで判断していることがありますね。',
  },
  JP: {
    pos: '決まっていない状態が続くと、落ち着かない感じがありますね。',
    neg: '決めるのは最後でいい、と思っていることが多いですね。',
  },
};

function getMbtiOracleMessage(session) {
  if (!session || session.questionCount < 3) return null;

  let bestAxis  = null;
  let bestTheta = 0;
  for (const [axis, theta] of Object.entries(session.thetas)) {
    if (Math.abs(theta) > Math.abs(bestTheta)) {
      bestAxis  = axis;
      bestTheta = theta;
    }
  }

  if (!bestAxis || Math.abs(bestTheta) < 0.8) return null;

  const r = MBTI_READINGS[bestAxis];
  return bestTheta > 0 ? r.pos : r.neg;
}

function topicQuestions(topicId) {
  const prefix = topicId.charAt(0);
  const domain = {
    work:     WORK_QUESTIONS,
    relation: RELATION_QUESTIONS,
    self:     SELF_QUESTIONS,
    future:   FUTURE_QUESTIONS,
  }[topicId] ?? [];
  const disc = DISCRIMINATING_QUESTIONS.filter(
    q => Array.isArray(q.pair) && q.pair.every(p => p.startsWith(prefix + '_'))
  );
  return [...domain, ...disc];
}

export default function App() {
  const [screen, setScreen]               = useState('entry');
  const [flow, setFlow]                   = useState(null);
  const [mbtiSession, setMbtiSession]     = useState(null);
  const [situSession, setSituSession]     = useState(null);
  const [situQuestions, setSituQuestions] = useState([]);
  const [attackSession, setAttackSession]     = useState(null);
  const [attackQuestions, setAttackQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [oracleMessage, setOracleMessage] = useState(null);
  const [mbtiResult, setMbtiResult]       = useState(null);
  const [mbtiOccupation, setMbtiOccupation] = useState(null);
  const [mbtiGeneration, setMbtiGeneration] = useState(null);
  const [situResult, setSituResult]       = useState(null);
  const [attackResult, setAttackResult]   = useState(null);
  const timerRef = useRef(null);

  // ── MBTI flow ───────────────────────────────────────────────────────────

  const startMbti = useCallback(() => {
    const sess = createMbtiSession();
    sess.maxQuestions = MBTI_MAX_QUESTIONS; // 12問固定
    const q = nextQuestion(sess);
    setMbtiSession(sess);
    setCurrentQuestion(q);
    setOracleMessage(null);
    setFlow('mbti');
    setScreen('quiz');
  }, []);

  const handleMbtiAnswer = useCallback((question, response) => {
    if (!mbtiSession) return;
    applyAnswer(mbtiSession, question, response);

    if (isFinished(mbtiSession)) {
      setMbtiResult(buildMbtiResult(mbtiSession));
      setScreen('post-quiz');
      return;
    }

    const next = nextQuestion(mbtiSession);
    if (!next) {
      setMbtiResult(buildMbtiResult(mbtiSession));
      setScreen('post-quiz');
      return;
    }

    setMbtiSession({ ...mbtiSession });
    setCurrentQuestion(next);
    setOracleMessage(getMbtiOracleMessage(mbtiSession));
  }, [mbtiSession]);

  const handlePostQuizComplete = useCallback((occupation, generation) => {
    setMbtiOccupation(occupation);
    setMbtiGeneration(generation);
    setScreen('result-mbti');
  }, []);

  // ── Situation flow ──────────────────────────────────────────────────────

  const handleTopicSelect = useCallback((topicId) => {
    const sess = createSituSession();
    const qs   = topicQuestions(topicId);
    const q    = getNextQuestion(sess, qs);
    setSituSession(sess);
    setSituQuestions(qs);
    setCurrentQuestion(q);
    setOracleMessage(null);
    setFlow('situation');
    setScreen('quiz');
  }, []);

  const handleSituAnswer = useCallback((question, choice) => {
    if (!situSession) return;
    if (!recordAnswer(situSession, question, choice)) return;

    if (shouldFinish(situSession, SITU_MIN_QUESTIONS)) {
      setSituResult(buildSituResult(situSession));
      setScreen('result-situation');
      return;
    }

    const next = getNextQuestion(situSession, situQuestions);
    if (!next) {
      setSituResult(buildSituResult(situSession));
      setScreen('result-situation');
      return;
    }

    setSituSession({ ...situSession });
    setCurrentQuestion(next);
    setOracleMessage(getSessionMessage(situSession));
  }, [situSession, situQuestions]);

  // ── Attack flow ─────────────────────────────────────────────────────────

  const handleTargetSelect = useCallback((targetId) => {
    const sess = createAttackSession(targetId);
    const qs   = ATTACK_QUESTIONS_BY_TARGET[targetId] ?? ATTACK_BOSS_QUESTIONS;
    const q    = getNextAttackQuestion(sess, qs);
    setAttackSession(sess);
    setAttackQuestions(qs);
    setCurrentQuestion(q);
    setOracleMessage(null);
    setFlow('attack');
    setScreen('quiz');
  }, []);

  const handleAttackAnswer = useCallback((question, choice) => {
    if (!attackSession) return;
    if (!recordAttackAnswer(attackSession, question, choice)) return;

    if (shouldFinishAttack(attackSession, ATTACK_MIN_QUESTIONS)) {
      setAttackResult(buildAttackResult(attackSession));
      setScreen('result-attack');
      return;
    }

    const next = getNextAttackQuestion(attackSession, attackQuestions);
    if (!next) {
      setAttackResult(buildAttackResult(attackSession));
      setScreen('result-attack');
      return;
    }

    setAttackSession({ ...attackSession });
    setCurrentQuestion(next);
    setOracleMessage(getAttackSessionMessage(attackSession));
  }, [attackSession, attackQuestions]);

  // ── Entry dispatch ──────────────────────────────────────────────────────

  const handleStart = useCallback((mode) => {
    if (mode === 'mbti') {
      startMbti();
    } else if (mode === 'attack') {
      setFlow('attack');
      setScreen('target-select');
    } else {
      setFlow('situation');
      setScreen('topic-select');
    }
  }, [startMbti]);

  // ── Retry ───────────────────────────────────────────────────────────────

  const handleRetry = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    setScreen('entry');
    setFlow(null);
    setMbtiSession(null);
    setSituSession(null);
    setSituQuestions([]);
    setAttackSession(null);
    setAttackQuestions([]);
    setCurrentQuestion(null);
    setOracleMessage(null);
    setMbtiResult(null);
    setMbtiOccupation(null);
    setMbtiGeneration(null);
    setSituResult(null);
    setAttackResult(null);
  }, []);

  // ── Answer dispatcher ───────────────────────────────────────────────────

  const handleAnswer = useCallback((question, responseOrChoice) => {
    if (flow === 'mbti') {
      handleMbtiAnswer(question, responseOrChoice);
    } else if (flow === 'attack') {
      handleAttackAnswer(question, responseOrChoice);
    } else {
      handleSituAnswer(question, responseOrChoice);
    }
  }, [flow, handleMbtiAnswer, handleSituAnswer, handleAttackAnswer]);

  // ── Render ──────────────────────────────────────────────────────────────

  const questionNum =
    flow === 'mbti'   ? (mbtiSession?.questionCount   ?? 0) + 1 :
    flow === 'attack' ? (attackSession?.questionCount ?? 0) + 1 :
                        (situSession?.questionCount   ?? 0) + 1;

  const estimatedTotal =
    flow === 'mbti'   ? MBTI_ESTIMATED_TOTAL :
    flow === 'attack' ? ATTACK_ESTIMATED_TOTAL :
                        SITU_ESTIMATED_TOTAL;

  if (screen === 'entry') {
    return <Entry onStart={handleStart} />;
  }

  if (screen === 'topic-select') {
    return <TopicSelect onSelect={handleTopicSelect} onBack={handleRetry} />;
  }

  if (screen === 'target-select') {
    return <TargetSelect onSelect={handleTargetSelect} onBack={handleRetry} />;
  }

  if (screen === 'quiz') {
    return (
      <Quiz
        question={currentQuestion}
        mode={flow}
        questionNum={questionNum}
        estimatedTotal={estimatedTotal}
        oracleMessage={oracleMessage}
        onAnswer={handleAnswer}
      />
    );
  }

  if (screen === 'post-quiz') {
    return <PostQuiz onComplete={handlePostQuizComplete} />;
  }

  if (screen === 'result-mbti') {
    return (
      <>
        <MbtiResult
          result={mbtiResult}
          occupation={mbtiOccupation}
          generation={mbtiGeneration}
          onRetry={handleRetry}
        />
        <OracleWall typeName={mbtiResult?.mbtiType} category="mbti" />
      </>
    );
  }

  if (screen === 'result-situation') {
    return (
      <>
        <Result result={situResult} onRetry={handleRetry} />
        <OracleWall typeName={situResult?.topSituation} category="situation" />
      </>
    );
  }

  if (screen === 'result-attack') {
    return (
      <>
        <AttackResult result={attackResult} onRetry={handleRetry} />
        <OracleWall typeName={attackResult?.type?.psychologyOS?.mechanismShort} category="attack" />
      </>
    );
  }

  return null;
}
