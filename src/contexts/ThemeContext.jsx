import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getTheme, colorfulTheme } from '../themes';
import { useAuth } from './AuthContext';

const ThemeContext = createContext(null);

function applyThemeToCSS(theme) {
  const root = document.documentElement;
  const c = theme.colors;
  root.style.setProperty('--color-bg', c.background);
  root.style.setProperty('--color-card', c.cardBackground);
  root.style.setProperty('--color-text', c.textPrimary);
  root.style.setProperty('--color-text-secondary', c.textSecondary);
  root.style.setProperty('--color-correct', c.correct);
  root.style.setProperty('--color-wrong', c.wrong);
  root.style.setProperty('--color-star', c.star);
  root.style.setProperty('--color-nav-bg', c.navBackground);
  root.style.setProperty('--color-nav-active', c.navActive);
  root.style.setProperty('--font-family', theme.font);

  const ops = c.operations;
  Object.entries(ops).forEach(([op, colors]) => {
    root.style.setProperty(`--color-${op}`, colors.main);
    root.style.setProperty(`--color-${op}-light`, colors.light);
    root.style.setProperty(`--color-${op}-dark`, colors.dark);
  });
}

export function ThemeProvider({ children }) {
  const { userProfile, updateUserProfile } = useAuth();
  const [theme, setThemeState] = useState(colorfulTheme);

  useEffect(() => {
    if (userProfile?.theme) {
      const t = getTheme(userProfile.theme);
      setThemeState(t);
      applyThemeToCSS(t);
    }
  }, [userProfile?.theme]);

  const setTheme = useCallback(
    (themeId) => {
      const t = getTheme(themeId);
      setThemeState(t);
      applyThemeToCSS(t);
      updateUserProfile({ theme: themeId });
    },
    [updateUserProfile]
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
