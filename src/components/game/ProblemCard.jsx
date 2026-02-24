import { getOperationSymbol } from '../../services/problemService';
import './ProblemCard.css';

export default function ProblemCard({ problem }) {
  const symbol = getOperationSymbol(problem.operation);

  return (
    <div className={`problem-card ${problem.operation}-bg animate-fade-in`}>
      <div className="problem-text">
        {problem.a} {symbol} {problem.b} = ?
      </div>
    </div>
  );
}
