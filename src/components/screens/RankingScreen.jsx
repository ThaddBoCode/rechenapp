import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getRankings } from '../../services/firestoreService';
import './RankingScreen.css';

const medals = ['🥇', '🥈', '🥉'];

export default function RankingScreen() {
  const { user } = useAuth();
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRankings(20)
      .then((data) => setRankings(data))
      .catch(() => setRankings([]))
      .finally(() => setLoading(false));
  }, []);

  const myRank = rankings.findIndex((r) => r.userId === user?.uid);

  if (loading) {
    return (
      <div className="screen animate-fade-in">
        <div className="header"><h1>🏆 Bestenliste</h1></div>
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          Lade...
        </div>
      </div>
    );
  }

  if (rankings.length === 0) {
    return (
      <div className="screen animate-fade-in">
        <div className="header"><h1>🏆 Bestenliste</h1></div>
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏆</div>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Noch keine Einträge in der Bestenliste.
          </p>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '8px' }}>
            Schließe Tests ab, um hier zu erscheinen!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen animate-fade-in">
      <div className="header"><h1>🏆 Bestenliste</h1></div>

      <div className="ranking-list">
        {rankings.map((entry, index) => (
          <div
            key={entry.userId}
            className={`ranking-item ${entry.userId === user?.uid ? 'me' : ''}`}
          >
            <div className="ranking-pos">
              {index < 3 ? medals[index] : index + 1}
            </div>
            <div className="ranking-avatar">{entry.avatarEmoji || '🦊'}</div>
            <div className="ranking-name">{entry.displayName || 'Spieler'}</div>
            <div className="ranking-score">{entry.bestScore || 0}</div>
          </div>
        ))}
      </div>

      {myRank >= 0 && (
        <div className="my-rank-card">
          <div className="my-rank-label">Dein Platz</div>
          <div className="my-rank-value">
            {rankings[myRank]?.avatarEmoji || '🦊'} #{myRank + 1} — {rankings[myRank]?.bestScore || 0} Punkte
          </div>
        </div>
      )}
    </div>
  );
}
