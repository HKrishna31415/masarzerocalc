import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-navy-900 rounded-2xl shadow-2xl p-8 max-w-2xl w-full border-2 border-red-500/30"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                  Something went wrong
                </h1>
                <p className="text-slate-600 dark:text-navy-400">
                  We encountered an unexpected error
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-sm font-mono text-red-800 dark:text-red-300 mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="text-xs text-red-700 dark:text-red-400">
                    <summary className="cursor-pointer font-semibold mb-2">
                      Stack trace
                    </summary>
                    <pre className="whitespace-pre-wrap overflow-auto max-h-40">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Reload Application
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-white rounded-lg transition-all font-semibold focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                Go Back
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-navy-500 mt-6 text-center">
              If this problem persists, please contact support with the error details above.
            </p>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
