import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ThemeProvider } from './contexts/ThemeContext';

// Global unhandled error handlers — prevents silent failures
window.addEventListener('error', (event) => {
  console.error('[Global Error]', event.error?.message || event.message, event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]', event.reason);
  event.preventDefault(); // Prevent default browser behavior (console noise)
});

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found. Ensure <div id="root"> exists in index.html.');
  }

  // Prevent multiple mount attempts (can happen if script re-executes in webview reload)
  if (rootElement.__reactRoot) {
    console.warn('[App] Root already mounted — skipping duplicate render');
  } else {
    const root = createRoot(rootElement);
    rootElement.__reactRoot = root;
    root.render(
      <StrictMode>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </StrictMode>,
    );
  }
} catch (error) {
  console.error('[App Bootstrap Error]', error);
  // Show a minimal fallback UI if React fails to mount — uses inline styles only
  // so it works even if CSS/Tailwind completely fails to load.
  const root = document.getElementById('root');
  if (root) {
    const isWebview = typeof window !== 'undefined' && window.__VSCODE_API__ === true;
    // Detect dark/light from existing theme attribute or default dark
    const isDark = document.documentElement.getAttribute('data-theme') !== 'toolbox';
    const bg = isDark ? '#1a1a2e' : '#f8f9fc';
    const fg = isDark ? '#e0e0e0' : '#1e293b';
    const btnBg = '#2D79FF';
    root.innerHTML = `
      <div style="min-height:100vh;min-height:100dvh;display:flex;align-items:center;justify-content:center;font-family:Inter,system-ui,-apple-system,sans-serif;background:${bg};color:${fg};padding:1rem;">
        <div style="text-align:center;max-width:400px;width:100%;">
          <div style="width:64px;height:64px;border-radius:16px;background:${btnBg}15;display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;font-size:28px;">⚠️</div>
          <h1 style="font-size:1.25rem;font-weight:800;margin-bottom:0.5rem;">Application Error</h1>
          <p style="opacity:0.5;font-size:0.8125rem;line-height:1.6;margin-bottom:1.25rem;">Something went wrong while loading the app. ${isWebview ? 'Please close and reopen the Developer Toolbox panel.' : 'Please try refreshing the page.'}</p>
          <p style="opacity:0.25;font-size:0.6875rem;margin-bottom:1.25rem;word-break:break-all;">${(error?.message || 'Unknown error').substring(0, 200)}</p>
          ${isWebview
            ? `<button id="__reload_webview_btn" style="padding:0.625rem 1.5rem;background:${btnBg};color:white;border:none;border-radius:12px;cursor:pointer;font-size:0.8125rem;font-weight:600;">Reload Toolbox</button>`
            : `<button onclick="window.location.reload()" style="padding:0.625rem 1.5rem;background:${btnBg};color:white;border:none;border-radius:12px;cursor:pointer;font-size:0.8125rem;font-weight:600;">Reload Page</button>`
          }
        </div>
      </div>
    `;
    // If in VS Code webview, wire up the reload button to post a message to extension host
    if (isWebview) {
      const btn = document.getElementById('__reload_webview_btn');
      if (btn) {
        btn.addEventListener('click', () => {
          try {
            const api = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : null;
            if (api) api.postMessage({ type: 'reloadWebview', route: '/' });
          } catch { window.location.reload(); }
        });
      }
    }
  }
}
