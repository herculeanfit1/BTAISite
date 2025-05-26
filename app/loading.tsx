import React from "react";

const LoadingSpinner = () => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="border-primary h-16 w-16 animate-spin rounded-full border-t-2 border-b-2"></div>
  </div>
);

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <h2 className="mt-4 text-xl font-medium text-gray-700 dark:text-gray-300">
          Loading...
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Please wait while we prepare your content
        </p>
      </div>
    </div>
  );
}
