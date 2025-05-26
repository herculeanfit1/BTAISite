"use client";

import { useState } from "react";
import Link from "next/link";

interface NewsletterProps {
  title?: string;
  description?: string;
  buttonText?: string;
  className?: string;
  compact?: boolean;
  dark?: boolean;
}

export const Newsletter = ({
  title = "Subscribe to our newsletter",
  description = "Stay updated with the latest in trusted AI implementation and industry insights.",
  buttonText = "Subscribe",
  className = "",
  compact = false,
  dark = false,
}: NewsletterProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, name: name || undefined }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe");
      }

      setSuccess(true);
      setEmail("");
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`w-full ${dark ? "text-white" : "text-gray-900 dark:text-white"} ${className}`}
    >
      {!compact && (
        <div className="mb-4">
          <h3
            className={`text-xl font-bold ${dark ? "text-white" : "text-gray-900 dark:text-white"}`}
          >
            {title}
          </h3>
          <p
            className={`mt-2 ${dark ? "text-gray-200" : "text-gray-600 dark:text-gray-300"}`}
          >
            {description}
          </p>
        </div>
      )}

      {success ? (
        <div className="rounded-lg border border-green-200 bg-green-100 p-4 text-green-700 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300">
          <p>
            Thank you for subscribing! We'll keep you updated with the latest
            news and insights.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {!compact && (
            <div>
              <label
                htmlFor="newsletter-name"
                className="mb-1 block text-sm font-medium"
              >
                Name (optional)
              </label>
              <input
                type="text"
                id="newsletter-name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="focus:ring-primary focus:border-primary w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:text-white"
              />
            </div>
          )}

          <div>
            {!compact && (
              <label
                htmlFor="newsletter-email"
                className="mb-1 block text-sm font-medium"
              >
                Email address
              </label>
            )}
            <div
              className={`flex ${compact ? "flex-col sm:flex-row" : "flex-col"} gap-2`}
            >
              <input
                type="email"
                id="newsletter-email"
                placeholder="your@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="focus:ring-primary focus:border-primary w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:text-white"
                aria-describedby={error ? "newsletter-error" : undefined}
              />
              <button
                type="submit"
                disabled={loading}
                className={`btn ${dark ? "btn-light" : "btn-primary"} ${compact ? "w-full sm:w-auto" : "w-full"} flex items-center justify-center`}
              >
                {loading ? (
                  <>
                    <svg
                      className="mr-2 -ml-1 h-4 w-4 animate-spin text-current"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  buttonText
                )}
              </button>
            </div>
          </div>

          {error && (
            <div
              className="mt-2 text-sm text-red-500 dark:text-red-400"
              id="newsletter-error"
              role="alert"
              data-testid="error-message"
            >
              {error}
            </div>
          )}

          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            By subscribing, you agree to our{" "}
            <Link href="/privacy" className="hover:text-primary underline">
              Privacy Policy
            </Link>{" "}
            and consent to receive updates from us.
          </p>
        </form>
      )}
    </div>
  );
};
