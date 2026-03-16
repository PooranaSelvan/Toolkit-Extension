# 🔧 WebToolKit Toolbox — VS Code Extension

> **All-in-one developer utilities — 17+ tools running directly inside VS Code!**

No browser needed. No sign-ups. No data collection. Everything runs client-side inside a VS Code webview panel.

[![VS Code](https://img.shields.io/badge/VS%20Code-v1.51%2B-blue?logo=visualstudiocode)](https://code.visualstudio.com/)
[![Version](https://img.shields.io/badge/version-1.5.2-brightgreen)](./CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-yellow)](./LICENSE)

---

## ✨ Features

### 🛠️ Developer Tools (7)
| Tool | Description |
|------|-------------|
| **README Generator** | Generate professional README.md with templates, badge builder, GitHub import & quality scoring |
| **API Tester** | Test REST & WebSocket APIs with environments, assertions, bulk runner, diff & code generation |
| **Mock API Generator** | Generate fake REST APIs with realistic data for testing |
| **JWT Toolkit** | Decode, verify, build & audit JSON Web Tokens |
| **JSON Formatter** | Format, validate, minify & transform JSON data |
| **Regex Generator** | Build & test regex patterns with live preview |
| **Password Generator** | Generate secure passwords, passphrases & PINs with entropy scoring |

### 🎨 Frontend Tools (5)
| Tool | Description |
|------|-------------|
| **Color Palette** | Generate & export beautiful color palettes |
| **CSS Gradient** | Create CSS gradients with live preview & code export |
| **Box Shadow** | Create layered box shadows with visual editor |
| **Glassmorphism** | Create frosted glass UI effects with code export |
| **Grid Generator** | Click & drag CSS Grid layout builder |

### 📚 Learning Tools (5)
| Tool | Description |
|------|-------------|
| **Sorting Visualizer** | Learn sorting algorithms with step-by-step visual animations |
| **Recursion Visualizer** | Visualize recursive function calls as animated trees |
| **Event Loop Visualizer** | See the JavaScript event loop, call stack & queues in action |
| **Flexbox Playground** | Learn CSS Flexbox interactively with live visual results |
| **SQL Playground** | Practice SQL queries in-browser with sample datasets |

---

## 🚀 Getting Started

### Installation
1. Open **VS Code**
2. Go to **Extensions** (`Ctrl+Shift+X`)
3. Search for **"Developer Toolbox"**
4. Click **Install**

### Usage
| Method | Action |
|--------|--------|
| **Command Palette** | `Ctrl+Shift+P` → `Developer Toolbox: Open` |
| **Keyboard Shortcut** | `Ctrl+Shift+T` (`Cmd+Shift+T` on Mac) |
| **Activity Bar** | Click the 🔧 icon in the sidebar |
| **Direct Tool Access** | `Ctrl+Shift+P` → `Developer Toolbox: Open Specific Tool...` |
| **Context Menu** | Right-click a `.json` file → `Open JSON Formatter` |

---
## 🎨 Themes

The extension automatically syncs with your VS Code color theme:

- **Light mode** — When VS Code uses a light theme, the toolbox switches to the **Toolbox Light** theme.
- **Dark mode** — When VS Code uses a dark theme, the toolbox switches to the **Toolbox Dark** theme.

No manual theme switching required — it just follows your editor.

---

## ⚡ Key Highlights

- **🔒 100% Privacy** — All data stays in your browser. Zero telemetry. Zero tracking.
- **⚡ Lightning Fast** — No network requests. Everything processes client-side.
- **🌐 Works Offline** — All tools function without an internet connection.
- **🎯 VS Code Native** — Runs in a webview panel, fully integrated with the IDE.
- **🎨 Auto Theme Sync** — Automatically matches your VS Code light/dark theme.
- **📋 Clipboard & File Integration** — Copy results to clipboard and save files via VS Code dialogs.
- **🖥️ Active Editor Integration** — Read from and write to your active editor.

---

## 🔧 Requirements

- **VS Code** v1.51.0 or higher

No additional dependencies required — everything is bundled within the extension.

---

## 📋 Commands

| Command | Description |
|---------|-------------|
| `Developer Toolbox: Open` | Open the full toolbox dashboard |
| `Developer Toolbox: Open Specific Tool...` | Quick-pick a specific tool to open |
| `Developer Toolbox: Open JSON Formatter` | Open JSON Formatter directly |
| `Developer Toolbox: Open API Tester` | Open API Tester directly |
| `Developer Toolbox: Open Regex Generator` | Open Regex Generator directly |
| `Developer Toolbox: Open Color Palette` | Open Color Palette directly |
| `Developer Toolbox: Open JWT Decoder` | Open JWT Decoder directly |
| `Developer Toolbox: Open Password Generator` | Open Password Generator directly |

---

## 📦 Extension Settings

This extension does not require any VS Code settings configuration. All preferences (themes, tool settings) are managed within the extension's own Settings page.

---

## 🐛 Known Issues

See the [GitHub Issues](https://github.com/PooranaSelvan/Toolkit-Extension/issues) page for current known issues and feature requests.

---

## 📝 Release Notes

See [CHANGELOG.md](./CHANGELOG.md) for the full release history.

### 1.5.2 (Latest)
- Removed **Frontend Playground** tool entirely — reduced bundle size by removing CodeMirror 6 and all associated dependencies
- Updated tool counts, documentation, extension sidebar, and QuickPick items

### 1.5.1
- Fixed UI lag from expensive `filter: blur()` CSS animations in page transitions
- Fixed `AnimatePresence mode="wait"` blocking navigation for 350ms+ on route change
- Fixed sidebar categories collapsed by default — all categories now open on load
- Removed per-tool stagger animations and `layoutId` layout thrashing in sidebar
- Fixed sidebar search dropdown overlapping tool links
- Removed 10+ infinite Framer Motion and CSS animations from decorative elements
- Replaced expensive `backdrop-blur` on header and sidebar with lighter alternatives
- Expanded test suite from 47 to 66 tests

### 1.5.0
- Fixed hardcoded version in sidebar — now auto-sourced from `package.json` via build-time injection
- Theme auto-syncs with VS Code (light/dark) — removed manual theme selector
- Fixed XSS vulnerability in webview route injection using `JSON.stringify()`
- Removed redundant clipboard fallback in `useCopyToClipboard` hook
- Fixed toast notification accumulation — added `useRef` ID counter and `MAX_TOASTS` limit
- Fixed SQL engine mutating original table data on INSERT/UPDATE/DELETE
- Fixed `safeLocalStorage` deleting unrelated keys on quota error
- Fixed UTF-8 Base64 decoding for multibyte characters in GitHub service
- Added `.cancel()` method to debounce utility for proper `useEffect` cleanup
- Added shared `IntersectionObserver` singleton for lazy-loaded images
- Added bug-fix verification test suite (`tests/run-tests.mjs`)

### 1.4.0
- Replaced broken `confirm()` dialogs in README Generator and Regex Generator with inline confirmation UI
- Replaced deprecated `unescape()`/`escape()` with modern `TextEncoder`/`TextDecoder` APIs
- Cleaned up unused imports and dead code

### 1.3.1
- Fixed clipboard paste buttons in JSON Formatter and JWT Decoder for VS Code webview
- Fixed README Generator share URL clipboard write using VS Code clipboard bridge
- Fixed Particles component animation memory leak on unmount

### 1.3.0
- Fixed webview panel not opening inside VS Code (code splitting → single bundle)
- Extended VS Code version compatibility to v1.51.0+
- Fixed sidebar version badge, GitHub repo URLs, external link handling
- Replaced `window.confirm()` with inline confirmation for VS Code webview compatibility

### 1.2.1
- Fixed webview asset loading, CSP, crossorigin attributes, error boundary

### 1.2.0
- Fixed stale closure bugs in visualizer tools, skeleton rendering stability

### 1.1.0
- Performance optimizations and enhanced error handling across all tools

### 1.0.0
- Initial release with 18+ developer tools

---

## 📄 License

MIT — Built by [Poorana Selvan](https://github.com/PooranaSelvan)
