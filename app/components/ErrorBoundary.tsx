"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { logger } from "../../lib/logger";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to our logging service
    logger.error("Error caught by ErrorBoundary", {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      componentStack: errorInfo.componentStack,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        this.props.fallback || (
          <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
            <h2 className="mb-4 text-2xl font-bold text-red-600">
              Something went wrong
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              We've encountered an error and our team has been notified.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="bg-primary hover:bg-primary/90 rounded-md px-4 py-2 text-white transition-colors"
            >
              Try again
            </button>
            {process.env.NODE_ENV !== "production" && this.state.error && (
              <div className="mt-6 w-full max-w-xl overflow-auto rounded-lg bg-red-50 p-4 text-left dark:bg-red-900/20">
                <p className="font-mono text-sm text-red-800 dark:text-red-300">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
          </div>
        )
      );
    }

    return this.props.children;
  }
}
