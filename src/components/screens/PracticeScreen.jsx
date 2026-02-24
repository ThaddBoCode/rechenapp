import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useConfig } from '../../contexts/ConfigContext';
import useAdaptiveLearning from '../../hooks/useAdaptiveLearning';
import useProblemGenerator from '../../hooks/useProblemGenerator';
import ProblemCard from '../game/ProblemCard';
import AnswerGrid from '../game/AnswerGrid';
import ScoreDisplay from '../game/ScoreDisplay';
import FeedbackOverlay from '../common/FeedbackOverlay';
import './PracticeScreen.css';

export default function PracticeScreen() {
  const { config } = useConfig();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const ops = (searchParams.get('ops') || 'addition').split(',');
  const tables = (searchParams.get('tables') || 'small').split(',');

  const { learningData, loaded, recordAnswer, getForcedRepeatQueue, setForcedRepeatQueue } =
    useAdaptiveLearning();
  const { initPool, getNextProblem } = useProblemGenerator(config);

  const [problem, setProblem] = useState(null);
  const [choices, setChoices] = useState([]);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const answerStartTime = useRef(Date.now());
  const initialized = useRef(false);

  // Wait for learning data to load, then initialize pool and first problem
  useEffect(() => {
    if (!loaded || initialized.current) return;
    initialized.current = true;
    initPool(ops, tables);
    const result = getNextProblem(learningData, getForcedRepeatQueue());
    if (result) {
      setProblem(result.problem);
      setChoices(result.choices);
      setForcedRepeatQueue(result.updatedQueue);
      answerStartTime.current = Date.now();
    }
  }, [loaded]);

  const generateNext = () => {
    const result = getNextProblem(learningData, getForcedRepeatQueue());
    if (!result) return;
    setProblem(result.problem);
    setChoices(result.choices);
    setForcedRepeatQueue(result.updatedQueue);
    setSelectedAnswer(null);
    setFeedback(null);
    setDisabled(false);
    answerStartTime.current = Date.now();
  };

  const handleAnswer = (answer) => {
    if (disabled) return;
    setDisabled(true);
    setSelectedAnswer(answer);
    setTotalAnswered((t) => t + 1);

    const responseTime = Date.now() - answerStartTime.current;
    const isCorrect = answer === problem.correctAnswer;

    recordAnswer(problem, isCorrect, responseTime, config.adaptive);

    if (isCorrect) {
      setFeedback('correct');
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
      setTimeout(generateNext, config.gameplay.delayAfterCorrect);
    } else {
      setFeedback('wrong');
      setStreak(0);
      setWrongCount((w) => w + 1);
      setTimeout(generateNext, config.gameplay.delayAfterWrong);
    }
  };

  if (!loaded) {
    return (
      <div className="screen animate-fade-in" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
        <p>Lerndaten werden geladen...</p>
      </div>
    );
  }

  if (!problem) return null;

  return (
    <div className="screen practice-screen animate-fade-in">
      <div className="practice-header">
        <ScoreDisplay operation={problem.operation} score={score} />
        {streak >= 3 && (
          <div className="streak-badge animate-bounce-in">🔥 {streak}</div>
        )}
      </div>
      <ProblemCard problem={problem} />
      <AnswerGrid
        choices={choices}
        correctAnswer={problem.correctAnswer}
        selectedAnswer={selectedAnswer}
        feedback={feedback}
        onAnswer={handleAnswer}
        disabled={disabled}
      />
      <FeedbackOverlay type={feedback} />
    </div>
  );
}
