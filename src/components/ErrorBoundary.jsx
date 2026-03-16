import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, ChevronDown } from 'lucide-react';

// Dynamic import to avoid issues in error boundary context
let Link;
try {
  Link = require('react-router-dom').Link;
} catch {
  Link = ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>;
}

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
      console.error('Error caught by boundary:', error, errorInfo);
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
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
          {/* Ambient background */}
          <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-base-200 via-base-200 to-base-300/40" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-error/5 blur-3xl" />
          </div>

          <div className="max-w-md w-full">
            <div className="rounded-2xl border border-error/20 bg-base-100 p-8 text-center shadow-xl shadow-error/5 relative overflow-hidden">
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-error/50 to-transparent" />

              <div className="w-18 h-18 rounded-2xl bg-error/10 flex items-center justify-center mx-auto mb-5 relative">
                <div className="absolute inset-0 rounded-2xl bg-error/5 animate-glow-pulse" />
                <AlertTriangle size={34} className="text-error relative z-10" />
              </div>

              <h1 className="text-2xl font-extrabold mb-2 tracking-tight">Oops! Something broke</h1>
              <p className="text-sm opacity-50 mb-1">
                We encountered an unexpected error.
              </p>
              <p className="text-xs opacity-30 mb-6">
                Don't worry — your data is safe. Try refreshing or go back home.
              </p>

              {/* Error details (always available, toggleable) */}
              {this.state.error && (
                <div className="mb-6 text-left">
                  <button
                    onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                    className="flex items-center gap-2 text-xs font-semibold text-error/80 hover:text-error cursor-pointer transition-colors w-full mb-2"
                  >
                    <Bug size={12} />
                    Error Details
                    <ChevronDown size={12} className={`ml-auto transition-transform duration-200 ${this.state.showDetails ? 'rotate-180' : ''}`} />
                  </button>
                  {this.state.showDetails && (
                    <div className="rounded-xl bg-base-200/80 p-3 text-xs font-mono overflow-auto max-h-40 border border-error/10">
                      <p className="text-error font-semibold mb-2 break-all">{this.state.error.toString()}</p>
                      {this.state.errorInfo && (
                        <pre className="opacity-50 whitespace-pre-wrap text-[10px] leading-relaxed">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={this.handleReset}
                  className="btn btn-primary btn-sm rounded-xl gap-2 shadow-sm shadow-primary/15"
                >
                  <RefreshCw size={14} />
                  Try Again
                </button>
                <button
                  onClick={this.handleReload}
                  className="btn btn-outline btn-sm rounded-xl gap-2"
                >
                  <RefreshCw size={14} />
                  Reload Page
                </button>
                <Link to="/" className="btn btn-ghost btn-sm rounded-xl gap-2" onClick={this.handleReset}>
                  <Home size={14} />
                  Go Home
                </Link>
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
