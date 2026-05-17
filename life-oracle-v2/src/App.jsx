import { useState, useCallback } from 'react';
import { Entry } from './pages_v2/Entry.jsx';
import { SelfIntent } from './pages_v2/SelfIntent.jsx';
import { Quiz } from './pages_v2/Quiz.jsx';
import { Result } from './pages_v2/Result.jsx';
import { createSession } from './engine_v2/session.js';
import { applyAnswer, nextQuestion, buildResult } from './engine_v2/flowSelf.js';
import './App.css';

export default function App() {
  const [screen, setScreen] = useState('entry'); // 'entry' | 'subintent' | 'quiz' | 'result'
  const [intent, setIntent] = useState(null);
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [result, setResult] = useState(null);

  const handleStart = useCallback(({ intent: selectedIntent, flow }) => {
    setIntent(selectedIntent);
    setScreen('subintent');
  }, []);

  const handleSubIntent = useCallback((opt) => {
    const sess = createSession('self');
    sess.intent = intent;
    sess.subIntent = opt.key;
    sess.axisPriority = opt.axisPriority;
    sess.anglePriority = opt.anglePriority;
    const first = nextQuestion(sess);
    setSession(sess);
    setCurrentQuestion(first);
    setScreen('quiz');
  }, [intent]);

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
    setIntent(null);
    setScreen('entry');
  }, []);

  if (screen === 'entry') {
    return <Entry onStart={handleStart} />;
  }

  if (screen === 'subintent') {
    return <SelfIntent intent={intent} onSelect={handleSubIntent} />;
  }

  if (screen === 'quiz') {
    return (
      <Quiz
        question={currentQuestion}
        questionNumber={session?.questionCount ?? 0}
        onAnswer={handleAnswer}
      />
    );
  }

  if (screen === 'result') {
    return <Result result={result} onRetry={handleRetry} />;
  }

  return null;
}
