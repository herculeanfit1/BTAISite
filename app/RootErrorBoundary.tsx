"use client";

import React from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Link from "next/link";
import { Route } from "next";
import { useRouter } from "next/navigation";

export default function RootErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  const fallback = (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center dark:bg-gray-900">
      <div className="mb-8 text-red-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto h-20 w-20"
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

      <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
        Unexpected Error
      </h1>

      <p className="mx-auto mb-8 max-w-md text-gray-600 dark:text-gray-300">
        We're sorry, but something went wrong. Please refresh the page or try
        again later.
      </p>

      <div className="flex flex-col gap-4 sm:flex-row">
        <button
          onClick={handleRefresh}
          className="bg-primary hover:bg-primary/90 rounded-md px-6 py-3 font-medium text-white transition-colors"
        >
          Refresh Page
        </button>

        <Link
          href={"/" as Route<string>}
          className="rounded-md border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Return to home page
        </Link>
      </div>
    </div>
  );

  return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>;
}
