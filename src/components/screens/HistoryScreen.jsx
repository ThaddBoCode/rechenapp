import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getTestHistory } from '../../services/firestoreService';
import { getOperationEmoji } from '../../services/problemService';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import './HistoryScreen.css';

export default function HistoryScreen() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getTestHistory(user.uid, 20)
      .then((data) => setHistory(data))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [user]);

  const chartData = [...history]
    .reverse()
    .map((test) => ({
      date: test.timestamp?.toDate
        ? test.timestamp.toDate().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
        : '—',
      score: test.score || 0,
    }));

  if (loading) {
    return (
      <div className="screen animate-fade-in">
        <div className="header"><h1>📊 Meine Tests</h1></div>
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          Lade...
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="screen animate-fade-in">
        <div className="header"><h1>📊 Meine Tests</h1></div>
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Noch keine Tests abgeschlossen.
          </p>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '8px' }}>
            Starte einen Test, um Ergebnisse zu sammeln!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen animate-fade-in">
      <div className="header"><h1>📊 Meine Tests</h1></div>

      {chartData.length > 1 && (
        <div className="card history-chart">
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} width={30} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--color-nav-active)"
                strokeWidth={3}
                dot={{ r: 4, fill: 'var(--color-nav-active)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="section-label">Letzte Tests</div>
      <div className="history-list">
        {history.map((test) => (
          <div key={test.id} className="history-item">
            <div className="history-date">
              {test.timestamp?.toDate
                ? test.timestamp.toDate().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
                : '—'}
            </div>
            <div className="history-ops">
              {(test.operations || []).map((op) => (
                <span key={op}>{getOperationEmoji(op)} </span>
              ))}
            </div>
            <div className="history-score" style={{ color: 'var(--color-correct)' }}>
              {test.score || 0}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
