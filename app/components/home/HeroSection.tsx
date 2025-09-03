"use client";

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
  return (
    <section style={{ ...heroStyles.hero, backgroundColor: "#3A5F77" }}>
      <div style={layoutStyles.overlay}></div>
      <div style={layoutStyles.container}>
        <h1
          style={{
            ...typographyStyles.heading1,
            ...typographyStyles.headingLarge,
            color: "white",
          }}
        >
          Making AI accessible and beneficial for everyone
        </h1>
        <p
          style={{
            ...typographyStyles.paragraph,
            color: "#E5E7EB",
            maxWidth: "800px",
            margin: "0 auto 2rem auto",
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
