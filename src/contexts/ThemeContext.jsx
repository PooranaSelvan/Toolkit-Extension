import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isVsCodeWebview, postMessage, onMessage } from '../vscodeApi';

/**
 * Theme is now automatically detected from the VS Code editor theme.
 * - Light VS Code themes  → 'toolbox' (light)
 * - Dark VS Code themes   → 'toolbox-dark' (dark)
 * No manual theme selection is exposed to the user.
 *
 * FOUC prevention: The initial theme is set synchronously on <html> before React
 * hydrates, using the data-theme attribute in index.html. The ThemeProvider then
 * reconciles with the actual VS Code theme as soon as the extension host responds.
 */

const LIGHT_THEME = 'toolbox';
const DARK_THEME = 'toolbox-dark';

const ThemeContext = createContext(null);

/**
 * Determine the initial theme.
 * In VS Code webview: read the current data-theme from the document (set by index.html or prior render),
 * defaulting to dark if not set — most VS Code users use dark themes.
 * Outside VS Code: respect prefers-color-scheme.
 */
function getInitialTheme() {
  try {
    // If a data-theme is already set on the document, use it to avoid FOUC
    const existing = document.documentElement.getAttribute('data-theme');
    if (existing === LIGHT_THEME || existing === DARK_THEME) {
      return existing;
    }
  } catch { /* safe — SSR or test environment */ }

  if (isVsCodeWebview()) {
    return DARK_THEME; // Safe default; will be corrected immediately by extension host
  }
  // Browser fallback: use system preference
  try {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches) {
      return LIGHT_THEME;
    }
  } catch { /* matchMedia not available */ }
  return DARK_THEME;
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);

  // Memoized setter to avoid unnecessary re-renders
  const setTheme = useCallback((newTheme) => {
    if (newTheme !== LIGHT_THEME && newTheme !== DARK_THEME) return;
    setThemeState((prev) => (prev === newTheme ? prev : newTheme));
  }, []);

  // Apply theme to DOM whenever it changes — also set color-scheme for native elements
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.style.colorScheme = theme === DARK_THEME ? 'dark' : 'light';
    } catch { /* safe */ }
  }, [theme]);

  // VS Code theme detection: request theme on mount and listen for changes
  useEffect(() => {
    if (!isVsCodeWebview()) {
      // Browser fallback: listen for system color-scheme changes
      try {
        const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
        if (mq) {
          const handler = (e) => setTheme(e.matches ? DARK_THEME : LIGHT_THEME);
          mq.addEventListener('change', handler);
          return () => mq.removeEventListener('change', handler);
        }
      } catch { /* matchMedia not available */ }
      return;
    }

    // Request the current VS Code theme from the extension host
    try {
      postMessage({ type: 'getTheme' });
    } catch { /* safe — extension host may not be ready */ }

    // Listen for theme info messages from the extension host
    const cleanup = onMessage((message) => {
      if (message && message.type === 'themeInfo') {
        setTheme(message.isDark ? DARK_THEME : LIGHT_THEME);
      }
    });

    return cleanup;
  }, [setTheme]);

  const isDark = theme === DARK_THEME;

  return (
    <ThemeContext.Provider value={{ theme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Graceful fallback instead of throwing — prevents full app crash if used outside provider
    console.warn('[useTheme] Used outside ThemeProvider — returning fallback');
    return { theme: DARK_THEME, isDark: true };
  }
  return ctx;
}

export default ThemeContext;
