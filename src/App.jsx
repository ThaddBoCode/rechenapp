import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ConfigProvider } from './contexts/ConfigContext';
import NavBar from './components/common/NavBar';
import LoginScreen from './components/screens/LoginScreen';
import RegisterScreen from './components/screens/RegisterScreen';
import HomeScreen from './components/screens/HomeScreen';
import PracticeScreen from './components/screens/PracticeScreen';
import TestScreen from './components/screens/TestScreen';
import ResultScreen from './components/screens/ResultScreen';
import HistoryScreen from './components/screens/HistoryScreen';
import RankingScreen from './components/screens/RankingScreen';
import RewardsScreen from './components/screens/RewardsScreen';
import SettingsScreen from './components/screens/SettingsScreen';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: '48px' }}>
        🧮
      </div>
    );
  }
  if (!user) return <Navigate to="/login" />;
  return children;
}

function AuthRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" />;
  return children;
}

const noNavRoutes = ['/login', '/register', '/test'];

function NavBarConditional() {
  const location = useLocation();
  const { user } = useAuth();
  if (!user) return null;
  if (noNavRoutes.some((r) => location.pathname.startsWith(r))) return null;
  return <NavBar />;
}

function AppRoutes() {
  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={<AuthRoute><LoginScreen /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><RegisterScreen /></AuthRoute>} />
        <Route path="/" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
        <Route path="/practice" element={<ProtectedRoute><PracticeScreen /></ProtectedRoute>} />
        <Route path="/test" element={<ProtectedRoute><TestScreen /></ProtectedRoute>} />
        <Route path="/result" element={<ProtectedRoute><ResultScreen /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HistoryScreen /></ProtectedRoute>} />
        <Route path="/ranking" element={<ProtectedRoute><RankingScreen /></ProtectedRoute>} />
        <Route path="/rewards" element={<ProtectedRoute><RewardsScreen /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsScreen /></ProtectedRoute>} />
      </Routes>
      <NavBarConditional />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <ConfigProvider>
            <AppRoutes />
          </ConfigProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
