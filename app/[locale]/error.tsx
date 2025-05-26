"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "../components/Button";

interface ErrorComponentProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorComponentProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-lg text-center">
        <div className="mb-8">
          <div className="bg-error/10 text-error mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-8 w-8"
            >
              <path
                fillRule="evenodd"
                d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-3xl font-bold">Something went wrong</h1>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            We're sorry, but we encountered an unexpected error.
            {error.digest && (
              <span className="mt-2 block text-sm text-gray-500 dark:text-gray-500">
                Error ID: {error.digest}
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button
            onClick={() => reset()}
            className="bg-primary hover:bg-primary-dark text-white"
          >
            Try again
          </Button>
          <Link href="/" passHref>
            <Button
              variant="outline"
              className="border-gray-300 dark:border-gray-700"
            >
              Return to homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
