import { useState, useCallback } from 'react';
import { Entry } from './pages_v2/Entry.jsx';
import { Quiz } from './pages_v2/Quiz.jsx';
import { Result } from './pages_v2/Result.jsx';
import { createSession } from './engine_v2/session.js';
import { applyAnswer, nextQuestion, buildResult } from './engine_v2/flowSelf.js';
import './App.css';

const TOTAL_ESTIMATE = 18;

export default function App() {
  const [screen, setScreen] = useState('entry'); // 'entry' | 'quiz' | 'result'
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [result, setResult] = useState(null);

  const handleStart = useCallback(({ intent, flow }) => {
    const sess = createSession(flow);
    sess.intent = intent;
    const first = nextQuestion(sess);
    setSession(sess);
    setCurrentQuestion(first);
    setScreen('quiz');
  }, []);

  const handleAnswer = useCallback((question, response) => {
    if (!session) return;

    applyAnswer(session, question, response);

    const next = nextQuestion(session);
    if (next) {
      setCurrentQuestion(next);
      setSession({ ...session });
    } else {
      const res = buildResult(session);
      setResult(res);
      setScreen('result');
    }
  }, [session]);

  const handleRetry = useCallback(() => {
    setSession(null);
    setCurrentQuestion(null);
    setResult(null);
    setScreen('entry');
  }, []);

  if (screen === 'entry') {
    return <Entry onStart={handleStart} />;
  }

  if (screen === 'quiz') {
    return (
      <Quiz
        question={currentQuestion}
        questionNumber={session?.questionCount ?? 0}
        totalEstimate={TOTAL_ESTIMATE}
        onAnswer={handleAnswer}
      />
    );
  }

  if (screen === 'result') {
    return <Result result={result} onRetry={handleRetry} />;
  }

  return null;
}
