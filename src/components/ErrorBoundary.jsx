import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, ChevronDown } from 'lucide-react';
import { reloadWebview } from '../vscodeApi';

/**
 * ErrorBoundary — catches unhandled React errors and renders a recovery UI.
 *
 * This component intentionally does NOT use React Router's <Link> — when a deep
 * error crashes the component tree, router context may be unavailable. Using
 * window navigation or reloadWebview() is the only safe recovery path.
 *
 * The error UI uses inline styles as fallback in case CSS/Tailwind fails to load —
 * this ensures the error screen is always usable.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log safely — avoid re-throwing inside the boundary
    try {
      console.error('[ErrorBoundary] Error caught:', error, errorInfo);
    } catch {
      // Logging itself failed — swallow silently
    }
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });
  };

  handleReload = () => {
    try { reloadWebview('/'); } catch { window.location.reload(); }
  };

  handleGoHome = () => {
    // Reset error state first, then navigate home.
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false }, () => {
      try { reloadWebview('/'); } catch { window.location.reload(); }
    });
  };

  render() {
    if (this.state.hasError) {
      // Inline styles as ultimate fallback — if CSS is broken, users can still recover
      const containerStyle = {
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      };
      const cardStyle = {
        maxWidth: '28rem',
        width: '100%',
        borderRadius: '1rem',
        padding: '2rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      };
      const btnBaseStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        borderRadius: '0.75rem',
        fontSize: '0.8125rem',
        fontWeight: 600,
        cursor: 'pointer',
        border: 'none',
        transition: 'all 0.2s',
        minHeight: '2.25rem',
      };

      return (
        <div style={containerStyle} className="min-h-[50vh] flex items-center justify-center p-4">
          <div style={{ maxWidth: '28rem', width: '100%' }} className="max-w-md w-full">
            <div style={cardStyle} className="rounded-2xl border border-error/20 bg-base-100 p-8 text-center shadow-xl shadow-error/5 relative overflow-hidden">
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-error/50 to-transparent" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px' }} />

              <div className="w-18 h-18 rounded-2xl bg-error/10 flex items-center justify-center mx-auto mb-5 relative" style={{ width: '4.5rem', height: '4.5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <AlertTriangle size={34} className="text-error relative z-10" style={{ color: '#ef4444' }} />
              </div>

              <h1 className="text-2xl font-extrabold mb-2 tracking-tight" style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Oops! Something broke</h1>
              <p className="text-sm opacity-50 mb-1" style={{ fontSize: '0.875rem', opacity: 0.5, marginBottom: '0.25rem' }}>
                We encountered an unexpected error.
              </p>
              <p className="text-xs opacity-30 mb-6" style={{ fontSize: '0.75rem', opacity: 0.3, marginBottom: '1.5rem' }}>
                Don't worry — your data is safe. Try again or reload the page.
              </p>

              {/* Error details (always available, toggleable) */}
              {this.state.error && (
                <div className="mb-6 text-left" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                  <button
                    onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                    className="flex items-center gap-2 text-xs font-semibold text-error/80 hover:text-error cursor-pointer transition-colors w-full mb-2"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', width: '100%', marginBottom: '0.5rem', background: 'none', border: 'none', color: 'inherit', padding: 0 }}
                  >
                    <Bug size={12} />
                    Error Details
                    <ChevronDown size={12} className={`ml-auto transition-transform duration-200 ${this.state.showDetails ? 'rotate-180' : ''}`} style={{ marginLeft: 'auto', transform: this.state.showDetails ? 'rotate(180deg)' : 'none' }} />
                  </button>
                  {this.state.showDetails && (
                    <div className="rounded-xl bg-base-200/80 p-3 text-xs font-mono overflow-auto max-h-40 border border-error/10 scrollbar-thin" style={{ borderRadius: '0.75rem', padding: '0.75rem', fontSize: '0.75rem', fontFamily: 'monospace', overflow: 'auto', maxHeight: '10rem', border: '1px solid rgba(239,68,68,0.1)', wordBreak: 'break-all' }}>
                      <p className="text-error font-semibold mb-2 break-all" style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#ef4444' }}>{this.state.error.toString()}</p>
                      {this.state.errorInfo && (
                        <pre className="opacity-50 whitespace-pre-wrap text-[10px] leading-relaxed break-all" style={{ opacity: 0.5, whiteSpace: 'pre-wrap', fontSize: '10px', lineHeight: 1.6, wordBreak: 'break-all' }}>
                          {this.state.errorInfo.componentStack}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 justify-center" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                <button
                  onClick={this.handleReset}
                  className="btn btn-primary btn-sm rounded-xl gap-2 shadow-sm shadow-primary/15"
                  style={{ ...btnBaseStyle, background: '#2D79FF', color: 'white' }}
                >
                  <RefreshCw size={14} />
                  Try Again
                </button>
                <button
                  onClick={this.handleReload}
                  className="btn btn-outline btn-sm rounded-xl gap-2"
                  style={{ ...btnBaseStyle, background: 'transparent', border: '1px solid rgba(0,0,0,0.15)' }}
                >
                  <RefreshCw size={14} />
                  Reload Page
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="btn btn-ghost btn-sm rounded-xl gap-2"
                  style={{ ...btnBaseStyle, background: 'transparent' }}
                >
                  <Home size={14} />
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
