"use client";

import { useState, useEffect } from "react";

// Import refactored components
import { HeroSection } from "./components/home/HeroSection";
import { LevelingSection } from "./components/home/LevelingSection";
import { FeaturesSection } from "./components/home/FeaturesSection";
import { GlobeOverlaySection } from "./components/home/GlobeOverlaySection";
import { AboutSection } from "./components/home/AboutSection";
import { ContactSection } from "./components/home/ContactSection";

/**
 * HomePage Component
 *
 * This component creates the main homepage for the Bridging Trust AI site.
 * It uses modular components for each section of the page.
 *
 * @returns {JSX.Element} Rendered homepage
 */
export default function HomePage() {
  // Track whether the current viewport is desktop width (>=768px)
  const [isDesktop, setIsDesktop] = useState(false);

  /**
   * Setup responsive behavior and screen size detection
   * This effect runs once on component mount
   */
  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window !== "undefined") {
      // Initial check on load
      setIsDesktop(window.innerWidth >= 768);

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

      {/* Globe Section */}
      <GlobeOverlaySection />

      {/* About Us Section */}
      <AboutSection isDesktop={isDesktop} />

      {/* Contact Section */}
      <ContactSection />
    </div>
  );
}
