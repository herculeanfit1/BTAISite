"use client";

import { useEffect } from "react";
import Script from "next/script";

// Add type definition for window.gtag
declare global {
  interface Window {
    gtag: (
      command: string,
      action: string,
      params?: Record<string, unknown> | string
    ) => void;
    dataLayer: unknown[];
  }
}

interface GoogleAnalyticsProps {
  GA_MEASUREMENT_ID?: string;
  nonce?: string;
}

const GoogleAnalytics = ({ GA_MEASUREMENT_ID, nonce }: GoogleAnalyticsProps) => {
  // Use provided ID or fallback
  // We're not directly accessing process.env in client component
  const measurementId = GA_MEASUREMENT_ID || "G-XXXXXXXXXX";

  useEffect(() => {
    // Check for user consent before initializing GA4
    let hasConsent = false;
    try {
      hasConsent = localStorage.getItem("cookieConsent") === "true";
    } catch (storageError) {
      // Handle localStorage not available
      console.warn(
        "Could not access localStorage for cookie consent",
        storageError
      );
    }

    // Initialize GA4 with consent mode
    if (typeof window !== "undefined" && window.gtag && hasConsent) {
      window.gtag("consent", "update", {
        analytics_storage: "granted",
      });
    }
  }, []);

  // Skip analytics in development or if no valid ID
  if (!measurementId || measurementId === "G-XXXXXXXXXX") {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        nonce={nonce}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            // Initialize with consent mode
            gtag('config', '${measurementId}', {
              'consent_mode': 'default',
              'ad_storage': 'denied',
              'analytics_storage': 'denied'
            });
          `,
        }}
      />
    </>
  );
};

export default GoogleAnalytics;
