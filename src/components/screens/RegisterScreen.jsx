import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import appConfig from '../../config/appConfig';
import './LoginScreen.css';

// Firebase requires email + 6-char password.
// We auto-generate email from name and pad the PIN.
function nameToEmail(name) {
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '') || 'spieler';
  return `${slug}@rechenapp.local`;
}

function padPin(pin) {
  // Pad to 6 chars for Firebase minimum
  return (pin + '______').slice(0, Math.max(6, pin.length));
}

export default function RegisterScreen() {
  const [displayName, setDisplayName] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [avatar, setAvatar] = useState('🦊');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!displayName.trim()) {
      setError('Bitte gib einen Namen ein');
      return;
    }
    if (!pin) {
      setError('Bitte gib einen PIN ein');
      return;
    }
    if (pin !== pinConfirm) {
      setError('PINs stimmen nicht überein');
      return;
    }

    const email = nameToEmail(displayName);
    const password = padPin(pin);

    setLoading(true);
    try {
      await register(email, password, displayName.trim(), avatar);
      navigate('/');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Dieser Name ist schon vergeben. Wähle einen anderen!');
      } else {
        setError('Registrierung fehlgeschlagen: ' + (err.message || ''));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen login-screen">
      <div className="login-logo">
        <div className="login-emoji">📝</div>
        <h1>Registrieren</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          className="input-field"
          type="text"
          placeholder="Dein Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          autoComplete="off"
        />
        <input
          className="input-field"
          type="password"
          placeholder="PIN (z.B. 1234)"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          required
          autoComplete="new-password"
          inputMode="numeric"
        />
        <input
          className="input-field"
          type="password"
          placeholder="PIN wiederholen"
          value={pinConfirm}
          onChange={(e) => setPinConfirm(e.target.value)}
          required
          autoComplete="new-password"
          inputMode="numeric"
        />

        <div className="section-label">Wähle dein Avatar</div>
        <div className="avatar-grid">
          {appConfig.avatars.map((a) => (
            <button
              key={a}
              type="button"
              className={`avatar-option ${avatar === a ? 'selected' : ''}`}
              onClick={() => setAvatar(a)}
            >
              {a}
            </button>
          ))}
        </div>

        {error && <div className="error-msg">{error}</div>}
        <button className="big-btn primary" type="submit" disabled={loading}>
          {loading ? 'Wird erstellt...' : 'Konto erstellen 🎉'}
        </button>
      </form>

      <div className="link-text">
        Schon ein Konto?{' '}
        <a onClick={() => navigate('/login')}>Anmelden</a>
      </div>
    </div>
  );
}
