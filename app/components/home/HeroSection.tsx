"use client";

import { useState, useEffect } from "react";
import { heroStyles } from "@/app/styles/sections/hero";
import { typographyStyles } from "@/app/styles/components/typography";
import { layoutStyles } from "@/app/styles/components/layout";
import { buttonStyles } from "@/app/styles/components/buttons";

/**
 * HeroSection Component
 *
 * The main banner with headline for the homepage.
 *
 * @returns {JSX.Element} The rendered hero section
 */
export const HeroSection = () => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDesktop(window.innerWidth >= 768);
      
      const handleResize = () => {
        setIsDesktop(window.innerWidth >= 768);
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const heroStyle = isDesktop ? heroStyles.heroDesktop : heroStyles.hero;

  return (
    <section style={{ ...heroStyle, backgroundColor: "#3A5F77" }}>
      <div style={layoutStyles.overlay}></div>
      <div style={layoutStyles.container}>
        <h1
          style={{
            ...typographyStyles.heading1,
            ...typographyStyles.headingLarge,
            color: "white",
            marginBottom: isDesktop ? "2rem" : "1.5rem", // More spacing on desktop
            maxWidth: isDesktop ? "900px" : "100%", // Wider text container on desktop
            lineHeight: isDesktop ? 1.3 : 1.2, // Better line height on desktop
          }}
        >
          Making AI accessible and beneficial for everyone
        </h1>
        <p
          style={{
            ...typographyStyles.paragraph,
            color: "#E5E7EB",
            maxWidth: isDesktop ? "700px" : "100%", // Responsive max width
            margin: isDesktop ? "0 auto 3rem auto" : "0 auto 2rem auto", // More bottom margin on desktop
            fontSize: isDesktop ? "1.25rem" : "1rem", // Larger text on desktop
            lineHeight: 1.6,
            paddingLeft: isDesktop ? "2rem" : "0", // Extra horizontal padding on desktop
            paddingRight: isDesktop ? "2rem" : "0",
          }}
        >
          We bridge the gap between advanced AI technology and human-centered
          implementation.
        </p>
        <div
          style={{
            ...buttonStyles.buttonContainer,
            ...buttonStyles.buttonContainerRow,
          }}
        >
          <a
            href="#contact"
            style={{ ...buttonStyles.button, ...buttonStyles.buttonWhite }}
          >
            Get Started
          </a>
        </div>
      </div>
    </section>
  );
};
