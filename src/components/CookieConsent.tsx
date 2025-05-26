"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "./Button";

interface CookieConsentProps {
  className?: string;
}

export const CookieConsent = ({ className = "" }: CookieConsentProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem("cookieConsent");
    if (!hasConsented) {
      // Show the banner after a short delay
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "true");
    setIsVisible(false);

    // Initialize GA4 if it exists
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "granted",
      });
    }
  };

  const declineCookies = () => {
    localStorage.setItem("cookieConsent", "false");
    setIsVisible(false);

    // Deny GA4 consent if it exists
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "denied",
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`dark:bg-dark fixed right-0 bottom-0 left-0 z-50 bg-white p-4 shadow-lg md:p-6 ${className}`}
    >
      <div className="container flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-700 md:text-base dark:text-gray-300">
            This website uses cookies to enhance your experience and analyze
            site traffic. See our{" "}
            <Link href="/privacy" className="link">
              Privacy Policy
            </Link>{" "}
            for more information.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="secondary"
            size="sm"
            onClick={declineCookies}
            className="order-2 sm:order-1"
          >
            Decline
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={acceptCookies}
            className="order-1 sm:order-2"
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};
