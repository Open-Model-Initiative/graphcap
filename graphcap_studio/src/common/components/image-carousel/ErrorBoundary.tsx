// SPDX-License-Identifier: Apache-2.0
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Error boundary component to catch and handle errors in React components
 * 
 * This component catches JavaScript errors in its child component tree,
 * logs those errors, and displays a fallback UI instead of crashing
 * the entire application.
 * 
 * @param children - The components to render and monitor for errors
 * @param fallback - Optional custom fallback UI to display when an error occurs
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to the console
    console.error("Uncaught error in component:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h2 className="text-lg font-medium text-red-800">Something went wrong</h2>
          <p className="mt-1 text-sm text-red-700">
            There was an error loading this component. Try refreshing the page.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
} 