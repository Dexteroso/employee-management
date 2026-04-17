import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { darkTheme, lightTheme } from '../theme';

const STORAGE_KEY = 'employee-management-theme';

const ThemeContext = createContext({
  darkMode: false,
  theme: lightTheme,
  toggleTheme: () => {}
});

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem(STORAGE_KEY) === 'dark';
  });

  const theme = darkMode ? darkTheme : lightTheme;

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, darkMode ? 'dark' : 'light');

    const root = document.documentElement;
    const body = document.body;

    root.style.setProperty('--app-background', theme.background);
    root.style.setProperty('--app-surface', theme.surface);
    root.style.setProperty('--app-surface-muted', theme.surfaceMuted);
    root.style.setProperty('--app-sidebar-background', theme.sidebarBackground);
    root.style.setProperty('--app-sidebar-text', theme.sidebarText);
    root.style.setProperty('--app-sidebar-muted-text', theme.sidebarMutedText);
    root.style.setProperty('--app-text-primary', theme.textPrimary);
    root.style.setProperty('--app-text-secondary', theme.textSecondary);
    root.style.setProperty('--app-text-body', theme.textBody);
    root.style.setProperty('--app-border', theme.border);
    root.style.setProperty('--app-input-background', theme.inputBackground);
    root.style.setProperty('--app-input-text', theme.inputText);
    root.style.setProperty('--app-input-border', theme.inputBorder);
    root.style.setProperty('--app-input-disabled-background', theme.inputDisabledBackground);
    root.style.setProperty('--app-overlay-surface', theme.overlaySurface);
    root.style.setProperty('--app-shadow', theme.shadow);
    root.style.colorScheme = darkMode ? 'dark' : 'light';

    body.classList.toggle('theme-dark', darkMode);
    body.classList.toggle('theme-light', !darkMode);
  }, [darkMode, theme]);

  const value = useMemo(
    () => ({
      darkMode,
      theme,
      toggleTheme: () => setDarkMode((current) => !current)
    }),
    [darkMode, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
