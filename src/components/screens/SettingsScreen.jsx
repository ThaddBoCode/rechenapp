import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useConfig } from '../../contexts/ConfigContext';
import { useTheme } from '../../contexts/ThemeContext';
import { themeList } from '../../themes';
import './SettingsScreen.css';

const operationLabels = {
  addition: 'Plus',
  subtraction: 'Minus',
  multiplication: 'Mal',
  division: 'Geteilt',
};

const excludableNumbers = [0, 1, 2, 3, 4, 5];

export default function SettingsScreen() {
  const { logout } = useAuth();
  const { config, updateConfig, resetConfig } = useConfig();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleExcludedNumber = (operation, num) => {
    const current = config.excludedNumbers?.[operation] || [];
    const next = current.includes(num)
      ? current.filter((n) => n !== num)
      : [...current, num].sort((a, b) => a - b);
    updateConfig(`excludedNumbers.${operation}`, next);
  };

  return (
    <div className="screen animate-fade-in">
      <div className="header">
        <h1>⚙️ Einstellungen</h1>
      </div>

      <div className="setting-row">
        <div className="setting-label">Theme</div>
        <div className="theme-grid">
          {themeList.map((t) => (
            <button
              key={t.id}
              className={`theme-btn ${theme.id === t.id ? 'selected' : ''}`}
              onClick={() => setTheme(t.id)}
              style={{
                background: t.colors.background,
                color: t.colors.textPrimary,
                borderColor: theme.id === t.id ? t.colors.navActive : '#DDD',
              }}
            >
              <span>{t.emoji}</span>
              <span className="theme-name">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="setting-row">
        <div className="setting-label">Zahlen ausschließen</div>
        <div className="setting-hint">Welche Zahlen sollen bei welcher Rechenart nicht vorkommen?</div>
        {Object.entries(operationLabels).map(([op, label]) => {
          const excluded = config.excludedNumbers?.[op] || [];
          return (
            <div key={op} className="exclude-row">
              <div className="exclude-op-label">{label}</div>
              <div className="exclude-chips">
                {excludableNumbers.map((num) => (
                  <button
                    key={num}
                    className={`exclude-chip ${excluded.includes(num) ? 'active' : ''}`}
                    onClick={() => toggleExcludedNumber(op, num)}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="setting-row">
        <div className="setting-label">Anzahl Antworten</div>
        <div className="stepper">
          <button
            className="stepper-btn"
            onClick={() => updateConfig('gameplay.numberOfChoices', Math.max(3, config.gameplay.numberOfChoices - 1))}
          >−</button>
          <div className="stepper-val">{config.gameplay.numberOfChoices}</div>
          <button
            className="stepper-btn"
            onClick={() => updateConfig('gameplay.numberOfChoices', Math.min(6, config.gameplay.numberOfChoices + 1))}
          >+</button>
        </div>
      </div>

      <div className="setting-row">
        <div className="setting-label">Pause nach richtiger Antwort</div>
        <div className="setting-value">{(config.gameplay.delayAfterCorrect / 1000).toFixed(1)}s</div>
        <input
          type="range"
          className="setting-slider"
          min="500"
          max="3000"
          step="100"
          value={config.gameplay.delayAfterCorrect}
          onChange={(e) => updateConfig('gameplay.delayAfterCorrect', parseInt(e.target.value))}
        />
      </div>

      <div className="setting-row">
        <div className="setting-label">Pause nach falscher Antwort</div>
        <div className="setting-value">{(config.gameplay.delayAfterWrong / 1000).toFixed(1)}s</div>
        <input
          type="range"
          className="setting-slider"
          min="1000"
          max="5000"
          step="100"
          value={config.gameplay.delayAfterWrong}
          onChange={(e) => updateConfig('gameplay.delayAfterWrong', parseInt(e.target.value))}
        />
      </div>

      <div className="setting-row">
        <div className="setting-label">Testdauer</div>
        <div className="setting-value">{config.gameplay.testDuration}s</div>
        <input
          type="range"
          className="setting-slider"
          min="30"
          max="120"
          step="5"
          value={config.gameplay.testDuration}
          onChange={(e) => updateConfig('gameplay.testDuration', parseInt(e.target.value))}
        />
      </div>

      <button className="big-btn outline" onClick={resetConfig}>
        Einstellungen zurücksetzen 🔄
      </button>
      <button className="big-btn danger" onClick={handleLogout}>
        Abmelden 👋
      </button>
    </div>
  );
}
