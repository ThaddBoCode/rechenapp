import { useNavigate, useLocation } from 'react-router-dom';
import './NavBar.css';

const navItems = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/history', icon: '📊', label: 'History' },
  { path: '/ranking', icon: '🏆', label: 'Ranking' },
  { path: '/rewards', icon: '🎁', label: 'Rewards' },
  { path: '/settings', icon: '⚙️', label: 'Settings' },
];

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="navbar">
      {navItems.map((item) => (
        <button
          key={item.path}
          className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
