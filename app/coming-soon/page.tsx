"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { styles } from "@/app/styles/home";
import { VercelInspiredAnimation } from "../components/animations/VercelInspiredAnimation";

/**
 * ComingSoonPage Component
 *
 * This component creates a Safari-compatible Coming Soon page for the Bridging Trust AI site.
 * It uses the same styling system as the home page for consistency.
 * The component is responsive, with different layouts for mobile and desktop.
 *
 * @returns {JSX.Element} Rendered component
 */
export default function ComingSoonPage() {
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
    <div style={styles.pageContainer}>
      {/* Main Content with animation */}
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "#F8F9FA",
        }}
      >
        {/* Hero section with animation */}
        <section
          style={{
            padding: "4rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            textAlign: "center",
          }}
        >
          <div style={styles.container}>
            <h1
              style={{
                ...styles.heading1,
                ...(isDesktop ? styles.headingLarge : {}),
                fontSize: isDesktop ? "4rem" : "2.5rem",
                marginBottom: "2rem",
                color: "#5B90B0",
              }}
            >
              Coming Soon
            </h1>

            {/* Vercel-inspired animation */}
            <div
              style={{
                width: "100%",
                maxWidth: "800px",
                margin: "0 auto 3rem auto",
                height: isDesktop ? "500px" : "300px",
              }}
            >
              <VercelInspiredAnimation
                width={isDesktop ? 800 : 300}
                height={isDesktop ? 500 : 300}
              />
            </div>

            <p
              style={{
                fontSize: "1.25rem",
                maxWidth: "800px",
                margin: "0 auto 3rem auto",
                lineHeight: 1.6,
              }}
            >
              We're working hard to bring you something amazing. <br />
              This page is currently under development. Stay tuned for updates
              from Bridging Trust AI.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: isDesktop ? "row" : "column",
                gap: "1rem",
                justifyContent: "center",
                marginBottom: "4rem",
              }}
            >
              <Link
                href="/"
                style={{
                  ...styles.button,
                  ...styles.buttonPrimary,
                  backgroundColor: "#5B90B0",
                  textDecoration: "none",
                }}
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Removed since we're using the shared layout */}
    </div>
  );
}
