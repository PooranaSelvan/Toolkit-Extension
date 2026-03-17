# Changelog

All notable changes to the **WebToolKit Toolbox** (Developer Toolbox) extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.1] - 2025-07-20

### Enhanced
- **Sorting Visualizer — Complete Visual Overhaul** — Redesigned the entire Sorting Visualizer with gradient-colored bars (each algorithm has a unique color scheme), GPU-friendly CSS animations for active/swap/sorted states, a memoized `Bar` component (`React.memo`) for rendering performance, and a dot-grid visualization area background. Bars now show value labels (for arrays ≤ 25), glow rings on active comparisons, and a celebration sequence with confetti particles when sorting completes
- **Sorting Visualizer — Algorithm Identity** — Each sorting algorithm (Selection, Bubble, Insertion, Merge) now has a unique `color` and `gradient` property displayed in the algorithm picker cards, progress bar, and phase badges for stronger visual identity
- **Sorting Visualizer — Completion Celebration** — Added a "Sorted!" celebration card with confetti overlay animation when sorting finishes, plus a staggered bar brightness wave (`sv-celebration-bar`) that ripples across all bars on completion
- **Sorting Visualizer — Stats Panel** — Added real-time elapsed timer and improved stat display with colored icon badges for comparisons, swaps, array accesses, and time
- **VS Code Theme WCAG Contrast Enforcement** — `ThemeContext` now ensures `base-content` (foreground text) meets WCAG AA 4.5:1 contrast ratio against `base-100` (background) via a new `ensureContentContrast()` function. If a VS Code theme produces low-contrast text, the color is iteratively adjusted toward white (dark themes) or black (light themes) until the target ratio is met
- **VS Code Theme Surface Distinguishability** — Added `ensureSurfaceStep()` to guarantee `base-200` and `base-300` are visually distinct from `base-100`. Many VS Code themes have sidebar/activity bar colors nearly identical to the editor background — this forces a minimum luminance step between surfaces
- **VS Code Theme CSS Overrides** — Added `[data-theme=vscode]` CSS rules to enforce minimum text contrast on badge-ghost elements, form placeholders, table headers, and keyboard hint badges that Tailwind's opacity modifiers (`text-base-content/50`) would otherwise make invisible
- **UI Text Contrast — Global Opacity Bump** — Increased text/icon opacity values across all major components (Sidebar, Header, Dashboard, HomePage, EmptyState, ToolCard, LazyImage) from the `0.15–0.35` range to `0.30–0.60` for significantly better readability, especially on non-default VS Code themes
- **Header — Breadcrumb Enhancements** — Category breadcrumb is now a clickable `<Link>` to the Dashboard filtered by that category. Tool icon containers use rounded-xl with a subtle gradient and ring. Added `ArrowRight` icon to the Dashboard button on the homepage
- **Header — Glassmorphism Restored** — Re-enabled `backdrop-blur-xl` on the header with a translucent `bg-base-100/80` background and refined multi-layer box-shadow for a polished floating appearance
- **Card & Surface Polish** — Added hover corner-accent gradients (top-right glow), ring borders on icon containers, `group-hover:rotate-[-3deg]` micro-interactions, `group-hover:scale-110` on icons, directional arrow animations (`translate-x-0.5`), and stronger `hover:shadow-xl` across ToolCard, ToolShowcaseCard, FeatureCard, and CategoryShowcaseCard
- **Glass & Surface Refinements** — Fine-tuned opacity percentages, border colors, and box-shadow layers for `.glass-card`, `.glass-elevated`, `.glass-highlight`, `.stat-card-frost`, and `.section-card` CSS classes to create more refined surface hierarchy
- **Sidebar — Improved Border & Shadow** — Sidebar border reduced to `border-base-300/30` and desktop shadow changed to a directional `shadow-[2px_0_16px_-4px_rgba(0,0,0,0.06)]`. Brand header gets a subtle `bg-base-100/50` tint. Logo now uses `bg-gradient-to-br from-primary to-primary/90`
- **Input Field Placeholder Contrast** — Global placeholder color bumped from 35% to 45% mix, and sidebar search input uses explicit `placeholder:text-base-content/40` with focus ring styling
- **AppLayout — Third Ambient Blob** — Added a centered accent-colored ambient blob at 1.5% opacity for more visual depth in the background gradient overlay
- **FeatureCard & ToolShowcaseCard — Scroll Animations** — FeatureCard now uses `motion.div` with `whileInView` for staggered scroll-triggered entrance animations with viewport margin detection

### Fixed
- **Password Generator — Duplicate Crack-Time Calculation** — The `calcStrength()` function returned hardcoded crack-time strings ("Instant", "Minutes", etc.) while `estimateCrackTime()` separately computed a precise estimate. The display called `estimateCrackTime()` again on render. Unified by calling `estimateCrackTime(entropy)` once inside `calcStrength()` and storing the result in the returned object
- **JWT Decoder — Collapsible Section Height Glitch** — `CollapsibleSection` calculated `maxHeight` from `contentRef.current.scrollHeight` at toggle time, but this stale value didn't update when section content changed dynamically (e.g., switching JWT tabs). Added `ResizeObserver` to reactively track content height changes and a `contentHeight` state variable for smooth accordion animations
- **SQL Parser — Table Alias Precedence Bug** — The `parseSelect()` function checked for an implicit alias (bare `IDENT` token) before checking for an explicit `AS` alias. If a query used `FROM table AS alias`, the `AS` keyword was consumed as an implicit alias. Reordered: explicit `AS` alias is now checked first, then implicit `IDENT` alias
- **Sidebar — Redundant Recent-Tool Updates** — Visiting an already most-recent tool triggered a `setRecents` state update and `localStorage.setItem` write on every navigation even though the order wouldn't change. Added an early `if (prev[0] === currentTool.id) return prev` guard to skip the update entirely
- **useLocalStorage — Key-Change Data Loss** — When the `key` parameter changed (e.g., switching between tool instances), any pending debounced write for the old key was silently discarded. Added a `keyRef` tracking effect that flushes the pending write for the *previous* key before switching, and fixed the unmount cleanup to use `keyRef.current` instead of the stale closure `key`
- **SEO Component — Unnecessary Work in Webview** — `SEO.jsx` computed `window.location.origin` and ran meta-tag DOM manipulation inside VS Code webview where it has no effect. Moved the `isVsCodeWebview()` check before the URL computation and made it a stable value instead of calling the detection function on every render
- **vscodeApi — Silent Clipboard Failure** — `copyToClipboard()` returned `true` unconditionally after calling `postMessage()`, even if `postMessage()` itself failed (no VS Code API available). Now checks the return value of `postMessage()` and returns `false` on failure
- **Extension CSP — Overly Permissive connect-src** — Content Security Policy allowed `ws:` and `wss:` protocols in `connect-src` which are not needed by the extension. Tightened to `https: http:` only

### Changed
- Version bumped to `1.6.1` across `package.json`

---

## [1.6.0] - 2025-07-19

### Added
- **Sidebar — Collapsible Mini Mode** — Desktop sidebar can now be collapsed to a 60px icon-only rail via a toggle button. State persists in `localStorage` (`sidebar_collapsed`). Mini mode shows icon-only nav items with hover tooltips (`MiniTooltip` component). Sidebar width is exposed as `--sidebar-width` CSS custom property for the main content area to respect
- **Sidebar — Favorites** — Users can star/unstar any tool directly from the sidebar. Favorites are persisted in `localStorage` (`sidebar_favorites`) and displayed in a dedicated "Favorites" section at the top of the nav with a ⭐ Star icon. Favorite stars appear on hover for non-favorited tools and stay visible for favorited ones
- **Sidebar — Recent Tools** — The sidebar now tracks the 5 most recently visited tools (persisted in `localStorage` — `sidebar_recents`) and displays them in a "Recent" section with a 🕒 Clock icon, giving quick access to frequently used tools
- **Sidebar — Collapse All Categories** — Added a `ChevronsDownUp` button in the categories header to collapse all expanded tool categories at once
- **Sidebar — Mini-Mode Tooltips** — When the sidebar is in collapsed/mini mode, hovering over any nav icon shows a floating tooltip with the tool name, positioned to the right of the sidebar with a directional arrow

### Changed
- **Sidebar — Complete Architecture Rewrite** — Refactored the entire `Sidebar.jsx` from a simple nav list into a feature-rich navigation panel with dedicated sections (Brand, Search, Favorites, Recents, Categories, Footer), modular helper functions (`loadJSON`/`saveJSON`), and clean separation of concerns via constants and dedicated state hooks
- **Sidebar — Width System** — Sidebar width is now dynamic (`SIDEBAR_FULL_W = 272px`, `SIDEBAR_MINI_W = 60px`) instead of hardcoded. The active width is communicated to `AppLayout` via the `--sidebar-width` CSS custom property
- **ToolCard — Compact Variant Arrow** — Added a trailing `ArrowRight` icon that appears on hover in the compact ToolCard variant for better affordance

---

## [1.5.5] - 2025-07-19

### Removed
- **MIT License** — Removed the MIT license file (`LICENSE`) from the project entirely
- Removed `"license": "MIT"` field from `package.json`
- Removed license badge from `README.md`
- Removed "License" section from `README.md` footer (replaced with "Author" section)

### Changed
- Version bumped to `1.5.5` across `package.json`, `README.md`, and `CHANGELOG.md`
- Updated `README.md` release notes with `1.5.5` entry

---

## [1.5.2] - 2025-07-18

### Removed
- **Frontend Playground** — Completely removed the Frontend Playground tool (live HTML/CSS/JS editor with preview). This removes 4 source files (`FrontendPlayground.jsx`, `FrontendPlayground.css`, `CodeMirrorEditor.jsx`, `codemirrorSetup.js`) and all 10 CodeMirror 6 dependencies (`@codemirror/autocomplete`, `@codemirror/commands`, `@codemirror/lang-css`, `@codemirror/lang-html`, `@codemirror/lang-javascript`, `@codemirror/language`, `@codemirror/search`, `@codemirror/state`, `@codemirror/view`, `@lezer/highlight`)
- Removed `/frontend-playground` route from the React app router
- Removed Frontend Playground lazy import from `App.jsx`
- Removed Frontend Playground entry from `toolRegistry.js` (17 tools remaining)
- Removed Frontend Playground from the VS Code extension sidebar quick-access tools
- Removed Frontend Playground from the Command Palette QuickPick tool list
- Removed Frontend Playground from `FEATURED_TOOL_IDS` in HomePage (replaced with Grid Generator)
- Removed unused `Layout` icon import from `lucide-react` in tool registry

### Changed
- Extension description updated from "18+ tools" to "17+ tools" in `package.json` and `README.md`
- Frontend Tools category count updated from 6 to 5 in `README.md`
- Version bumped to `1.5.2`
- Test suite expanded with removal verification tests

---

## [1.5.1] - 2025-07-18

### Fixed
- **UI Lag from Expensive CSS Filter Animations** — Page transitions used `filter: blur(4px)` in entry/exit animations, forcing full-layer repaints on every animation frame. Removed all `blur()` filters from `pageVariants` in `AppLayout.jsx` and reduced transition duration from 350ms to 200ms for snappier navigation
- **AnimatePresence `mode="wait"` Blocking Navigation** — The `<AnimatePresence mode="wait">` wrapper around page content required the exit animation to fully complete before rendering the new page, creating a 350ms+ perceived freeze when clicking sidebar links. Changed to default `mode="sync"` so new pages render immediately
- **Sidebar Tool Categories Collapsed by Default** — Only the first category was expanded on initial load, requiring users to manually expand categories before they could click any tool. Changed default to open all categories so every tool is immediately accessible
- **Per-Tool Stagger Animations in Sidebar** — Each tool link in the sidebar was wrapped in `<motion.div>` with staggered animation delays (`toolIdx * 0.03`), creating 15+ simultaneous Framer Motion instances on category expand. Replaced with plain `<NavLink>` elements for instant rendering and reliable click handling
- **`layoutId="sidebar-active-bar"` Causing Layout Thrashing** — The active indicator bar used Framer Motion's `layoutId` which triggers cross-component layout calculations on every route change. Replaced with a simple static `<div>` indicator
- **Sidebar Search Dropdown Overlapping Tool Links** — The search results dropdown used `relative z-20` positioning which could visually overlay tool links below without properly capturing pointer events. Changed to `absolute` positioning with `z-50` so it floats above the nav without affecting the layout flow
- **Global `.overflow-hidden` CSS Rule Adding `will-change: height`** — A blanket CSS rule `.overflow-hidden { will-change: height; }` applied `will-change` to every element with Tailwind's `overflow-hidden` class, creating unnecessary composited layers across the entire app. Removed the rule entirely
- **Sidebar Body Lock Using Generic `overflow-hidden` Class** — The sidebar's mobile body-scroll lock added/removed the `overflow-hidden` class, conflicting with Tailwind utility classes on other elements. Replaced with a scoped `sidebar-body-lock` CSS class
- **Infinite Framer Motion Blob Animations on Every Page** — `AppLayout.jsx`, `HomePage.jsx`, and `Dashboard.jsx` each had 2–5 `<motion.div>` elements with `repeat: Infinity` animations (20–25 second loops) running JS on every frame for decorative blobs at 1.5–6% opacity. Replaced all with static `<div>` elements — visually identical, zero runtime cost
- **Infinite CSS Animations on Ambient Blobs and Header** — CSS `.ambient-blob-1` / `.ambient-blob-2` keyframe animations and the header accent line's `gradient-shift` animation ran continuously. Removed all infinite CSS animations from decorative elements
- **Header Re-Animating on Every Route Change** — `<motion.header>` with `initial={{ opacity: 0, y: -8 }}` ran an entry animation on every route change. Replaced with a plain `<header>` element
- **Expensive `backdrop-blur-2xl` on Header** — The header used `backdrop-blur-2xl` (40px blur), a costly GPU operation on every scroll repaint. Reduced to `backdrop-blur-xl` (24px)
- **Expensive `backdrop-blur-xl` + Translucent Background on Sidebar** — The sidebar used `bg-base-100/95 backdrop-blur-xl`, requiring the GPU to composite and blur all content behind the sidebar on every frame. Replaced with opaque `bg-base-100` — eliminates the blur compositing entirely
- **Dashboard Empty State Infinite Bounce Animation** — The "no results" empty state had a `<motion.div>` with `repeat: Infinity` bouncing animation. Replaced with a static element

### Improved
- **Test Suite Expanded** — Added 19 new tests (47 → 66 total) covering all UI performance and sidebar accessibility fixes: page transition optimizations, blob animation removal, sidebar category defaults, search dropdown positioning, header animation removal, and backdrop-blur reductions

---

## [1.5.0] - 2025-07-18

### Fixed
- **Hardcoded Version in Sidebar (Bug #1)** — The sidebar footer displayed a hardcoded version string that drifted out of sync with `package.json`. Created `src/constants/version.js` as a single source of truth, injected at build time via Vite's `define` option (`__APP_VERSION__`). Both `vite.config.js` and `vite.webview.config.js` now read the version from `package.json` automatically
- **Theme Not Syncing with VS Code (Bug #2)** — The extension offered 30+ manual theme choices, but inside VS Code the webview should match the editor's light/dark theme. Replaced the full theme selector with automatic detection: `ThemeContext` now listens for `themeInfo` messages from the extension host and toggles between `toolbox` (light) and `toolbox-dark` (dark) only. Also respects `prefers-color-scheme` when running outside VS Code
- **XSS via Route Injection in Extension Host (Bug #3)** — The extension's `getWebviewContent()` used string interpolation (`'${initialRoute}'`) to inject the initial route into the webview's inline `<script>`, allowing a crafted route string to break out of the string literal. Replaced with `JSON.stringify(initialRoute)` and `JSON.stringify(nonce)` for safe, injection-proof encoding
- **Redundant Clipboard Fallback (Bug #4)** — `useCopyToClipboard` hook contained a duplicate `document.createElement('textarea')` + `document.execCommand('copy')` fallback that was already implemented in `vscodeApi.js`'s `copyToClipboard()`. Removed the duplicate; the hook now delegates entirely to the centralized `vscodeApi.copyToClipboard()`
- **Toast Notification Accumulation (Bug #5)** — Toast IDs used a module-level `let toastId = 0` counter shared across all component instances, causing ID collisions on re-mount. Replaced with `useRef` for instance-scoped counters. Added `MAX_TOASTS = 5` limit with FIFO eviction to prevent unbounded toast accumulation in the DOM
- **SQL Engine Mutating Original Data (Bug #7)** — `INSERT` used `Array.push()` on the original rows array, `UPDATE` mutated row elements in-place, and `DELETE` used `Array.filter()` which returns a new array but the original reference was also exposed. All three operations now produce new array references: `INSERT` spreads `[...table.rows, newRow]`, `UPDATE` maps with `[...row]` copies, and `DELETE` assigns the filtered result via object spread `{ ...table, rows: filteredRows }`
- **`safeLocalStorage` Deleting Unrelated Keys on Quota Error (Bug #8)** — On `QuotaExceededError`, the storage helper called `localStorage.removeItem(keys[0])` to free space, potentially deleting an unrelated key (e.g., another tool's saved data). Fixed to only retry by removing the *same key* being written (`localStorage.removeItem(key)`) before attempting the write again
- **UTF-8 Base64 Decoding Fails for Multibyte Characters (Bug #9)** — `githubService.js` used raw `atob()` for decoding GitHub API file content, which corrupts multibyte UTF-8 characters (accented letters, emoji, CJK). Added a `decodeBase64()` helper that pipes through `Uint8Array.from()` + `new TextDecoder('utf-8')` for correct Unicode decoding, with `atob()` as a safe fallback
- **Debounce Function Missing `.cancel()` Method (Bug #10)** — The `debounce()` utility in `performance.js` returned a plain function with no way to cancel pending timeouts. Components using it in `useEffect` could not clean up on unmount, causing stale callbacks. Added an `executedFunction.cancel()` method that calls `clearTimeout()` and nullifies the timeout reference

### Added
- **Version Constants Module** — New `src/constants/version.js` exports `APP_VERSION`, sourced from `package.json` via Vite's build-time `define` injection. Eliminates all hardcoded version strings
- **Bug-Fix Verification Test Suite** — New `tests/run-tests.mjs` with 35+ tests covering all 10 bug fixes. Runs with `node tests/run-tests.mjs` — no external test framework required. Tests SQL engine immutability, XSS-safe route encoding, clipboard deduplication, toast limits, UTF-8 decoding, debounce cancel, and more

### Improved
- **Shared IntersectionObserver Singleton** — Replaced per-image `IntersectionObserver` instantiation in `performance.js` with a single shared observer (`_sharedImageObserver`), reducing memory overhead for pages with many lazy-loaded images
- **ThemeContext Simplification** — Removed 30+ theme options; now uses exactly 2 themes (`toolbox` light / `toolbox-dark` dark) with automatic VS Code theme synchronization and `prefers-color-scheme` media query fallback for browser usage
- **Extension Display Name** — Updated from "Developer Toolbox" to "WebToolKit Toolbox" for marketplace clarity

---

## [1.4.0] - 2025-07-17

### Fixed
- **`confirm()` Broken in VS Code Webview (README Generator)** — The "Reset all fields" button used `confirm()` which does not work inside VS Code webview, causing the reset to silently fail. Replaced with an inline animated confirmation popup with Cancel/Reset buttons
- **`confirm()` Broken in VS Code Webview (Regex Generator)** — The "Delete all saved patterns" button used `confirm()` with the same VS Code webview incompatibility. Replaced with an inline dropdown confirmation dialog with proper state management and Framer Motion animation
- **Deprecated `unescape()` and `escape()` Functions (README Generator)** — The share URL encoding/decoding used deprecated `unescape(encodeURIComponent(...))` and `decodeURIComponent(escape(...))` functions which produce TypeScript warnings and have known Unicode edge cases. Replaced with modern `TextEncoder`/`TextDecoder` + `Uint8Array` approach
- **Unused Imports and Variables (JSON Formatter)** — Removed 6 unused icon imports (`Info`, `GitCompare`, `RefreshCw`, `Eye`, `Filter`, `FileText`), removed unused `path` parameter from `analyzeJson()`, and fixed unused `history` variable from `useLocalStorage` destructuring

---

## [1.3.1] - 2025-07-17

### Fixed
- **Clipboard Paste Broken in VS Code Webview (JSON Formatter)** — `navigator.clipboard.readText()` is not available in VS Code webview due to security restrictions. The "Paste" button in JSON Formatter silently failed. Added proper feature detection with a graceful fallback message guiding users to use `Ctrl+V` / `Cmd+V`
- **Clipboard Paste Broken in VS Code Webview (JWT Decoder)** — Same `navigator.clipboard.readText()` issue in JWT Decoder's paste button. Added feature detection and clear user-facing error message instead of a generic "access denied"
- **Share URL Clipboard Write Broken in VS Code Webview (README Generator)** — The "Share" button in README Generator used `navigator.clipboard.writeText()` directly, bypassing the VS Code clipboard bridge. Replaced with the `copyToClipboard` function from the existing `useCopyToClipboard` hook which properly routes through the VS Code extension host API
- **Particles Animation Memory Leak** — The `Particles` UI component used recursive `requestAnimationFrame()` but only tracked the initial frame ID for cleanup. On unmount, only the first frame was cancelled while subsequent recursive frames continued executing in the background. Fixed by tracking the latest frame ID in a ref so the entire animation loop is properly stopped on cleanup
- **CHANGELOG Documentation** — Corrected entry for SQL Playground that incorrectly referenced "sql.js" library; the tool uses a custom in-browser SQL engine

### Improved
- **AudioContext Browser Compatibility** — Added proper JSDoc type annotations for `webkitAudioContext` fallback in Sorting Visualizer, Recursion Visualizer, and Event Loop Visualizer to eliminate TypeScript hints while maintaining Safari/older browser compatibility

---

## [1.3.0] - 2025-07-17

### Fixed
- **Webview Panel Not Opening in VS Code** — Resolved critical issue where the extension webview would fail to load inside VS Code. The Vite build produced 70+ separate JavaScript chunk files via `React.lazy()` dynamic imports. These chunks couldn't be resolved at runtime because VS Code's webview resolves `import()` URLs against `vscode-webview://` origin instead of the local file system. Fixed by configuring `inlineDynamicImports: true` in Rollup output options, consolidating the entire React app into a single JavaScript bundle
- **VS Code Version Compatibility** — Lowered `engines.vscode` from `^1.96.0` to `^1.51.0` and `@types/vscode` from `^1.96.0` to `^1.51.0`. The extension only uses APIs available since VS Code 1.51 (`registerWebviewViewProvider`, sidebar webview views), so the previous constraint unnecessarily blocked installation on VS Code versions 1.51–1.95
- **Sidebar Version Badge Mismatch** — Fixed hardcoded `v4.0` version badge in the sidebar footer that did not reflect the actual extension version; corrected to `v1.3.0`
- **GitHub Repository URL Mismatch** — Fixed "Star on GitHub" links in HomePage and Settings pages pointing to the incorrect repository URL (`Developer-Toolbox` instead of `Toolkit-Extension`)
- **`window.confirm()` Broken in VS Code Webview** — Replaced `window.confirm()` call in Settings "Clear All Data" with an inline confirmation dialog component. `window.confirm()` is not available in VS Code's webview environment and silently fails, preventing users from clearing their data
- **External Links Not Opening in VS Code Webview** — Added VS Code `openExternal` API handling to all external `<a>` links (GitHub profile, portfolio, "Star on GitHub") across HomePage, Dashboard, and Settings pages. Previously, `target="_blank"` links were silently blocked by VS Code's webview CSP, so external URLs never opened

### Improved
- **Vite Build Configuration** — Added comprehensive documentation comments explaining why `inlineDynamicImports` is required for VS Code webview compatibility
- **Single Bundle Architecture** — Build output reduced from 73+ files to 4 files (`index.html`, `index.js`, `index.css`, `favicon.svg`), eliminating all dynamic chunk resolution issues in the webview

---

## [1.2.1] - 2025-07-16

### Fixed
- **Webview Asset Loading** — Fixed critical regex in `getWebviewContent` that failed to rewrite `./`-prefixed asset paths (produced by Vite's `base: './'`) to webview URIs, causing the main JS bundle and CSS stylesheet to never load in the VS Code webview panel
- **Content Security Policy** — Added `webview.cspSource` to `script-src` and `connect-src` directives so dynamically imported tool chunks (70+ lazy-loaded modules) and Vite's modulepreload fetch requests are no longer blocked by CSP
- **Webview Cross-Origin Attributes** — Stripped `crossorigin` attributes from `<script>` and `<link>` tags in webview HTML, which are incompatible with the `vscode-webview-resource://` scheme and caused silent resource loading failures
- **Error Boundary** — Replaced `require('react-router-dom')` with a standard ES module import; `require()` is unavailable in Vite-bundled ESM apps, which broke the error boundary's fallback UI navigation
- **Apple Touch Icon** — Fixed `index.html` referencing non-existent `/logo.svg` for `apple-touch-icon`; corrected to `/favicon.svg` which is the actual file in the public directory
- **Vite Build Config** — Corrected invalid option `emptyDirBefore: true` to the proper Vite option `emptyOutDir: true` in `vite.webview.config.js`

---

## [1.2.0] - 2025-07-15

### Fixed
- **Sorting Visualizer** — Fixed stale closure bug in speed-change `useEffect`: added missing `playing` and `startTimer` dependencies so adjusting speed mid-animation now correctly restarts the timer instead of silently using an outdated tick callback
- **Event Loop Visualizer** — Fixed identical stale closure bug in speed-change `useEffect` with missing `playing` and `startTimer` dependencies causing timer drift when speed slider is adjusted during playback
- **Event Loop Visualizer** — Fixed missing `currentStep` dependency in sound effect `useEffect` that could play sounds for a stale step reference
- **Recursion Visualizer** — Fixed identical stale closure bug in speed-change `useEffect` with missing `playing` and `startTimer` dependencies
- **Skeleton Components** — Fixed `SkeletonText`, `SkeletonSidebar`, and `SkeletonInlineContent` using `Math.random()` during render, causing non-deterministic widths and layout shifts on every re-render; replaced with stable `useMemo`-cached deterministic width generator

### Improved
- All `useEffect` hooks now have correct exhaustive dependency arrays — no more `eslint-disable` suppressions
- Skeleton loading states are now visually stable across re-renders with no layout jank

---

## [1.1.0] - 2025-07-14

### Improved
- Performance optimizations across all 18+ tools
- Enhanced error handling and input validation
- Improved UI responsiveness and accessibility
- Better VS Code theme synchronization
- Optimized bundle size and load times
- Refined sorting, recursion, and event loop visualizers
- Smoother animations and transitions across all tools
- Improved Flexbox and SQL Playground gamification stability

### Fixed
- Minor bug fixes and stability improvements across all tools
- Improved cross-platform compatibility

---

## [1.0.0] - 2025-03-15

### Added
- **README Generator** — Generate professional README.md files with templates, badge builder, scoring, and GitHub import
- **API Tester** — Full-featured REST & WebSocket API tester with environments, history, collections, bulk runner, response diff, and code generator
- **Mock API Generator** — Generate realistic fake REST APIs instantly
- **JWT Toolkit** — Decode, verify, build, and audit JSON Web Tokens
- **JSON Formatter** — Format, validate, minify, diff, and transform JSON data
- **Regex Generator** — Build and test regex patterns with live preview and AI-assisted generation
- **Password Generator** — Generate secure passwords, passphrases, and PINs with entropy scoring
- **Color Palette Generator** — Generate, explore, and export beautiful color palettes
- **CSS Gradient Generator** — Create CSS gradients visually with live preview and code export
- **Box Shadow Generator** — Build layered box shadows with real-time preview
- **Glassmorphism Generator** — Create frosted glass UI effects with code export
- **CSS Grid Generator** — Click-and-drag CSS Grid layout builder
- **Sorting Visualizer** — Step-through visualization of sorting algorithms
- **Recursion Visualizer** — Visualize recursive function call trees
- **Event Loop Visualizer** — See the JavaScript event loop in action
- **Flexbox Playground** — Learn and experiment with CSS Flexbox visually
- **SQL Playground** — Practice SQL queries in-browser with a built-in SQL engine
- Activity Bar sidebar with searchable quick-access tool list
- Keyboard shortcut `Ctrl+Shift+T` / `Cmd+Shift+T` to open the toolbox
- Direct commands for each tool via the Command Palette
- Context menu shortcut for JSON Formatter on `.json` files
- VS Code theme integration (dark/light mode sync)
- Persistent state via VS Code global storage
- Save file dialog integration for file exports
- Active editor read/write integration
