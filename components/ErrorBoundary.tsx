import React from 'react';
import { ExclamationTriangleIcon } from './IconComponents';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: undefined,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    const { hasError, error } = this.state;

    if (hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mb-4 border-8 border-red-50 dark:border-slate-800/50">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Oops! Something Went Wrong</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-md">
                An unexpected error occurred. Please try refreshing the page. If the problem persists, please contact support.
            </p>
            <button
                onClick={() => window.location.reload()}
                className="mt-6 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors"
            >
                Refresh Page
            </button>
            {error && (
              <details className="mt-4 text-left max-w-lg w-full">
                <summary className="text-sm text-slate-500 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300">Error Details</summary>
                <pre className="mt-2 p-3 text-xs bg-slate-100 dark:bg-slate-800 text-red-500 dark:text-red-400 rounded-md overflow-auto">
                    {/* FIX: Add guard to prevent accessing properties on a potentially undefined error object. */}
                    {error instanceof Error ? `${error.name}: ${error.message}` : String(error)}
                    {error instanceof Error && error.stack ? `\n\n${error.stack}` : ''}
                </pre>
              </details>
          )}
        </div>
      );
    }

    // FIX: The error "Property 'props' does not exist on type 'ErrorBoundary'" suggests an issue with how the TypeScript toolchain is interpreting `this.props`. Destructuring `this.props` is a common pattern that can resolve this.
    const { children } = this.props;
    return children;
  }
}
