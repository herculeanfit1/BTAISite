"use client";

/**
 * Global Error Component for Next.js App Router
 *
 * Uses inline styles to ensure proper rendering even if CSS fails to load.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */

import { useEffect } from "react";

interface ErrorComponentProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorComponentProps) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div style={{ display: "flex", minHeight: "70vh", alignItems: "center", justifyContent: "center", padding: "0 1rem" }}>
      <div style={{ width: "100%", maxWidth: "32rem", textAlign: "center" }}>
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ margin: "0 auto 1rem", display: "flex", width: "4rem", height: "4rem", alignItems: "center", justifyContent: "center", borderRadius: "9999px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="32"
              height="32"
            >
              <path
                fillRule="evenodd"
                d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 style={{ marginBottom: "0.5rem", fontSize: "1.875rem", fontWeight: "bold" }}>Something went wrong</h1>
          <p style={{ marginBottom: "1.5rem", color: "#6b7280" }}>
            We encountered an unexpected error.
            <span style={{ display: "block", marginTop: "0.5rem", fontSize: "0.875rem", color: "#9ca3af" }}>
              {error.message}
            </span>
            {error.digest && (
              <span style={{ display: "block", marginTop: "0.25rem", fontSize: "0.75rem", color: "#9ca3af" }}>
                Error ID: {error.digest}
              </span>
            )}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={() => reset()}
            style={{ padding: "0.5rem 1.5rem", backgroundColor: "#5B90B0", color: "white", borderRadius: "0.375rem", fontWeight: 500, cursor: "pointer", border: "none", fontSize: "1rem" }}
          >
            Try again
          </button>
          <a
            href="/"
            style={{ padding: "0.5rem 1.5rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", fontWeight: 500, color: "#374151", textDecoration: "none", fontSize: "1rem" }}
          >
            Return to homepage
          </a>
        </div>
      </div>
    </div>
  );
}
