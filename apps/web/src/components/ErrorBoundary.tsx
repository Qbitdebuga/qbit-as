'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { handleError, ErrorDetails } from '@/utils/error-handler';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetCondition?: any;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorDetails: ErrorDetails | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorDetails: null
    };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to our error handling system
    const errorDetails = handleError(error, {
      context: {
        componentStack: errorInfo.componentStack,
        // Add more context information if needed
      }
    });

    // Update state with error details
    this.setState({ errorDetails });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  // Allow errors to be reset when certain props change
  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (
      this.state.hasError &&
      prevProps.resetCondition !== this.props.resetCondition
    ) {
      this.setState({
        hasError: false,
        error: null,
        errorDetails: null
      });
    }
  }

  // Method to manually reset the error state
  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorDetails: null
    });
  };

  render() {
    const { hasError, error, errorDetails } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="p-4 max-w-3xl mx-auto">
          <ErrorDisplay
            title="Something went wrong"
            message={errorDetails?.message || error?.message || "An unexpected error occurred"}
            severity="error"
            retry={this.resetErrorBoundary}
            details={errorDetails?.stack || error?.stack}
          />
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <button
              onClick={this.resetErrorBoundary}
              className="text-primary underline"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}

/**
 * HOC to wrap components with an ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const displayName = Component.displayName || Component.name || 'Component';

  const ComponentWithErrorBoundary = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;
  return ComponentWithErrorBoundary;
} 