import { useState, useCallback } from 'react';
import { Entry } from './pages_v2/Entry.jsx';
import { FlowQuiz } from './pages_v2/FlowQuiz.jsx';
import { FlowResult } from './pages_v2/FlowResult.jsx';
import {
  createFlowSession,
  recordFlowAnswer,
  shouldFinish,
  getNextFlowQuestion,
} from './engine_v2/flowEngine.js';
import './App.css';

export default function App() {
  const [screen, setScreen] = useState('entry'); // 'entry' | 'quiz' | 'result'
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  const handleStart = useCallback(({ intent }) => {
    const sess = createFlowSession(intent);
    const first = getNextFlowQuestion(sess);
    setSession(sess);
    setCurrentQuestion(first);
    setScreen('quiz');
  }, []);

  const handleAnswer = useCallback((question, choice) => {
    if (!session) return;

    recordFlowAnswer(session, question, choice);

    if (shouldFinish(session)) {
      setSession({ ...session });
      setScreen('result');
      return;
    }

    const next = getNextFlowQuestion(session);
    if (next) {
      setCurrentQuestion(next);
      setSession({ ...session });
    } else {
      setSession({ ...session });
      setScreen('result');
    }
  }, [session]);

  const handleRetry = useCallback(() => {
    setSession(null);
    setCurrentQuestion(null);
    setScreen('entry');
  }, []);

  if (screen === 'entry') {
    return <Entry onStart={handleStart} />;
  }

  if (screen === 'quiz') {
    return (
      <FlowQuiz
        question={currentQuestion}
        questionNumber={session?.answeredCount + 1 ?? 1}
        onAnswer={handleAnswer}
      />
    );
  }

  if (screen === 'result') {
    return <FlowResult session={session} onRetry={handleRetry} />;
  }

  return null;
}
