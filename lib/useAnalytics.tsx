"use client";

import { useCallback } from "react";
import { analytics } from "./analytics";

export function useAnalytics() {
  // Track a custom event
  const trackEvent = useCallback(
    (eventName: string, properties?: Record<string, any>) => {
      analytics.track(eventName, properties);
    },
    [],
  );

  // Identify a user
  const identifyUser = useCallback(
    (userId: string, traits?: Record<string, any>) => {
      analytics.identify(userId, traits);
    },
    [],
  );

  // Reset user tracking
  const resetUser = useCallback(() => {
    analytics.reset();
  }, []);

  // Convenience method to track form submission events
  const trackFormSubmission = useCallback(
    (formName: string, formData?: Record<string, any>) => {
      analytics.track("form_submitted", {
        form_name: formName,
        ...formData,
      });
    },
    [],
  );

  // Convenience method to track button click events
  const trackButtonClick = useCallback(
    (buttonName: string, properties?: Record<string, any>) => {
      analytics.track("button_clicked", {
        button_name: buttonName,
        ...properties,
      });
    },
    [],
  );

  // Convenience method to track page engagement
  const trackEngagement = useCallback(
    (
      action: "scroll_depth" | "time_on_page" | "content_viewed",
      value: number | string,
      properties?: Record<string, any>,
    ) => {
      analytics.track("engagement", {
        action,
        value,
        ...properties,
      });
    },
    [],
  );

  return {
    trackEvent,
    identifyUser,
    resetUser,
    trackFormSubmission,
    trackButtonClick,
    trackEngagement,
  };
}
