const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

/**
 * Developer Toolbox — VS Code Extension
 * 
 * Main extension entry point. Manages:
 * - Webview panel for the full toolbox
 * - Sidebar webview for quick tool access
 * - Commands for opening specific tools
 * - Communication bridge between VS Code and React app
 */

/** @type {vscode.WebviewPanel | undefined} */
let mainPanel;

/** @type {Map<string, string>} */
const TOOL_ROUTES = new Map([
  ['developerToolbox.jsonFormatter', '/json-formatter'],
  ['developerToolbox.apiTester', '/api-tester'],
  ['developerToolbox.regexGenerator', '/regex-generator'],
  ['developerToolbox.colorPalette', '/color-palette'],
  ['developerToolbox.jwtDecoder', '/jwt-decoder'],
  ['developerToolbox.passwordGenerator', '/password-generator'],
]);

const TOOL_QUICKPICK_ITEMS = [
  { label: '$(file-code) README Generator', description: 'Generate professional README.md files', route: '/readme-generator' },
  { label: '$(radio-tower) API Tester', description: 'Test REST & WebSocket APIs', route: '/api-tester' },
  { label: '$(server) Mock API Generator', description: 'Generate fake REST APIs', route: '/mock-api' },
  { label: '$(key) JWT Toolkit', description: 'Decode, verify & build JWTs', route: '/jwt-decoder' },
  { label: '$(json) JSON Formatter', description: 'Format, validate & minify JSON', route: '/json-formatter' },
  { label: '$(regex) Regex Generator', description: 'Build & test regex patterns', route: '/regex-generator' },
  { label: '$(lock) Password Generator', description: 'Generate secure passwords', route: '/password-generator' },
  { label: '$(symbol-color) Color Palette', description: 'Generate color palettes', route: '/color-palette' },
  { label: '$(paintcan) CSS Gradient', description: 'Create CSS gradients', route: '/css-gradient' },
  { label: '$(screen-normal) Box Shadow', description: 'Create layered box shadows', route: '/box-shadow' },
  { label: '$(mirror) Glassmorphism', description: 'Create frosted glass effects', route: '/glassmorphism' },
  { label: '$(layout) Grid Generator', description: 'Build CSS Grid layouts', route: '/grid-generator' },
  { label: '$(browser) Frontend Playground', description: 'Code HTML/CSS/JS live', route: '/frontend-playground' },
  { label: '$(graph-line) Sorting Visualizer', description: 'Visualize sorting algorithms', route: '/sorting-visualizer' },
  { label: '$(git-merge) Recursion Visualizer', description: 'Visualize recursive calls', route: '/recursion-visualizer' },
  { label: '$(sync) Event Loop Visualizer', description: 'See JS event loop in action', route: '/event-loop-visualizer' },
  { label: '$(split-horizontal) Flexbox Playground', description: 'Learn CSS Flexbox visually', route: '/flex-playground' },
  { label: '$(database) SQL Playground', description: 'Practice SQL queries in-browser', route: '/sql-playground' },
];

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log('Developer Toolbox extension is now active!');

  // Command: Open main toolbox
  context.subscriptions.push(
    vscode.commands.registerCommand('developerToolbox.open', () => {
      openToolboxPanel(context);
    })
  );

  // Command: Open specific tool via QuickPick
  context.subscriptions.push(
    vscode.commands.registerCommand('developerToolbox.openTool', async () => {
      const selected = await vscode.window.showQuickPick(TOOL_QUICKPICK_ITEMS, {
        placeHolder: 'Search and select a tool to open...',
        matchOnDescription: true,
      });
      if (selected) {
        openToolboxPanel(context, selected.route);
      }
    })
  );

  // Commands: Direct tool access
  for (const [command, route] of TOOL_ROUTES) {
    context.subscriptions.push(
      vscode.commands.registerCommand(command, () => {
        openToolboxPanel(context, route);
      })
    );
  }

  // Sidebar webview provider
  const sidebarProvider = new SidebarProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'developerToolbox.sidebarView',
      sidebarProvider,
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );
}

/**
 * Opens or reveals the main toolbox webview panel
 * @param {vscode.ExtensionContext} context 
 * @param {string} [initialRoute='/'] 
 */
function openToolboxPanel(context, initialRoute = '/') {
  // If panel already exists, reveal and navigate
  if (mainPanel) {
    mainPanel.reveal(vscode.ViewColumn.One);
    if (initialRoute !== '/') {
      mainPanel.webview.postMessage({ type: 'navigate', route: initialRoute });
    }
    return;
  }

  mainPanel = vscode.window.createWebviewPanel(
    'developerToolbox',
    'Developer Toolbox',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [
        vscode.Uri.joinPath(context.extensionUri, 'dist', 'webview'),
        vscode.Uri.joinPath(context.extensionUri, 'assets'),
      ],
    }
  );

  mainPanel.iconPath = {
    light: vscode.Uri.joinPath(context.extensionUri, 'assets', 'sidebar-icon.svg'),
    dark: vscode.Uri.joinPath(context.extensionUri, 'assets', 'sidebar-icon.svg'),
  };

  mainPanel.webview.html = getWebviewContent(mainPanel.webview, context.extensionUri, initialRoute);

  // Handle messages from webview
  mainPanel.webview.onDidReceiveMessage(
    (message) => handleWebviewMessage(message, mainPanel, context),
    undefined,
    context.subscriptions
  );

  mainPanel.onDidDispose(() => {
    mainPanel = undefined;
  }, null, context.subscriptions);
}

/**
 * Handles messages from the webview React app
 * @param {object} message 
 * @param {vscode.WebviewPanel} panel 
 * @param {vscode.ExtensionContext} context 
 */
function handleWebviewMessage(message, panel, context) {
  switch (message.type) {
    case 'copyToClipboard':
      vscode.env.clipboard.writeText(message.text).then(() => {
        vscode.window.showInformationMessage('Copied to clipboard!');
      });
      break;

    case 'showInfo':
      vscode.window.showInformationMessage(message.text);
      break;

    case 'showError':
      vscode.window.showErrorMessage(message.text);
      break;

    case 'showWarning':
      vscode.window.showWarningMessage(message.text);
      break;

    case 'openExternal':
      vscode.env.openExternal(vscode.Uri.parse(message.url));
      break;

    case 'saveFile': {
      const options = {
        defaultUri: vscode.Uri.file(message.filename || 'output.txt'),
        filters: message.filters || { 'All Files': ['*'] },
      };
      vscode.window.showSaveDialog(options).then((uri) => {
        if (uri) {
          const buffer = Buffer.from(message.content, 'utf-8');
          vscode.workspace.fs.writeFile(uri, buffer).then(() => {
            vscode.window.showInformationMessage(`File saved: ${path.basename(uri.fsPath)}`);
          });
        }
      });
      break;
    }

    case 'readActiveFile': {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const text = editor.document.getText();
        const lang = editor.document.languageId;
        const filename = path.basename(editor.document.fileName);
        panel.webview.postMessage({
          type: 'activeFileContent',
          content: text,
          language: lang,
          filename: filename,
        });
      } else {
        panel.webview.postMessage({
          type: 'activeFileContent',
          content: null,
          error: 'No active editor',
        });
      }
      break;
    }

    case 'insertToEditor': {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        editor.edit((editBuilder) => {
          if (message.replace) {
            const fullRange = new vscode.Range(
              editor.document.positionAt(0),
              editor.document.positionAt(editor.document.getText().length)
            );
            editBuilder.replace(fullRange, message.text);
          } else {
            editBuilder.insert(editor.selection.active, message.text);
          }
        });
      }
      break;
    }

    case 'getTheme': {
      const kind = vscode.window.activeColorTheme.kind;
      const isDark = kind === vscode.ColorThemeKind.Dark || kind === vscode.ColorThemeKind.HighContrast;
      panel.webview.postMessage({
        type: 'themeInfo',
        isDark: isDark,
        kind: kind,
      });
      break;
    }

    case 'stateUpdate': {
      // Persist webview state
      context.globalState.update(`toolbox.${message.key}`, message.value);
      break;
    }

    case 'getState': {
      const value = context.globalState.get(`toolbox.${message.key}`);
      panel.webview.postMessage({
        type: 'stateValue',
        key: message.key,
        value: value,
      });
      break;
    }
  }
}

/**
 * Generates the HTML content for the webview
 * @param {vscode.Webview} webview 
 * @param {vscode.Uri} extensionUri 
 * @param {string} initialRoute 
 * @returns {string}
 */
function getWebviewContent(webview, extensionUri, initialRoute = '/') {
  const distPath = vscode.Uri.joinPath(extensionUri, 'dist', 'webview');
  
  // Read the built index.html and inject webview URIs
  const indexPath = vscode.Uri.joinPath(distPath, 'index.html');
  let html = '';
  
  try {
    html = fs.readFileSync(indexPath.fsPath, 'utf-8');
  } catch (e) {
    // Fallback if build hasn't run yet
    return getFallbackHtml(webview, extensionUri, initialRoute);
  }

  // Get nonce for Content Security Policy
  const nonce = getNonce();

  // Replace asset paths with webview URIs
  html = html.replace(/(href|src)="\/([^"]*)"/g, (match, attr, filePath) => {
    const fileUri = vscode.Uri.joinPath(distPath, filePath);
    const webviewUri = webview.asWebviewUri(fileUri);
    return `${attr}="${webviewUri}"`;
  });

  // Inject CSP and initial route data
  const csp = `
    default-src 'none';
    style-src ${webview.cspSource} 'unsafe-inline' https://fonts.googleapis.com;
    font-src ${webview.cspSource} https://fonts.gstatic.com;
    img-src ${webview.cspSource} https: data: blob:;
    script-src 'nonce-${nonce}';
    connect-src https: http: ws: wss: data: blob:;
    frame-src blob: data:;
    worker-src blob:;
  `.replace(/\s+/g, ' ').trim();

  // Inject nonce into script tags
  html = html.replace(/<script/g, `<script nonce="${nonce}"`);

  // Inject meta tags before </head>
  const metaInjection = `
    <meta http-equiv="Content-Security-Policy" content="${csp}">
    <script nonce="${nonce}">
      window.__VSCODE_API__ = true;
      window.__INITIAL_ROUTE__ = '${initialRoute}';
      window.__WEBVIEW_NONCE__ = '${nonce}';
    </script>
  `;
  html = html.replace('</head>', `${metaInjection}\n</head>`);

  return html;
}

/**
 * Fallback HTML when build output is not available
 */
function getFallbackHtml(webview, extensionUri, initialRoute) {
  const nonce = getNonce();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <title>Developer Toolbox</title>
  <style>
    body {
      font-family: var(--vscode-font-family);
      background: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 2rem;
    }
    .container {
      text-align: center;
      max-width: 400px;
    }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    p { opacity: 0.7; font-size: 0.875rem; margin-bottom: 1.5rem; }
    code {
      display: block;
      background: var(--vscode-textCodeBlock-background);
      padding: 0.75rem 1rem;
      border-radius: 6px;
      font-family: var(--vscode-editor-font-family);
      font-size: 0.8125rem;
      margin-bottom: 0.5rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔧 Developer Toolbox</h1>
    <p>The webview hasn't been built yet. Run the following commands:</p>
    <code>cd "VS Code Extension"</code>
    <code>npm install</code>
    <code>npm run build</code>
    <p style="margin-top: 1rem;">Then reload the VS Code window.</p>
  </div>
</body>
</html>`;
}

/**
 * Sidebar webview provider — shows quick tool access
 */
class SidebarProvider {
  constructor(context) {
    this._context = context;
  }

  resolveWebviewView(webviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._context.extensionUri],
    };

    webviewView.webview.html = this._getSidebarHtml(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((message) => {
      switch (message.type) {
        case 'openTool':
          openToolboxPanel(this._context, message.route);
          break;
        case 'openMain':
          openToolboxPanel(this._context);
          break;
      }
    });
  }

  _getSidebarHtml(webview) {
    const nonce = getNonce();

    const tools = [
      { name: 'JSON Formatter', icon: '{ }', route: '/json-formatter', color: '#f59e0b' },
      { name: 'API Tester', icon: '📡', route: '/api-tester', color: '#3b82f6' },
      { name: 'Regex Generator', icon: '.*', route: '/regex-generator', color: '#8b5cf6' },
      { name: 'JWT Toolkit', icon: '🔑', route: '/jwt-decoder', color: '#ef4444' },
      { name: 'Color Palette', icon: '🎨', route: '/color-palette', color: '#ec4899' },
      { name: 'CSS Gradient', icon: '🌈', route: '/css-gradient', color: '#14b8a6' },
      { name: 'Box Shadow', icon: '◻️', route: '/box-shadow', color: '#6366f1' },
      { name: 'Glassmorphism', icon: '💎', route: '/glassmorphism', color: '#06b6d4' },
      { name: 'Grid Generator', icon: '⊞', route: '/grid-generator', color: '#84cc16' },
      { name: 'Frontend Playground', icon: '🖥️', route: '/frontend-playground', color: '#f97316' },
      { name: 'Password Generator', icon: '🔒', route: '/password-generator', color: '#10b981' },
      { name: 'README Generator', icon: '📄', route: '/readme-generator', color: '#6366f1' },
      { name: 'Mock API Generator', icon: '🗄️', route: '/mock-api', color: '#0ea5e9' },
      { name: 'Sorting Visualizer', icon: '📊', route: '/sorting-visualizer', color: '#f43f5e' },
      { name: 'Recursion Visualizer', icon: '🌳', route: '/recursion-visualizer', color: '#a855f7' },
      { name: 'Event Loop Visualizer', icon: '🔄', route: '/event-loop-visualizer', color: '#22c55e' },
      { name: 'Flexbox Playground', icon: '📐', route: '/flex-playground', color: '#eab308' },
      { name: 'SQL Playground', icon: '🗃️', route: '/sql-playground', color: '#0284c7' },
    ];

    const toolButtons = tools.map(t => `
      <button class="tool-btn" onclick="openTool('${t.route}')" title="${t.name}">
        <span class="tool-icon" style="background: ${t.color}15; color: ${t.color}">${t.icon}</span>
        <span class="tool-name">${t.name}</span>
        <span class="tool-arrow">→</span>
      </button>
    `).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: var(--vscode-font-family);
      background: var(--vscode-sideBar-background);
      color: var(--vscode-sideBar-foreground);
      font-size: 12px;
      padding: 8px;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 4px 12px;
      border-bottom: 1px solid var(--vscode-panel-border);
      margin-bottom: 8px;
    }
    .header-icon {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
    }
    .header-text h2 { font-size: 13px; font-weight: 700; }
    .header-text p { font-size: 10px; opacity: 0.6; margin-top: 1px; }
    .open-full-btn {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--vscode-button-background);
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: opacity 0.15s;
    }
    .open-full-btn:hover { opacity: 0.85; }
    .section-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      opacity: 0.45;
      padding: 4px 4px 6px;
    }
    .tools-list { display: flex; flex-direction: column; gap: 2px; }
    .tool-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border: none;
      background: transparent;
      color: var(--vscode-sideBar-foreground);
      border-radius: 6px;
      cursor: pointer;
      font-size: 11.5px;
      font-family: inherit;
      text-align: left;
      width: 100%;
      transition: background 0.12s;
    }
    .tool-btn:hover {
      background: var(--vscode-list-hoverBackground);
    }
    .tool-icon {
      width: 24px;
      height: 24px;
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      flex-shrink: 0;
      font-weight: 600;
    }
    .tool-name { flex: 1; font-weight: 500; }
    .tool-arrow {
      opacity: 0;
      font-size: 10px;
      transition: opacity 0.12s, transform 0.12s;
    }
    .tool-btn:hover .tool-arrow {
      opacity: 0.5;
      transform: translateX(2px);
    }
    .search-box {
      width: 100%;
      padding: 6px 10px;
      border: 1px solid var(--vscode-input-border);
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border-radius: 5px;
      font-size: 11px;
      font-family: inherit;
      margin-bottom: 10px;
      outline: none;
    }
    .search-box:focus {
      border-color: var(--vscode-focusBorder);
    }
    .search-box::placeholder {
      color: var(--vscode-input-placeholderForeground);
    }
    .hidden { display: none !important; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-icon">🔧</div>
    <div class="header-text">
      <h2>Developer Toolbox</h2>
      <p>${tools.length} tools available</p>
    </div>
  </div>

  <button class="open-full-btn" onclick="openMain()">
    ⚡ Open Full Toolbox
  </button>

  <input type="text" class="search-box" placeholder="Search tools..." oninput="filterTools(this.value)" />

  <div class="section-label">All Tools</div>
  <div class="tools-list" id="tools-list">
    ${toolButtons}
  </div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    
    function openTool(route) {
      vscode.postMessage({ type: 'openTool', route: route });
    }
    
    function openMain() {
      vscode.postMessage({ type: 'openMain' });
    }

    function filterTools(query) {
      const q = query.toLowerCase().trim();
      const buttons = document.querySelectorAll('.tool-btn');
      buttons.forEach(btn => {
        const name = btn.querySelector('.tool-name').textContent.toLowerCase();
        btn.classList.toggle('hidden', q && !name.includes(q));
      });
    }
  </script>
</body>
</html>`;
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function deactivate() {
  mainPanel = undefined;
}

module.exports = { activate, deactivate };
