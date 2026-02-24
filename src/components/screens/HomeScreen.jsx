import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useConfig } from '../../contexts/ConfigContext';
import './HomeScreen.css';

const operationList = [
  { key: 'addition', emoji: '➕', label: 'Plus', cssClass: 'addition' },
  { key: 'subtraction', emoji: '➖', label: 'Minus', cssClass: 'subtraction' },
  { key: 'multiplication', emoji: '✖️', label: 'Mal', cssClass: 'multiplication' },
  { key: 'division', emoji: '➗', label: 'Geteilt', cssClass: 'division' },
];

export default function HomeScreen() {
  const { userProfile } = useAuth();
  const { config } = useConfig();
  const navigate = useNavigate();

  const [selectedOps, setSelectedOps] = useState(['addition', 'subtraction']);
  const [selectedTables, setSelectedTables] = useState(['small']);

  const toggleOp = (key) => {
    setSelectedOps((prev) => {
      if (prev.includes(key)) {
        if (prev.length === 1) return prev;
        return prev.filter((o) => o !== key);
      }
      return [...prev, key];
    });
  };

  const toggleTable = (key) => {
    setSelectedTables((prev) => {
      if (prev.includes(key)) {
        if (prev.length === 1) return prev;
        return prev.filter((t) => t !== key);
      }
      return [...prev, key];
    });
  };

  const startSession = (mode) => {
    const params = new URLSearchParams({
      ops: selectedOps.join(','),
      tables: selectedTables.join(','),
    });
    navigate(`/${mode}?${params}`);
  };

  return (
    <div className="screen animate-fade-in">
      <div className="header">
        <h1>Hallo, {userProfile?.displayName || 'Spieler'}! 👋</h1>
        <div className="avatar-display">{userProfile?.avatarEmoji || '🦊'}</div>
      </div>

      <div className="section-label">Was willst du üben?</div>
      <div className="op-grid">
        {operationList.map((op) => (
          <button
            key={op.key}
            className={`op-tile ${op.cssClass} ${selectedOps.includes(op.key) ? 'selected' : ''}`}
            onClick={() => toggleOp(op.key)}
          >
            {selectedOps.includes(op.key) && <span className="op-check">✓</span>}
            <span className="op-emoji">{op.emoji}</span>
          </button>
        ))}
      </div>

      <div className="section-label">Einmaleins</div>
      <div className="table-toggle">
        <button
          className={`table-btn ${selectedTables.includes('small') ? 'selected' : ''}`}
          onClick={() => toggleTable('small')}
        >
          Klein (1-10)
        </button>
        <button
          className={`table-btn ${selectedTables.includes('large') ? 'selected' : ''}`}
          onClick={() => toggleTable('large')}
        >
          Groß (11-20)
        </button>
      </div>

      <button className="big-btn primary" onClick={() => startSession('practice')}>
        Üben 📚
      </button>
      <button className="big-btn secondary" onClick={() => startSession('test')}>
        Test starten ⏱️
      </button>
    </div>
  );
}
