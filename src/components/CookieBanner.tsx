"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { CookieConsent } from "./CookieConsent";

export default function CookieBanner() {
  useEffect(() => {
    // This component only runs on the client side
  }, []);

  // Find the container element in the DOM and create a portal to it
  const containerElement =
    typeof document !== "undefined"
      ? document.getElementById("cookie-consent-container")
      : null;

  if (!containerElement) return null;

  // Render the CookieConsent component into the portal
  return createPortal(<CookieConsent />, containerElement);
}
