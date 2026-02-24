import { useSearchParams, useNavigate } from 'react-router-dom';
import './ResultScreen.css';

export default function ResultScreen() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const score = parseInt(searchParams.get('score') || '0');
  const total = parseInt(searchParams.get('total') || '0');
  const wrong = parseInt(searchParams.get('wrong') || '0');
  const ops = searchParams.get('ops') || 'addition';
  const tables = searchParams.get('tables') || 'small';
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;
  const rewardsParam = searchParams.get('rewards');
  const newRewards = rewardsParam ? rewardsParam.split('|') : [];

  const handleRetry = () => {
    const params = new URLSearchParams({ ops, tables });
    navigate(`/test?${params}`);
  };

  return (
    <div className="screen result-screen animate-slide-up">
      <div className="result-title">⭐ Ergebnis ⭐</div>
      <div className="result-card">
        <div className="result-emoji">🎉</div>
        <div className="result-score">{score}</div>
        <div className="result-label">richtige Antworten</div>

        <div className="result-stats">
          <div className="stat-box">
            <div className="stat-value">{total}</div>
            <div className="stat-label">Aufgaben</div>
          </div>
          <div className="stat-box">
            <div className="stat-value" style={{ color: 'var(--color-correct)' }}>{percent}%</div>
            <div className="stat-label">Quote</div>
          </div>
          <div className="stat-box">
            <div className="stat-value" style={{ color: 'var(--color-correct)' }}>{score}</div>
            <div className="stat-label">Richtig</div>
          </div>
          <div className="stat-box">
            <div className="stat-value" style={{ color: 'var(--color-wrong)' }}>{wrong}</div>
            <div className="stat-label">Falsch</div>
          </div>
        </div>
      </div>

      {newRewards.length > 0 && (
        <div className="reward-unlock-banner animate-bounce-in">
          <div className="reward-unlock-icon">🎬</div>
          <div className="reward-unlock-text">
            <strong>Neue Belohnung freigeschaltet!</strong>
            {newRewards.map((title, i) => (
              <div key={i}>{title}</div>
            ))}
          </div>
          <button className="big-btn accent" onClick={() => navigate('/rewards')} style={{ marginTop: '8px' }}>
            Video anschauen 🎥
          </button>
        </div>
      )}

      <button className="big-btn primary" onClick={handleRetry}>
        Nochmal! 🔄
      </button>
      <button className="big-btn outline" onClick={() => navigate('/')}>
        Zur Startseite 🏠
      </button>
    </div>
  );
}
