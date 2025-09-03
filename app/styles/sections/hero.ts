import { CSSProperties } from "react";

/**
 * Hero Section Styles
 *
 * This file contains styles specific to the hero section of the homepage.
 * All styles use direct inline properties with vendor prefixes for Safari compatibility.
 */
export const heroStyles: Record<string, CSSProperties> = {
  // Main hero section with flexbox centering
  hero: {
    paddingTop: "8rem", // Increased mobile top padding for better spacing
    paddingBottom: "0.6rem", // Reduced bottom padding by 50% (1.2rem -> 0.6rem)
    paddingLeft: "1.5rem",
    paddingRight: "1.5rem",
    textAlign: "center",
    width: "100%",
    minHeight: "70vh", // Ensure adequate height for the hero section
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  
  // Desktop-specific hero styles
  heroDesktop: {
    paddingTop: "2rem", // Increased desktop top padding for better balance
    paddingBottom: "0.6rem",
    paddingLeft: "4rem", // Increased horizontal padding for desktop
    paddingRight: "4rem", // Increased horizontal padding for desktop
    textAlign: "center",
    width: "100%",
    minHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
};
