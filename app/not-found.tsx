import Link from "next/link";
import { Route } from "next";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="mb-8 text-gray-400">
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
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
        404
      </h1>
      <h2 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-gray-200">
        Page not found
      </h2>

      <p className="mx-auto mb-8 max-w-md text-gray-600 dark:text-gray-300">
        The page you are looking for might have been removed or is temporarily
        unavailable.
      </p>

      <Link
        href={"/" as Route<string>}
        className="bg-primary hover:bg-primary/90 rounded-md px-6 py-3 font-medium text-white transition-colors"
      >
        Return to home page
      </Link>
    </div>
  );
}
