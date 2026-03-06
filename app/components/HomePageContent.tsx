"use client";

import { useState, useEffect } from "react";
import { HeroSection } from "./home/HeroSection";
import { LevelingSection } from "./home/LevelingSection";
import { FeaturesSection } from "./home/FeaturesSection";
import { AboutSection } from "./home/AboutSection";
import { ContactSection } from "./home/ContactSection";

/**
 * HomePageContent Component
 *
 * Client component that handles responsive behavior for the homepage
 * Contains all sections with proper responsive breakpoint detection
 */
export const HomePageContent = () => {
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

  const wrapperProps = {
    className: "w-full min-h-screen text-gray-900 dark:text-gray-100",
    style: {
      fontFamily:
        'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      lineHeight: 1.5,
      WebkitTextSizeAdjust: "100%" as const,
    },
  };

  // Prevent hydration mismatch by showing a fallback until mounted
  if (!isMounted) {
    return (
      <div {...wrapperProps}>
        <HeroSection />
        <LevelingSection />
        <FeaturesSection isDesktop={false} />
        <AboutSection isDesktop={false} />
        <ContactSection />
      </div>
    );
  }

  return (
    <div {...wrapperProps}>
      <HeroSection />
      <LevelingSection />
      <FeaturesSection isDesktop={isDesktop} />
      <AboutSection isDesktop={isDesktop} />
      <ContactSection />
    </div>
  );
};
