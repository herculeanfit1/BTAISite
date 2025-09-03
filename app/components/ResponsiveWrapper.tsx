"use client";

import { useState, useEffect, ReactNode } from "react";

interface ResponsiveWrapperProps {
  children: (isDesktop: boolean) => ReactNode;
}

/**
 * ResponsiveWrapper Component
 * 
 * Provides responsive breakpoint detection for child components
 * Handles window resize events and provides isDesktop state
 */
export const ResponsiveWrapper = ({ children }: ResponsiveWrapperProps) => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Initial check on load
      setIsDesktop(window.innerWidth >= 768);
      setIsMounted(true);

      // Handler for window resize events
      const handleResize = () => {
        setIsDesktop(window.innerWidth >= 768);
      };

      // Attach the event listener
      window.addEventListener("resize", handleResize);

      // Clean up the event listener on component unmount
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return null;
  }

  return <>{children(isDesktop)}</>;
};
