import { lazy, Suspense, useEffect, useRef } from 'react';
import { BrowserRouter, MemoryRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
import { SkeletonToolPage, SkeletonSettings } from './components/Skeleton';
import { isVsCodeWebview, onMessage, getInitialRoute, reloadWebview } from './vscodeApi';
/**
 * Safe lazy loader: wraps dynamic imports with error handling to prevent
 * chunk-loading failures (network issues, stale deployments) from crashing the app.
 */
function safeLazy(importFn, moduleName = 'Module') {
  return lazy(() =>
    importFn().catch((error) => {
      console.error(`[LazyLoad] Failed to load ${moduleName}:`, error);
      // Return a fallback component on chunk-load failure
      return {
        default: function LazyLoadError() {
          return (
            <div className="flex items-center justify-center min-h-[40vh] p-4 w-full">
              <div className="text-center p-6 sm:p-8 max-w-md w-full rounded-2xl border border-base-300/40 bg-base-100">
                <div className="w-16 h-16 rounded-2xl bg-warning/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚠️</span>
                </div>
                <p className="text-base font-bold mb-2">Failed to load {moduleName}</p>
                <p className="text-sm opacity-50 mb-1">This may be due to a network issue.</p>
                <p className="text-xs opacity-30 mb-5 break-all">{error?.message?.substring(0, 150) || 'Unknown error'}</p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <button
                    onClick={() => reloadWebview('/')}
                    className="btn btn-primary btn-sm rounded-xl"
                  >
                    Reload Page
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="btn btn-ghost btn-sm rounded-xl"
                  >
                    Hard Refresh
                  </button>
                </div>
              </div>
            </div>
          );
        },
      };
    })
  );
}

const NotFound = safeLazy(() => import('./pages/NotFound'), 'NotFound');
const Settings = safeLazy(() => import('./pages/Settings'), 'Settings');

const ReadmeGenerator = safeLazy(() => import('./tools/readme-generator/ReadmeGenerator'), 'README Generator');
const ApiTester = safeLazy(() => import('./tools/api-tester/ApiTester'), 'API Tester');
const MockApiGenerator = safeLazy(() => import('./tools/mock-api/MockApiGenerator'), 'Mock API Generator');
const JwtDecoder = safeLazy(() => import('./tools/jwt-decoder/JwtDecoder'), 'JWT Decoder');
const JsonFormatter = safeLazy(() => import('./tools/json-formatter/JsonFormatter'), 'JSON Formatter');
const RegexGenerator = safeLazy(() => import('./tools/regex-generator/RegexGenerator'), 'Regex Generator');
const PasswordGenerator = safeLazy(() => import('./tools/password-generator/PasswordGenerator'), 'Password Generator');

const SortingVisualizer = safeLazy(() => import('./tools/sorting-visualizer/SortingVisualizer'), 'Sorting Visualizer');
const RecursionVisualizer = safeLazy(() => import('./tools/recursion-visualizer/RecursionVisualizer'), 'Recursion Visualizer');
const EventLoopVisualizer = safeLazy(() => import('./tools/event-loop-visualizer/EventLoopVisualizer'), 'Event Loop Visualizer');
const FlexPlayground = safeLazy(() => import('./tools/flex-playground/FlexPlayground'), 'Flex Playground');
const SqlPlayground = safeLazy(() => import('./tools/sql-playground/SqlPlayground'), 'SQL Playground');

const ColorPaletteGenerator = safeLazy(() => import('./tools/color-palette/ColorPaletteGenerator'), 'Color Palette');
const CssGradientGenerator = safeLazy(() => import('./tools/css-gradient/CssGradientGenerator'), 'CSS Gradient');
const BoxShadowGenerator = safeLazy(() => import('./tools/box-shadow/BoxShadowGenerator'), 'Box Shadow');
const GlassmorphismGenerator = safeLazy(() => import('./tools/glassmorphism/GlassmorphismGenerator'), 'Glassmorphism');
const GridGenerator = safeLazy(() => import('./tools/grid-generator/GridGenerator'), 'Grid Generator');
/* Skeleton wrapper for tool pages — shows contextual skeleton instead of spinner */
function ToolSkeleton({ children }) {
  return <Suspense fallback={<SkeletonToolPage />}>{children}</Suspense>;
}

function SettingsSkeleton({ children }) {
  return <Suspense fallback={<SkeletonSettings />}>{children}</Suspense>;
}

/**
 * Navigation listener for VS Code extension messages.
 * Listens for 'navigate' messages from extension host and programmatically navigates.
 */
function VsCodeNavigationBridge() {
  const navigate = useNavigate();
  const cleanupRef = useRef(null);

  useEffect(() => {
    if (!isVsCodeWebview()) return;

    cleanupRef.current = onMessage((message) => {
      if (message.type === 'navigate' && message.route) {
        navigate(message.route);
      }
    });

    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, [navigate]);

  return null;
}

/**
 * Router wrapper — uses MemoryRouter inside VS Code webview (no URL bar),
 * BrowserRouter in regular browser context.
 */
function AppRouter({ children }) {
  if (isVsCodeWebview()) {
    const initialRoute = getInitialRoute();
    return (
      <MemoryRouter initialEntries={[initialRoute]} initialIndex={0}>
        <VsCodeNavigationBridge />
        {children}
      </MemoryRouter>
    );
  }
  return <BrowserRouter>{children}</BrowserRouter>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppRouter>
        <Suspense fallback={<SkeletonToolPage />}>
          <Routes>
            <Route element={<AppLayout />}>
            {/* Home & Dashboard — eagerly loaded */}
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Developer Tools — skeleton loading */}
            <Route path="/readme-generator" element={<ToolSkeleton><ReadmeGenerator /></ToolSkeleton>} />
            <Route path="/api-tester" element={<ToolSkeleton><ApiTester /></ToolSkeleton>} />
            <Route path="/mock-api" element={<ToolSkeleton><MockApiGenerator /></ToolSkeleton>} />
            <Route path="/jwt-decoder" element={<ToolSkeleton><JwtDecoder /></ToolSkeleton>} />
            <Route path="/json-formatter" element={<ToolSkeleton><JsonFormatter /></ToolSkeleton>} />
            <Route path="/regex-generator" element={<ToolSkeleton><RegexGenerator /></ToolSkeleton>} />
            <Route path="/password-generator" element={<ToolSkeleton><PasswordGenerator /></ToolSkeleton>} />

            {/* Learning Tools — skeleton loading */}
            <Route path="/sorting-visualizer" element={<ToolSkeleton><SortingVisualizer /></ToolSkeleton>} />
            <Route path="/recursion-visualizer" element={<ToolSkeleton><RecursionVisualizer /></ToolSkeleton>} />
            <Route path="/event-loop-visualizer" element={<ToolSkeleton><EventLoopVisualizer /></ToolSkeleton>} />
            <Route path="/flex-playground" element={<ToolSkeleton><FlexPlayground /></ToolSkeleton>} />
            <Route path="/sql-playground" element={<ToolSkeleton><SqlPlayground /></ToolSkeleton>} />

            {/* Frontend Tools — skeleton loading */}
            <Route path="/color-palette" element={<ToolSkeleton><ColorPaletteGenerator /></ToolSkeleton>} />
            <Route path="/css-gradient" element={<ToolSkeleton><CssGradientGenerator /></ToolSkeleton>} />
            <Route path="/box-shadow" element={<ToolSkeleton><BoxShadowGenerator /></ToolSkeleton>} />
            <Route path="/glassmorphism" element={<ToolSkeleton><GlassmorphismGenerator /></ToolSkeleton>} />
            <Route path="/grid-generator" element={<ToolSkeleton><GridGenerator /></ToolSkeleton>} />

            {/* Settings & Error Pages */}
              <Route path="/settings" element={<SettingsSkeleton><Settings /></SettingsSkeleton>} />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </AppRouter>
    </ErrorBoundary>
  );
}
