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
    padding: "2rem 1.5rem", // Reduced padding since flexbox will handle centering
    textAlign: "center",
    width: "100%",
    minHeight: "70vh", // Ensure adequate height for the hero section
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
};
