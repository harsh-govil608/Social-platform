import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // In production, send to error monitoring service (Sentry)
    if (process.env.NODE_ENV === 'production' && window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
          <div className="card w-full max-w-2xl bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-error/10 mb-4">
                <AlertTriangle className="w-10 h-10 text-error" />
              </div>

              <h1 className="card-title text-3xl mb-2">
                {this.props.fallbackTitle || 'Oops! Something went wrong'}
              </h1>

              <p className="text-base-content/70 mb-6">
                {this.props.fallbackMessage ||
                  "We're sorry, but something unexpected happened. Please try refreshing the page or go back to the homepage."}
              </p>

              {isDevelopment && this.state.error && (
                <div className="w-full mb-6">
                  <div className="alert alert-error">
                    <div className="flex flex-col items-start w-full">
                      <p className="font-bold mb-2">Error Details:</p>
                      <pre className="text-xs overflow-auto max-h-40 w-full text-left bg-base-200 p-3 rounded">
                        {this.state.error.toString()}
                      </pre>
                      {this.state.errorInfo && (
                        <>
                          <p className="font-bold mt-3 mb-2">Component Stack:</p>
                          <pre className="text-xs overflow-auto max-h-60 w-full text-left bg-base-200 p-3 rounded">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="card-actions gap-3">
                <button onClick={this.handleReset} className="btn btn-primary gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                <button onClick={this.handleGoHome} className="btn btn-ghost gap-2">
                  <Home className="w-4 h-4" />
                  Go Home
                </button>
              </div>

              {!isDevelopment && (
                <p className="text-sm text-base-content/50 mt-4">
                  Error ID: {Date.now().toString(36)}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
