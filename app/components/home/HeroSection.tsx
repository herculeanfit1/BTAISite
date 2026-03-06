"use client";

import { useState, useEffect } from "react";

/**
 * HeroSection Component
 *
 * The main banner with headline for the homepage.
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

  return (
    <section
      className="bg-[#3A5F77] dark:bg-[#2A4A5C] w-full text-center flex flex-col justify-center items-center"
      style={{
        paddingTop: isDesktop ? "2rem" : "8rem",
        paddingBottom: "0.6rem",
        paddingLeft: isDesktop ? "4rem" : "1.5rem",
        paddingRight: isDesktop ? "4rem" : "1.5rem",
        minHeight: "70vh",
      }}
    >
      <div className="absolute inset-0 opacity-10"></div>
      <div className="w-full max-w-[1280px] mx-auto px-6">
        <h1
          className="font-extrabold leading-[1.05] text-center mx-auto w-full mt-0 mb-6 sm:mb-8 text-white"
          style={{
            fontSize: "clamp(2rem, 8vw, 4rem)",
            textWrap: "balance",
            maxWidth: isDesktop ? "900px" : "100%",
          }}
        >
          AI is moving faster than governance. We help you close the gap.
        </h1>
        <p
          className="text-gray-200 dark:text-gray-300 text-center"
          style={{
            maxWidth: isDesktop ? "700px" : "100%",
            margin: isDesktop ? "0 auto 3rem auto" : "0 auto 2rem auto",
            fontSize: isDesktop ? "1.25rem" : "1rem",
            lineHeight: 1.6,
            paddingLeft: isDesktop ? "2rem" : "0",
            paddingRight: isDesktop ? "2rem" : "0",
          }}
        >
          Bridging Trust AI helps organizations govern, secure, and
          operationalize AI — with deep expertise across Microsoft 365, Copilot,
          Purview, Azure, and the security and compliance frameworks that make
          adoption defensible.
        </p>
        <div className="flex flex-row justify-center items-center gap-4">
          <a
            href="#contact"
            className="inline-block px-6 py-3 rounded-md font-medium text-center cursor-pointer transition-all duration-200 bg-white dark:bg-gray-100 text-[#3A5F77] hover:bg-gray-100 dark:hover:bg-white"
          >
            Book a Governance Assessment
          </a>
        </div>
      </div>
    </section>
  );
};
