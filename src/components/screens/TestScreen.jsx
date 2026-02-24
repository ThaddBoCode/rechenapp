import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useConfig } from '../../contexts/ConfigContext';
import { useAuth } from '../../contexts/AuthContext';
import { generateProblem, generateChoices } from '../../services/problemService';
import { saveTestResult, updateRanking } from '../../services/firestoreService';
import { checkAndUnlockRewards } from '../../services/rewardService';
import ProblemCard from '../game/ProblemCard';
import AnswerGrid from '../game/AnswerGrid';
import FeedbackOverlay from '../common/FeedbackOverlay';
import './TestScreen.css';

export default function TestScreen() {
  const { config } = useConfig();
  const { user, userProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const ops = (searchParams.get('ops') || 'addition').split(',');
  const tables = (searchParams.get('tables') || 'small').split(',');

  const [timeLeft, setTimeLeft] = useState(config.gameplay.testDuration);
  const [problem, setProblem] = useState(null);
  const [choices, setChoices] = useState([]);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef(null);
  const problemsLog = useRef([]);

  const generateNext = useCallback(() => {
    const op = ops[Math.floor(Math.random() * ops.length)];
    const table = tables[Math.floor(Math.random() * tables.length)];
    const range = table === 'large' ? config.numberRanges.largeTable : config.numberRanges.smallTable;
    const excluded = config.excludedNumbers?.[op] || [];
    const p = generateProblem(op, range, excluded);
    const c = generateChoices(p.correctAnswer, config.gameplay.numberOfChoices, config.distractors);
    setProblem(p);
    setChoices(c);
    setSelectedAnswer(null);
    setFeedback(null);
    setDisabled(false);
  }, [ops, tables, config]);

  useEffect(() => {
    generateNext();
    setStarted(true);
  }, []);

  useEffect(() => {
    if (!started) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started]);

  useEffect(() => {
    if (timeLeft === 0 && started && !finished) {
      setFinished(true);
      saveResults();
    }
  }, [timeLeft, started, finished]);

  const saveResults = async () => {
    const testResult = {
      operations: ops,
      tableType: tables.join(','),
      totalProblems: totalAnswered,
      correctCount: score,
      wrongCount: wrongCount,
      score: score,
    };

    let newRewards = [];

    if (user) {
      try {
        await saveTestResult(user.uid, testResult);
        await updateRanking(user.uid, {
          displayName: userProfile?.displayName || 'Spieler',
          avatarEmoji: userProfile?.avatarEmoji || '🦊',
          bestScore: score,
          totalTests: 1,
        });
        newRewards = await checkAndUnlockRewards(user.uid, testResult);
      } catch (err) {
        console.warn('Could not save test result:', err);
      }
    }

    const params = new URLSearchParams({
      score: score.toString(),
      total: totalAnswered.toString(),
      wrong: wrongCount.toString(),
      ops: ops.join(','),
      tables: tables.join(','),
    });
    if (newRewards.length > 0) {
      params.set('rewards', newRewards.map((r) => r.title).join('|'));
    }
    navigate(`/result?${params}`);
  };

  const handleAnswer = (answer) => {
    if (disabled || timeLeft === 0) return;
    setDisabled(true);
    setSelectedAnswer(answer);
    setTotalAnswered((t) => t + 1);

    const isCorrect = answer === problem.correctAnswer;
    problemsLog.current.push({
      a: problem.a,
      b: problem.b,
      op: problem.operation,
      correctAnswer: problem.correctAnswer,
      givenAnswer: answer,
      correct: isCorrect,
    });

    if (isCorrect) {
      setFeedback('correct');
      setScore((s) => s + 1);
      setTimeout(generateNext, Math.min(config.gameplay.delayAfterCorrect, 600));
    } else {
      setFeedback('wrong');
      setWrongCount((w) => w + 1);
      setTimeout(generateNext, Math.min(config.gameplay.delayAfterWrong, 1200));
    }
  };

  const progressPercent = (timeLeft / config.gameplay.testDuration) * 100;
  const progressColor = timeLeft > 20 ? 'green' : timeLeft > 10 ? 'orange' : 'red';

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (!problem) return null;

  return (
    <div className="screen test-screen">
      <div className="test-header">
        <div className="timer">⏱️ {formatTime(timeLeft)}</div>
        <div className="test-score">✅ {score}</div>
      </div>
      <div className="progress-container">
        <div
          className={`progress-bar ${progressColor}`}
          style={{ width: `${progressPercent}%` }}
        />
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
