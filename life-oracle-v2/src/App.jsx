import { useState, useCallback, useRef } from 'react';
import { Entry }       from './pages_v2/Entry.jsx';
import { TopicSelect } from './pages_v2/TopicSelect.jsx';
import { Quiz }        from './pages_v2/Quiz.jsx';
import { MbtiResult }  from './pages_v2/MbtiResult.jsx';
import { Result }      from './pages_v2/Result.jsx';

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
  buildResult as buildSituResult,
} from './engine_v2/situationEngine.js';

// Question pools
import { WORK_QUESTIONS }     from './data_v2/questions/work.js';
import { RELATION_QUESTIONS } from './data_v2/questions/relation.js';
import { SELF_QUESTIONS }     from './data_v2/questions/self.js';
import { FUTURE_QUESTIONS }   from './data_v2/questions/future.js';
import { DISCRIMINATING_QUESTIONS } from './data_v2/questions/discriminating.js';

import './App.css';

const MBTI_ESTIMATED_TOTAL = 12;
const SITU_ESTIMATED_TOTAL = 8;
const SITU_MIN_QUESTIONS   = 4;

function topicQuestions(topicId) {
  const prefix = topicId.charAt(0); // 'w' / 'r' / 's' / 'f'
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
  const [screen, setScreen]           = useState('entry');
  const [flow, setFlow]               = useState(null);    // 'mbti' | 'situation'
  const [topic, setTopic]             = useState(null);
  const [mbtiSession, setMbtiSession] = useState(null);
  const [situSession, setSituSession] = useState(null);
  const [situQuestions, setSituQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [mbtiResult, setMbtiResult]   = useState(null);
  const [situResult, setSituResult]   = useState(null);
  const [transitionMsg, setTransitionMsg] = useState(null);
  const timerRef = useRef(null);

  // ── MBTI flow ───────────────────────────────────────────────────────────

  const startMbti = useCallback(() => {
    const sess = createMbtiSession();
    const q    = nextQuestion(sess);
    setMbtiSession(sess);
    setCurrentQuestion(q);
    setFlow('mbti');
    setScreen('quiz');
  }, []);

  const handleMbtiAnswer = useCallback((question, response) => {
    if (!mbtiSession) return;
    applyAnswer(mbtiSession, question, response);

    if (isFinished(mbtiSession)) {
      setMbtiResult(buildMbtiResult(mbtiSession));
      setScreen('result-mbti');
      return;
    }

    const next = nextQuestion(mbtiSession);
    if (!next) {
      setMbtiResult(buildMbtiResult(mbtiSession));
      setScreen('result-mbti');
      return;
    }

    setMbtiSession({ ...mbtiSession });
    setCurrentQuestion(next);
  }, [mbtiSession]);

  // ── Situation flow ──────────────────────────────────────────────────────

  const handleTopicSelect = useCallback((topicId) => {
    const sess = createSituSession();
    const qs   = topicQuestions(topicId);
    const q    = getNextQuestion(sess, qs);
    setSituSession(sess);
    setSituQuestions(qs);
    setTopic(topicId);
    setCurrentQuestion(q);
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
  }, [situSession, situQuestions]);

  // ── Entry dispatch ──────────────────────────────────────────────────────

  const handleStart = useCallback((mode) => {
    if (mode === 'mbti') {
      startMbti();
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
    setTopic(null);
    setMbtiSession(null);
    setSituSession(null);
    setSituQuestions([]);
    setCurrentQuestion(null);
    setMbtiResult(null);
    setSituResult(null);
    setTransitionMsg(null);
  }, []);

  // ── Answer dispatcher ───────────────────────────────────────────────────

  const handleAnswer = useCallback((question, responseOrChoice) => {
    if (flow === 'mbti') {
      handleMbtiAnswer(question, responseOrChoice);
    } else {
      handleSituAnswer(question, responseOrChoice);
    }
  }, [flow, handleMbtiAnswer, handleSituAnswer]);

  // ── Render ──────────────────────────────────────────────────────────────

  const questionNum = flow === 'mbti'
    ? (mbtiSession?.questionCount ?? 0) + 1
    : (situSession?.questionCount ?? 0) + 1;

  const estimatedTotal = flow === 'mbti' ? MBTI_ESTIMATED_TOTAL : SITU_ESTIMATED_TOTAL;

  if (screen === 'entry') {
    return <Entry onStart={handleStart} />;
  }

  if (screen === 'topic-select') {
    return <TopicSelect onSelect={handleTopicSelect} onBack={handleRetry} />;
  }

  if (screen === 'transition') {
    return (
      <div className="transition-screen">
        <p className="transition-message">{transitionMsg}</p>
      </div>
    );
  }

  if (screen === 'quiz') {
    return (
      <Quiz
        question={currentQuestion}
        mode={flow}
        questionNum={questionNum}
        estimatedTotal={estimatedTotal}
        onAnswer={handleAnswer}
      />
    );
  }

  if (screen === 'result-mbti') {
    return <MbtiResult result={mbtiResult} onRetry={handleRetry} />;
  }

  if (screen === 'result-situation') {
    return <Result result={situResult} onRetry={handleRetry} />;
  }

  return null;
}
