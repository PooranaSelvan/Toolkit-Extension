import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ThemeProvider } from './contexts/ThemeContext';
import { isVsCodeWebview } from './vscodeApi';

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

  createRoot(rootElement).render(
    <StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </StrictMode>,
  );
} catch (error) {
  console.error('[App Bootstrap Error]', error);
  // Show a minimal fallback UI if React fails to mount
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui;background:#1a1a2e;color:#e0e0e0;">
        <div style="text-align:center;max-width:400px;padding:2rem;">
          <h1 style="font-size:1.5rem;margin-bottom:0.5rem;">Application Error</h1>
          <p style="opacity:0.6;font-size:0.875rem;">Something went wrong while loading the app. Please try refreshing the page.</p>
          <button onclick="window.location.reload()" style="margin-top:1rem;padding:0.5rem 1.5rem;background:#6366f1;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.875rem;">
            Reload Page
          </button>
        </div>
      </div>
    `;
  }
}
