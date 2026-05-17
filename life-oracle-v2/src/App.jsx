import { useState, useCallback } from 'react';
import { Entry }  from './pages_v2/Entry.jsx';
import { Quiz }   from './pages_v2/Quiz.jsx';
import { Result } from './pages_v2/Result.jsx';
import {
  createSession,
  recordAnswer,
  shouldFinish,
  getNextQuestion,
  buildResult,
} from './engine_v2/situationEngine.js';
import { ALL_QUESTIONS } from './data_v2/questions/index.js';
import './App.css';

export default function App() {
  const [screen, setScreen]               = useState('entry');
  const [session, setSession]             = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [result, setResult]               = useState(null);

  const handleStart = useCallback(({ intent }) => {
    const sess = createSession(intent);
    const first = getNextQuestion(sess, ALL_QUESTIONS);
    setSession(sess);
    setCurrentQuestion(first);
    setScreen('quiz');
  }, []);

  const handleAnswer = useCallback((question, choice) => {
    if (!session) return;
    recordAnswer(session, question, choice);

    if (shouldFinish(session)) {
      setResult(buildResult(session));
      setSession({ ...session });
      setScreen('result');
      return;
    }

    const next = getNextQuestion(session, ALL_QUESTIONS);
    setCurrentQuestion(next ?? null);
    setSession({ ...session });

    if (!next) {
      setResult(buildResult(session));
      setScreen('result');
    }
  }, [session]);

  const handleRetry = useCallback(() => {
    setSession(null);
    setCurrentQuestion(null);
    setResult(null);
    setScreen('entry');
  }, []);

  if (screen === 'entry')  return <Entry onStart={handleStart} />;
  if (screen === 'quiz')   return (
    <Quiz
      question={currentQuestion}
      questionNumber={(session?.questionCount ?? 0) + 1}
      onAnswer={handleAnswer}
    />
  );
  if (screen === 'result') return <Result result={result} onRetry={handleRetry} />;
  return null;
}
