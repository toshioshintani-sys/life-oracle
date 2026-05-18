import { useState, useCallback, useRef } from 'react';
import { Entry }  from './pages_v2/Entry.jsx';
import { Quiz }   from './pages_v2/Quiz.jsx';
import { Result } from './pages_v2/Result.jsx';
import {
  createSession,
  recordAnswer,
  shouldFinish,
  getNextQuestion,
  getSessionMessage,
  getSessionConfidence,
  buildResult,
} from './engine_v2/situationEngine.js';
import { ALL_QUESTIONS } from './data_v2/questions/index.js';
import './App.css';

// トランジション表示の条件：絞り込んでテンポを守る
// 発動条件: ドメイン切り替え / universal終了 / ピボット直後
function resolveTransition(prevQ, nextQ, session) {
  if (!prevQ || !nextQ) return null;

  const domain = (q) => {
    if (q.type === 'universal')      return 'universal';
    if (q.type === 'discriminating') return 'discriminating';
    return q.discriminates?.[0]?.split('_')?.[0] ?? 'other';
  };

  const pd = domain(prevQ);
  const nd = domain(nextQ);

  // universal → アキネーター移行
  if (pd === 'universal' && nd !== 'universal') {
    return 'あなたのことが、少し見えてきました。';
  }
  // ピボット直後（1位の状況が入れ替わった直後）
  if (session.questionCount > 0 &&
      session.questionCount - session.lastPivotAt <= 1 &&
      session.lastPivotAt > 0) {
    return '少し別の角度から確認させてください。';
  }
  // ドメインが切り替わった時（同ドメイン継続はスルー＝即次問）
  if (pd !== nd && pd !== 'universal' && nd !== 'universal') {
    return '視点を変えます。';
  }

  return null; // 同ドメイン継続 → トランジションなし・即次問
}

export default function App() {
  const [screen, setScreen]                       = useState('entry');
  const [session, setSession]                     = useState(null);
  const [currentQuestion, setCurrentQuestion]     = useState(null);
  const [sessionMessage, setSessionMessage]       = useState(null);
  const [sessionConfidence, setSessionConfidence] = useState(0);
  const [result, setResult]                       = useState(null);
  const [transitionMsg, setTransitionMsg]         = useState(null);
  const [prevQuestion, setPrevQuestion]           = useState(null);
  const timerRef                                  = useRef(null);

  const handleStart = useCallback(() => {
    const sess  = createSession();
    const first = getNextQuestion(sess, ALL_QUESTIONS);
    setSession(sess);
    setCurrentQuestion(first);
    setPrevQuestion(null);
    setSessionMessage(getSessionMessage(sess));
    setScreen('quiz');
  }, []);

  const handleAnswer = useCallback((question, choice) => {
    if (!session) return;

    recordAnswer(session, question, choice);
    setSessionMessage(getSessionMessage(session));
    setSessionConfidence(getSessionConfidence(session));

    if (shouldFinish(session)) {
      setResult(buildResult(session));
      setScreen('result');
      return;
    }

    const next = getNextQuestion(session, ALL_QUESTIONS);
    if (!next) {
      setResult(buildResult(session));
      setScreen('result');
      return;
    }

    const msg = resolveTransition(question, next, session);

    setPrevQuestion(question);
    setCurrentQuestion(next);
    setSession({ ...session });

    if (msg) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setTransitionMsg(msg);
      setScreen('transition');
      timerRef.current = setTimeout(() => {
        setTransitionMsg(null);
        setScreen('quiz');
      }, 1600);
    }
  }, [session]);

  const handleRetry = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setSession(null);
    setCurrentQuestion(null);
    setPrevQuestion(null);
    setSessionMessage(null);
    setSessionConfidence(0);
    setResult(null);
    setTransitionMsg(null);
    setScreen('entry');
  }, []);

  if (screen === 'entry')      return <Entry onStart={handleStart} />;
  if (screen === 'transition') return (
    <div className="transition-screen">
      <p className="transition-message">{transitionMsg}</p>
    </div>
  );
  if (screen === 'quiz')   return (
    <Quiz
      question={currentQuestion}
      sessionMessage={sessionMessage}
      sessionConfidence={sessionConfidence}
      onAnswer={handleAnswer}
    />
  );
  if (screen === 'result') return <Result result={result} onRetry={handleRetry} />;
  return null;
}
