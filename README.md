# 🔧 WebToolKit Toolbox — VS Code Extension

> **All-in-one developer utilities — 17+ tools running directly inside VS Code!**

No browser needed. No sign-ups. No data collection. Everything runs client-side inside a VS Code webview panel.

[![VS Code](https://img.shields.io/badge/VS%20Code-v1.51%2B-blue?logo=visualstudiocode)](https://code.visualstudio.com/)
[![Version](https://img.shields.io/badge/version-1.6.1-brightgreen)](./CHANGELOG.md)

---

## ✨ Features

### 🛠️ Developer Tools (7)
| Tool | Description |
|------|-------------|
| **README Generator** | Generate professional README.md with templates, badge builder, GitHub import & quality scoring |
| **API Tester** | Test REST & WebSocket APIs with environments, assertions, bulk runner, diff & code generation |
| **Mock API Generator** | Generate fake REST APIs with realistic data for testing |
| **JWT Toolkit** | Decode, verify, build & audit JSON Web Tokens with collapsible sections |
| **JSON Formatter** | Format, validate, minify & transform JSON data |
| **Regex Generator** | Build & test regex patterns with live preview |
| **Password Generator** | Generate secure passwords, passphrases & PINs with real crack-time estimates |

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
| **Sorting Visualizer** | Learn sorting algorithms with gradient-colored bars, CSS animations, celebration effects & real-time stats |
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
- **🎨 Auto Theme Sync** — Automatically matches your VS Code light/dark theme with WCAG AA contrast enforcement.
- **📋 Clipboard & File Integration** — Copy results to clipboard and save files via VS Code dialogs.
- **🖥️ Active Editor Integration** — Read from and write to your active editor.
- **⭐ Favorites & Recents** — Star your most-used tools and access recent tools from the sidebar.
- **📐 Collapsible Sidebar** — Toggle the sidebar between full-width and compact icon-only mini mode.

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

### 1.6.1 (Latest)
- **Sorting Visualizer** — Complete visual overhaul with gradient-colored bars, CSS animations, memoized `Bar` component, celebration confetti on completion, and real-time elapsed timer
- **WCAG Contrast Enforcement** — Theme system now guarantees AA-compliant (4.5:1) text contrast and distinguishable surface colors for all VS Code themes
- **UI Polish** — Raised text/icon opacity across all components, added hover micro-interactions (rotate, scale, glow rings), refined glass surfaces and shadows
- **Header** — Clickable category breadcrumbs, restored `backdrop-blur-xl` glassmorphism, gradient icon containers
- Fixed Password Generator duplicate crack-time computation, JWT collapsible section height glitch, SQL parser alias precedence, and several minor bugs

### 1.6.0
- **Sidebar Mini Mode** — Collapsible sidebar that shrinks to a 60px icon rail on desktop with hover tooltips
- **Sidebar Favorites** — Star/unstar tools with persistent favorites section at the top of navigation
- **Sidebar Recents** — Automatically tracks the 5 most recently visited tools for quick access
- **Sidebar Collapse All** — One-click button to collapse all expanded tool categories

### 1.5.5
- Removed MIT license from the project
- Updated version to 1.5.5 across all project files

### 1.5.2
- Removed **Frontend Playground** tool — reduced bundle size by removing CodeMirror 6 and all dependencies

### 1.5.1
- Fixed UI lag from expensive CSS animations and `AnimatePresence mode="wait"` blocking navigation
- Removed 10+ infinite animations, fixed sidebar accessibility, expanded test suite to 66 tests

### 1.5.0
- Auto-sourced version from `package.json`, VS Code theme auto-sync, XSS fix, 10 bug fixes, test suite added

### 1.4.0
- Replaced broken `confirm()` dialogs with inline UI, replaced deprecated `unescape()`/`escape()` APIs

### 1.3.1
- Fixed clipboard operations and memory leaks in VS Code webview

### 1.3.0
- Fixed webview panel loading (single bundle), extended VS Code compatibility to v1.51.0+

### 1.2.1
- Fixed webview asset loading, CSP, crossorigin attributes, error boundary

### 1.2.0
- Fixed stale closure bugs in visualizer tools, skeleton rendering stability

### 1.1.0
- Performance optimizations and enhanced error handling across all tools

### 1.0.0
- Initial release with 18+ developer tools

---

## 👤 Author

Built by [Poorana Selvan](https://github.com/PooranaSelvan)
