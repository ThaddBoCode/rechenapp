import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './LoginScreen.css';

function nameToEmail(name) {
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '') || 'spieler';
  return `${slug}@rechenapp.local`;
}

function padPin(pin) {
  return (pin + '______').slice(0, Math.max(6, pin.length));
}

export default function LoginScreen() {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isDemo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const email = nameToEmail(name);
      const password = padPin(pin);
      await login(email, password);
      navigate('/');
    } catch (err) {
      if (err.code === 'auth/invalid-credential') {
        setError('Name oder PIN falsch');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Zu viele Versuche. Bitte warte kurz.');
      } else {
        setError('Anmeldung fehlgeschlagen');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    await login('demo@rechenapp.de', 'demo');
    navigate('/');
  };

  return (
    <div className="screen login-screen">
      <div className="login-logo">
        <div className="login-emoji">🧮</div>
        <h1>RechenApp</h1>
      </div>

      {isDemo && (
        <>
          <button className="big-btn accent" onClick={handleDemoLogin} disabled={loading}>
            Demo starten 🎮
          </button>
          <div className="demo-hint">
            Demo-Modus: Daten werden lokal gespeichert
          </div>
          <div className="divider"><span>oder</span></div>
        </>
      )}

      <form onSubmit={handleSubmit}>
        <input
          className="input-field"
          type="text"
          placeholder="Dein Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required={!isDemo}
          autoComplete="username"
        />
        <input
          className="input-field"
          type="password"
          placeholder="PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          required={!isDemo}
          autoComplete="current-password"
          inputMode="numeric"
        />
        {error && <div className="error-msg">{error}</div>}
        <button className="big-btn primary" type="submit" disabled={loading}>
          {loading ? 'Wird geladen...' : 'Anmelden 🚀'}
        </button>
      </form>

      <div className="link-text">
        Noch kein Konto?{' '}
        <a onClick={() => navigate('/register')}>Registrieren</a>
      </div>
    </div>
  );
}
