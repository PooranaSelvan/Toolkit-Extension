import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const THEMES = [
  { id: 'toolbox', name: 'Toolbox', emoji: '🔧', category: 'Light' },
  { id: 'light', name: 'Light', emoji: '☀️', category: 'Light' },
  { id: 'cupcake', name: 'Cupcake', emoji: '🧁', category: 'Light' },
  { id: 'corporate', name: 'Corporate', emoji: '🏢', category: 'Light' },
  { id: 'garden', name: 'Garden', emoji: '🌷', category: 'Light' },
  { id: 'lofi', name: 'Lo-Fi', emoji: '🎵', category: 'Light' },
  { id: 'pastel', name: 'Pastel', emoji: '🎨', category: 'Light' },
  { id: 'fantasy', name: 'Fantasy', emoji: '🧚', category: 'Light' },
  { id: 'wireframe', name: 'Wireframe', emoji: '📐', category: 'Light' },
  { id: 'cmyk', name: 'CMYK', emoji: '🖨️', category: 'Light' },
  { id: 'autumn', name: 'Autumn', emoji: '🍂', category: 'Light' },
  { id: 'acid', name: 'Acid', emoji: '🧪', category: 'Light' },
  { id: 'lemonade', name: 'Lemonade', emoji: '🍋', category: 'Light' },
  { id: 'winter', name: 'Winter', emoji: '❄️', category: 'Light' },
  { id: 'nord', name: 'Nord', emoji: '🏔️', category: 'Light' },
  { id: 'retro', name: 'Retro', emoji: '📺', category: 'Light' },
  { id: 'valentine', name: 'Valentine', emoji: '💕', category: 'Light' },
  { id: 'aqua', name: 'Aqua', emoji: '💧', category: 'Light' },
  { id: 'cyberpunk', name: 'Cyberpunk', emoji: '🤖', category: 'Light' },
  { id: 'toolbox-dark', name: 'Toolbox Dark', emoji: '🔷', category: 'Dark' },
  { id: 'dark', name: 'Dark', emoji: '🌙', category: 'Dark' },
  { id: 'synthwave', name: 'Synthwave', emoji: '🌆', category: 'Dark' },
  { id: 'halloween', name: 'Halloween', emoji: '🎃', category: 'Dark' },
  { id: 'black', name: 'Black', emoji: '🖤', category: 'Dark' },
  { id: 'luxury', name: 'Luxury', emoji: '👑', category: 'Dark' },
  { id: 'dracula', name: 'Dracula', emoji: '🧛', category: 'Dark' },
  { id: 'business', name: 'Business', emoji: '💼', category: 'Dark' },
  { id: 'night', name: 'Night', emoji: '🌃', category: 'Dark' },
  { id: 'coffee', name: 'Coffee', emoji: '☕', category: 'Dark' },
  { id: 'dim', name: 'Dim', emoji: '🔅', category: 'Dark' },
  { id: 'sunset', name: 'Sunset', emoji: '🌅', category: 'Dark' },
];

const VALID_THEME_IDS = new Set(THEMES.map(t => t.id));

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem('devtoolbox-theme');
      // Only accept valid built-in theme IDs
      if (saved && VALID_THEME_IDS.has(saved)) return saved;
      return 'toolbox';
    } catch {
      return 'toolbox';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('devtoolbox-theme', theme);
    } catch {}
  }, [theme]);

  const setTheme = useCallback((newTheme) => {
    try {
      // Validate theme before applying
      if (newTheme && (VALID_THEME_IDS.has(newTheme) || typeof newTheme === 'string')) {
        setThemeState(newTheme);
      } else {
        console.warn(`[ThemeContext] Invalid theme: "${newTheme}", falling back to default.`);
        setThemeState('toolbox');
      }
    } catch (err) {
      console.error('[ThemeContext] Error setting theme:', err);
      setThemeState('toolbox');
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export { THEMES };
export default ThemeContext;
