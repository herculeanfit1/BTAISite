"use client";

import React from "react";
import Link from "next/link";
import { logger } from "../../lib/logger";

interface ErrorHandlerProps {
  error: Error;
  reset: () => void;
}

export const ErrorHandler = ({ error, reset }: ErrorHandlerProps) => {
  React.useEffect(() => {
    logger.error("Page component error", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <div className="mb-8 text-red-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto h-16 w-16"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
        Something went wrong
      </h2>

      <p className="mx-auto mb-8 max-w-md text-gray-600 dark:text-gray-300">
        We apologize for the inconvenience. Our team has been notified and we're
        working to fix the issue.
      </p>

      <div className="flex flex-col gap-4 sm:flex-row">
        <button
          onClick={reset}
          className="bg-primary hover:bg-primary/90 rounded-md px-6 py-3 font-medium text-white transition-colors"
        >
          Try again
        </button>

        <Link
          href="/"
          className="rounded-md border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Return to home page
        </Link>
      </div>

      {process.env.NODE_ENV !== "production" && (
        <div className="mt-8 w-full max-w-2xl overflow-auto rounded-lg bg-red-50 p-4 text-left dark:bg-red-900/20">
          <p className="mb-2 font-mono text-sm text-red-800 dark:text-red-300">
            {error.message}
          </p>
          {error.stack && (
            <pre className="font-mono text-xs whitespace-pre-wrap text-red-700 dark:text-red-400">
              {error.stack}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};
