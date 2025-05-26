"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./Button";

interface NewsletterSectionProps {
  title?: string;
  description?: string;
  className?: string;
  buttonText?: string;
}

export const NewsletterSection = ({
  title = "Stay Updated",
  description = "Subscribe to our newsletter for the latest insights on AI ethics, technology, and implementation best practices.",
  className = "",
  buttonText = "Subscribe",
}: NewsletterSectionProps) => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Here you would typically send the email to your API
    // For now, we'll just simulate success
    setSubscribed(true);
    setError("");
  };

  // Return a simple placeholder during SSR to prevent hydration issues
  if (!mounted) {
    return (
      <section className={`dark:bg-dark/50 bg-gray-50 py-20 ${className}`}>
        <div className="container">
          <div className="h-52"></div>
        </div>
      </section>
    );
  }

  return (
    <section className={`dark:bg-dark/50 bg-gray-50 py-20 ${className}`}>
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-300 dark:text-white">
            {title}
          </h2>
          <p className="mb-8 text-lg text-gray-700 dark:text-gray-300">
            {description}
          </p>

          {subscribed ? (
            <div className="rounded-lg bg-green-100 p-6 dark:bg-green-900/30">
              <p className="font-medium text-green-800 dark:text-green-200">
                Thank you for subscribing! We'll keep you updated with the
                latest news and insights.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mx-auto max-w-lg">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-grow">
                  <label htmlFor="email" className="sr-only">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="focus:ring-primary w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:ring-2 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:text-white"
                    required
                  />
                </div>
                <Button type="submit" className="px-6">
                  {buttonText}
                </Button>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
