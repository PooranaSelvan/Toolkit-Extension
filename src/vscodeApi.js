/**
 * VS Code API Bridge
 * 
 * Provides a unified interface for communicating between the React webview app
 * and the VS Code extension host. Falls back gracefully when running outside VS Code.
 */

/** @type {ReturnType<typeof acquireVsCodeApi> | null} */
let vscodeApi = null;

/**
 * Get the VS Code API instance (singleton)
 */
export function getVsCodeApi() {
  if (vscodeApi) return vscodeApi;
  
  if (typeof acquireVsCodeApi === 'function') {
    try {
      vscodeApi = acquireVsCodeApi();
      return vscodeApi;
    } catch (e) {
      console.warn('[VSCodeAPI] Failed to acquire VS Code API:', e);
    }
  }
  
  return null;
}

/**
 * Check if running inside VS Code webview
 */
export function isVsCodeWebview() {
  return typeof window !== 'undefined' && window.__VSCODE_API__ === true;
}

/**
 * Send a message to the extension host
 */
export function postMessage(message) {
  const api = getVsCodeApi();
  if (api) {
    api.postMessage(message);
    return true;
  }
  return false;
}

/**
 * Copy text to clipboard (uses VS Code API in webview, navigator API otherwise)
 */
export async function copyToClipboard(text) {
  if (isVsCodeWebview()) {
    postMessage({ type: 'copyToClipboard', text });
    return true;
  }
  
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

/**
 * Open an external URL
 */
export function openExternal(url) {
  if (isVsCodeWebview()) {
    postMessage({ type: 'openExternal', url });
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Show info/error/warning notifications
 */
export function showNotification(text, level = 'info') {
  if (isVsCodeWebview()) {
    postMessage({ type: `show${level.charAt(0).toUpperCase() + level.slice(1)}`, text });
  } else {
    console.log(`[${level}]`, text);
  }
}

/**
 * Request the active editor's file content from VS Code
 */
export function requestActiveFileContent() {
  postMessage({ type: 'readActiveFile' });
}

/**
 * Insert text into the active VS Code editor
 */
export function insertToEditor(text, replace = false) {
  postMessage({ type: 'insertToEditor', text, replace });
}

/**
 * Save a file using VS Code's save dialog
 */
export function saveFile(content, filename, filters) {
  if (isVsCodeWebview()) {
    postMessage({ type: 'saveFile', content, filename, filters });
  } else {
    // Browser fallback - download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'output.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

/**
 * Listen for messages from the extension host
 * @param {(message: any) => void} handler
 * @returns {() => void} cleanup function
 */
export function onMessage(handler) {
  const listener = (event) => {
    if (event.data) {
      handler(event.data);
    }
  };
  
  window.addEventListener('message', listener);
  return () => window.removeEventListener('message', listener);
}

/**
 * Get the initial route (set by extension when opening a specific tool)
 */
export function getInitialRoute() {
  if (typeof window !== 'undefined' && window.__INITIAL_ROUTE__) {
    return window.__INITIAL_ROUTE__;
  }
  return '/';
}

export default {
  getVsCodeApi,
  isVsCodeWebview,
  postMessage,
  copyToClipboard,
  openExternal,
  showNotification,
  requestActiveFileContent,
  insertToEditor,
  saveFile,
  onMessage,
  getInitialRoute,
};
