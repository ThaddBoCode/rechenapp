import { getOperationEmoji, getOperationLabel } from '../../services/problemService';
import './ScoreDisplay.css';

export default function ScoreDisplay({ operation, score }) {
  return (
    <div className="score-bar">
      <div className={`score-badge op-${operation}`}>
        <span className="score-icon">{getOperationEmoji(operation)}</span>
        <span>{getOperationLabel(operation)}</span>
      </div>
      <div className="score-badge">
        <span className="score-icon">✅</span>
        <span>{score}</span>
      </div>
    </div>
  );
}
