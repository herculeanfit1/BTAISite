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

  // Prevent hydration mismatch by showing a fallback until mounted
  if (!isMounted) {
    return (
      <div
        style={{
          fontFamily:
            'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          lineHeight: 1.5,
          color: "#1F1F25",
          width: "100%",
          minHeight: "100vh",
          WebkitTextSizeAdjust: "100%",
        }}
      >
        {/* Hero Section */}
        <HeroSection />

        {/* Leveling the Playing Field Section */}
        <LevelingSection />

        {/* Features Section - default to mobile */}
        <FeaturesSection isDesktop={false} />

        {/* About Us Section - default to mobile */}
        <AboutSection isDesktop={false} />

        {/* Contact Section */}
        <ContactSection />
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily:
          'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        lineHeight: 1.5,
        color: "#1F1F25",
        width: "100%",
        minHeight: "100vh",
        WebkitTextSizeAdjust: "100%", // Safari-specific text size adjustment
      }}
    >
      {/* Hero Section */}
      <HeroSection />

      {/* Leveling the Playing Field Section */}
      <LevelingSection />

      {/* Features Section */}
      <FeaturesSection isDesktop={isDesktop} />

      {/* About Us Section */}
      <AboutSection isDesktop={isDesktop} />

      {/* Contact Section */}
      <ContactSection />
    </div>
  );
};
