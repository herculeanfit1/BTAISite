"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";

type EventName = string;
type EventProperties = Record<string, unknown>;

// Define analytics providers
type AnalyticsProvider = {
  init: () => void;
  pageView: (url: string, referrer?: string) => void;
  track: (name: EventName, properties?: EventProperties) => void;
  identify: (userId: string, traits?: Record<string, unknown>) => void;
  reset: () => void;
};

// Google Analytics provider
const googleAnalyticsProvider: AnalyticsProvider = {
  init: () => {
    // This is handled by the script loading
  },

  pageView: (url: string, referrer?: string) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "page_view", {
        page_location: url,
        page_referrer: referrer || document.referrer,
      });
    }
  },

  track: (name: EventName, properties?: EventProperties) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", name, properties);
    }
  },

  identify: (userId: string, traits?: Record<string, unknown>) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("set", "user_properties", {
        user_id: userId,
        ...traits,
      });
    }
  },

  reset: () => {
    if (
      typeof window !== "undefined" &&
      window.gtag &&
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    ) {
      // Reset user data
      window.gtag("config", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        user_id: undefined,
      });
    }
  },
};

// Mock analytics provider for development and testing
const mockAnalyticsProvider: AnalyticsProvider = {
  init: () => {
    console.log("[Mock Analytics] Initialized");
  },
  pageView: (url: string) => {
    console.log(`[Mock Analytics] Page view: ${url}`);
  },
  track: (name: EventName, properties?: EventProperties) => {
    console.log(`[Mock Analytics] Event: ${name}`, properties || {});
  },
  identify: (userId: string, traits?: Record<string, unknown>) => {
    console.log(`[Mock Analytics] Identify user: ${userId}`, traits || {});
  },
  reset: () => {
    console.log("[Mock Analytics] Reset user data");
  },
};

// Get the appropriate provider based on environment
const getProvider = (): AnalyticsProvider => {
  // In production, use Google Analytics
  if (process.env.NODE_ENV === "production") {
    return googleAnalyticsProvider;
  }

  // In development or test, use the mock provider
  return mockAnalyticsProvider;
};

// Create analytics instance
const analyticsProvider = getProvider();

// Create and export analytics functions
export const analytics = {
  /**
   * Initialize analytics
   */
  init: () => {
    analyticsProvider.init();
  },

  /**
   * Track page view
   */
  pageView: (url: string, referrer?: string) => {
    analyticsProvider.pageView(url, referrer);
  },

  /**
   * Track event
   */
  track: (name: EventName, properties?: EventProperties) => {
    analyticsProvider.track(name, properties);
  },

  /**
   * Identify user
   */
  identify: (userId: string, traits?: Record<string, unknown>) => {
    analyticsProvider.identify(userId, traits);
  },

  /**
   * Reset user tracking data
   */
  reset: () => {
    analyticsProvider.reset();
  },
};

// Analytics component that tracks page views
export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isProduction = process.env.NODE_ENV === "production";
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  // Track page views
  useEffect(() => {
    if (pathname) {
      const url =
        window.location.origin +
        pathname +
        (searchParams?.toString() ? `?${searchParams.toString()}` : "");
      analytics.pageView(url);
    }
  }, [pathname, searchParams]);

  // Only include script in production
  if (!isProduction || !gaId) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
              anonymize_ip: true,
              cookie_flags: 'SameSite=None;Secure'
            });
          `,
        }}
      />
    </>
  );
}

// Override the global Window interface instead of redeclaring it
declare global {
  interface Window {
    // Use a specific function type for gtag
    gtag: (
      command: string,
      action: string,
      params?: string | Record<string, unknown>,
    ) => void;
    dataLayer: unknown[];
  }
}
