import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { isVsCodeWebview, postMessage, onMessage } from '../vscodeApi';

/**
 * Theme is now automatically detected from the VS Code editor theme.
 * When running inside VS Code, we use the actual VS Code theme colors
 * (injected as --vscode-* CSS variables) to derive our DaisyUI theme,
 * so the extension matches the exact theme the user has active — whether
 * it's Dracula, Monokai, Solarized, GitHub Dark, One Dark Pro, etc.
 *
 * Outside VS Code (browser): falls back to toolbox (light) / toolbox-dark.
 */

const VSCODE_THEME = 'vscode';
const LIGHT_THEME = 'toolbox';
const DARK_THEME = 'toolbox-dark';

const ThemeContext = createContext(null);

/**
 * Parse a CSS color string (hex, rgb, rgba) into [r, g, b] (0–255).
 */
function parseColor(str) {
  if (!str) return null;
  str = str.trim();
  // hex
  if (str.startsWith('#')) {
    let hex = str.slice(1);
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    const n = parseInt(hex, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  // rgb/rgba
  const m = str.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
  if (m) return [Math.round(+m[1]), Math.round(+m[2]), Math.round(+m[3])];
  return null;
}

/**
 * Convert sRGB [0–255] to OKLCH string.
 * Uses the linear sRGB → OKLab → OKLCH pipeline.
 */
function rgbToOklch(r, g, b) {
  // sRGB → linear sRGB
  const srgbToLinear = (c) => {
    c = c / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  // linear sRGB → LMS (via OKLab matrix)
  const l_ = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m_ = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s_ = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l1 = Math.cbrt(l_);
  const m1 = Math.cbrt(m_);
  const s1 = Math.cbrt(s_);

  // OKLab
  const L = 0.2104542553 * l1 + 0.7936177850 * m1 - 0.0040720468 * s1;
  const A = 1.9779984951 * l1 - 2.4285922050 * m1 + 0.4505937099 * s1;
  const B = 0.0259040371 * l1 + 0.7827717662 * m1 - 0.8086757660 * s1;

  // OKLab → OKLCH
  const C = Math.sqrt(A * A + B * B);
  let H = Math.atan2(B, A) * (180 / Math.PI);
  if (H < 0) H += 360;

  // Format: oklch(L% C H)
  return `oklch(${(L * 100).toFixed(1)}% ${C.toFixed(3)} ${H.toFixed(0)})`;
}

/**
 * Get relative luminance of an RGB color (0–1 scale).
 */
function luminance(r, g, b) {
  const toLinear = (c) => {
    c = c / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Choose contrasting content color (white or near-black) for a given background.
 */
function contrastContent(bgRgb, isDark) {
  if (!bgRgb) return isDark ? 'oklch(95% 0 0)' : 'oklch(20% 0 0)';
  const lum = luminance(...bgRgb);
  return lum > 0.4 ? 'oklch(20% 0.02 264)' : 'oklch(98% 0 0)';
}

/**
 * Lighten or darken an RGB color by a factor.
 * factor > 1 = lighten, factor < 1 = darken.
 */
function adjustBrightness([r, g, b], factor) {
  if (factor > 1) {
    // Lighten: mix toward white
    const t = factor - 1;
    return [
      Math.min(255, Math.round(r + (255 - r) * t)),
      Math.min(255, Math.round(g + (255 - g) * t)),
      Math.min(255, Math.round(b + (255 - b) * t)),
    ];
  }
  // Darken: multiply
  return [
    Math.max(0, Math.round(r * factor)),
    Math.max(0, Math.round(g * factor)),
    Math.max(0, Math.round(b * factor)),
  ];
}

/**
 * Read a VS Code CSS variable from the document body (where VS Code injects them).
 */
function getVscodeVar(name) {
  try {
    return getComputedStyle(document.body).getPropertyValue(name).trim() || null;
  } catch {
    return null;
  }
}

/**
 * Compute contrast ratio between two RGB colors (WCAG formula).
 * Returns a value between 1 and 21.
 */
function contrastRatio(rgb1, rgb2) {
  const l1 = luminance(...rgb1) + 0.05;
  const l2 = luminance(...rgb2) + 0.05;
  return l1 > l2 ? l1 / l2 : l2 / l1;
}

/**
 * Ensure base-content has enough contrast against base-100 (the main bg).
 * If the VS Code foreground color lacks sufficient contrast, boost it.
 * Targets WCAG AA (4.5:1 for normal text).
 */
function ensureContentContrast(fgRgb, bgRgb, isDark) {
  const ratio = contrastRatio(fgRgb, bgRgb);
  if (ratio >= 4.5) return fgRgb; // Already good contrast

  // Iteratively push the fg toward white (dark theme) or black (light theme)
  let adjusted = [...fgRgb];
  for (let i = 0; i < 20; i++) {
    if (isDark) {
      adjusted = adjustBrightness(adjusted, 1.15);
    } else {
      adjusted = adjustBrightness(adjusted, 0.85);
    }
    if (contrastRatio(adjusted, bgRgb) >= 4.5) break;
  }
  return adjusted;
}

/**
 * Ensure base-200 and base-300 are visually distinguishable from base-100.
 * Many VS Code themes have sidebar/activity bar colors very close to the editor bg,
 * which makes surfaces indistinguishable. This forces a minimum step.
 */
function ensureSurfaceStep(surfaceRgb, bgRgb, isDark, minStep = 8) {
  const diff = Math.abs(luminance(...surfaceRgb) - luminance(...bgRgb));
  if (diff >= 0.02) return surfaceRgb; // Enough visual difference

  // Force a shift
  return adjustBrightness(bgRgb, isDark ? 1.0 + (minStep / 100) * 2 : 1.0 - (minStep / 100));
}

/**
 * Generate DaisyUI theme CSS variables from VS Code's injected --vscode-* CSS variables.
 * This maps the actual VS Code theme colors to our DaisyUI theme system.
 *
 * Key improvements over the original:
 * - Ensures base-content always meets WCAG AA contrast (4.5:1) against base-100
 * - Ensures base-200 / base-300 are visually distinct from base-100
 * - Reads additional VS Code variables for better foreground color mapping
 */
function generateVscodeThemeVars() {
  // Read key VS Code theme colors
  const editorBg = getVscodeVar('--vscode-editor-background');
  const editorFg = getVscodeVar('--vscode-editor-foreground');
  const sidebarBg = getVscodeVar('--vscode-sideBar-background');
  const activityBarBg = getVscodeVar('--vscode-activityBar-background');
  const buttonBg = getVscodeVar('--vscode-button-background');
  const buttonFg = getVscodeVar('--vscode-button-foreground');
  const linkFg = getVscodeVar('--vscode-textLink-foreground');
  const errorFg = getVscodeVar('--vscode-errorForeground');
  const terminalGreen = getVscodeVar('--vscode-terminal-ansiGreen');
  const terminalYellow = getVscodeVar('--vscode-terminal-ansiYellow');
  const terminalBlue = getVscodeVar('--vscode-terminal-ansiBlue');
  const badgeBg = getVscodeVar('--vscode-badge-background');
  // Parse colors
  const bgRgb = parseColor(editorBg);
  const fgRgb = parseColor(editorFg);
  const sidebarRgb = parseColor(sidebarBg);
  const activityRgb = parseColor(activityBarBg);
  const btnRgb = parseColor(buttonBg);
  const btnFgRgb = parseColor(buttonFg);
  const linkRgb = parseColor(linkFg);
  const errorRgb = parseColor(errorFg);
  const greenRgb = parseColor(terminalGreen);
  const yellowRgb = parseColor(terminalYellow);
  const blueRgb = parseColor(terminalBlue);
  const badgeRgb = parseColor(badgeBg);

  if (!bgRgb || !fgRgb) return null; // Can't generate without basics

  const isDark = luminance(...bgRgb) < 0.2;

  // ── Map to DaisyUI theme variables ──
  // base-100: main background (editor background)
  // base-200: slightly offset (sidebar or between bg and 300) — ensured distinguishable
  // base-300: borders/dividers — ensured distinguishable from base-200
  // base-content: primary text — ensured WCAG AA contrast against base-100
  const base100 = rgbToOklch(...bgRgb);

  const raw200 = sidebarRgb || adjustBrightness(bgRgb, isDark ? 1.15 : 0.97);
  const safe200 = ensureSurfaceStep(raw200, bgRgb, isDark, 8);
  const base200 = rgbToOklch(...safe200);

  const raw300 = activityRgb || adjustBrightness(bgRgb, isDark ? 1.35 : 0.90);
  const safe300 = ensureSurfaceStep(raw300, safe200, isDark, 10);
  const base300 = rgbToOklch(...safe300);

  // Ensure foreground text has enough contrast against the background
  const safeFgRgb = ensureContentContrast(fgRgb, bgRgb, isDark);
  const baseContent = rgbToOklch(...safeFgRgb);

  // primary: button background or link color (the "accent" color of the VS Code theme)
  const primaryRgb = btnRgb || linkRgb || badgeRgb || [45, 121, 255];
  const primary = rgbToOklch(...primaryRgb);
  const primaryContent = btnFgRgb ? rgbToOklch(...btnFgRgb) : contrastContent(primaryRgb, isDark);

  // secondary: link color or a hue-shifted variant of primary
  const secondaryRgb = linkRgb && linkRgb !== btnRgb ? linkRgb : adjustBrightness(primaryRgb, isDark ? 1.2 : 0.85);
  const secondary = rgbToOklch(...secondaryRgb);
  const secondaryContent = contrastContent(secondaryRgb, isDark);

  // accent: badge background or a lighter variant
  const accentRgb = badgeRgb || adjustBrightness(primaryRgb, isDark ? 1.3 : 0.7);
  const accent = rgbToOklch(...accentRgb);
  const accentContent = contrastContent(accentRgb, isDark);

  // neutral: darker surface for contrast elements
  const neutralRgb = activityRgb || adjustBrightness(bgRgb, isDark ? 0.7 : 0.3);
  const neutral = rgbToOklch(...neutralRgb);
  const neutralContent = contrastContent(neutralRgb, isDark);

  // info: blue terminal color or link foreground
  const infoRgb = blueRgb || linkRgb || [59, 130, 246];
  const info = rgbToOklch(...infoRgb);
  const infoContent = contrastContent(infoRgb, isDark);

  // success: green terminal color
  const successRgb = greenRgb || [34, 197, 94];
  const success = rgbToOklch(...successRgb);
  const successContent = contrastContent(successRgb, isDark);

  // warning: yellow terminal color
  const warningRgb = yellowRgb || [234, 179, 8];
  const warning = rgbToOklch(...warningRgb);
  const warningContent = contrastContent(warningRgb, isDark);

  // error: error foreground color
  const errRgb = errorRgb || [239, 68, 68];
  const error = rgbToOklch(...errRgb);
  const errorContent = contrastContent(errRgb, isDark);

  return {
    isDark,
    vars: {
      '--color-base-100': base100,
      '--color-base-200': base200,
      '--color-base-300': base300,
      '--color-base-content': baseContent,
      '--color-primary': primary,
      '--color-primary-content': primaryContent,
      '--color-secondary': secondary,
      '--color-secondary-content': secondaryContent,
      '--color-accent': accent,
      '--color-accent-content': accentContent,
      '--color-neutral': neutral,
      '--color-neutral-content': neutralContent,
      '--color-info': info,
      '--color-info-content': infoContent,
      '--color-success': success,
      '--color-success-content': successContent,
      '--color-warning': warning,
      '--color-warning-content': warningContent,
      '--color-error': error,
      '--color-error-content': errorContent,
    },
  };
}

/**
 * Apply the generated VS Code theme variables to the document.
 */
function applyVscodeTheme() {
  const result = generateVscodeThemeVars();
  if (!result) return null;

  const root = document.documentElement;
  root.setAttribute('data-theme', VSCODE_THEME);
  root.style.colorScheme = result.isDark ? 'dark' : 'light';

  // Apply each CSS variable to the root element
  for (const [prop, value] of Object.entries(result.vars)) {
    root.style.setProperty(prop, value);
  }

  return result.isDark;
}

/**
 * Determine the initial theme.
 * In VS Code webview: use vscode theme (will be populated once CSS vars are available).
 * Outside VS Code: respect prefers-color-scheme.
 */
function getInitialTheme() {
  if (isVsCodeWebview()) {
    return VSCODE_THEME;
  }

  try {
    const existing = document.documentElement.getAttribute('data-theme');
    if (existing === LIGHT_THEME || existing === DARK_THEME) {
      return existing;
    }
  } catch { /* safe — SSR or test environment */ }

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
  const [isDark, setIsDark] = useState(() => {
    if (isVsCodeWebview()) return true; // Safe default; corrected immediately
    return getInitialTheme() === DARK_THEME;
  });
  const themeAppliedRef = useRef(false);

  // Memoized setter for non-vscode themes
  const setTheme = useCallback((newTheme) => {
    const valid = [LIGHT_THEME, DARK_THEME, VSCODE_THEME];
    if (!valid.includes(newTheme)) return;
    setThemeState((prev) => (prev === newTheme ? prev : newTheme));
  }, []);

  // Apply theme to DOM whenever it changes (for non-vscode themes)
  useEffect(() => {
    if (theme === VSCODE_THEME) return; // VS Code theme handled separately
    try {
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.style.colorScheme = theme === DARK_THEME ? 'dark' : 'light';
      setIsDark(theme === DARK_THEME);
    } catch { /* safe */ }
  }, [theme]);

  // VS Code theme detection and application
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

    // Apply VS Code theme immediately (CSS vars are already injected by VS Code)
    const applyTheme = () => {
      const dark = applyVscodeTheme();
      if (dark !== null) {
        setIsDark(dark);
        themeAppliedRef.current = true;
      }
    };

    // Apply now
    applyTheme();

    // Also request theme from extension host (triggers re-apply on response)
    try {
      postMessage({ type: 'getTheme' });
    } catch { /* safe */ }

    // Listen for theme change messages from the extension host
    const cleanup = onMessage((message) => {
      if (message && message.type === 'themeInfo') {
        // VS Code has changed theme — re-read CSS variables after a brief delay
        // to allow VS Code to inject the new --vscode-* variables
        requestAnimationFrame(() => {
          setTimeout(() => {
            applyTheme();
          }, 50);
        });
      }
    });

    // Also observe VS Code's body class changes (VS Code adds vscode-dark/vscode-light classes)
    let observer;
    try {
      observer = new MutationObserver(() => {
        applyTheme();
      });
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class', 'data-vscode-theme-kind'],
      });
    } catch { /* safe */ }

    return () => {
      cleanup();
      if (observer) observer.disconnect();
    };
  }, [setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme }}>
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
