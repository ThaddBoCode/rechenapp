import './AnswerGrid.css';

export default function AnswerGrid({
  choices,
  correctAnswer,
  selectedAnswer,
  feedback,
  onAnswer,
  disabled,
}) {
  const getButtonClass = (choice) => {
    if (feedback === null) return '';
    if (choice === selectedAnswer && feedback === 'correct') return 'correct';
    if (choice === selectedAnswer && feedback === 'wrong') return 'wrong';
    if (feedback === 'wrong' && choice === correctAnswer) return 'show-correct';
    return '';
  };

  return (
    <div className="answer-grid">
      {choices.map((choice, i) => (
        <button
          key={`${choice}-${i}`}
          className={`answer-btn ${getButtonClass(choice)}`}
          onClick={() => onAnswer(choice)}
          disabled={disabled}
        >
          {choice}
        </button>
      ))}
    </div>
  );
}
