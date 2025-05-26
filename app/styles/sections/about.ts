import { CSSProperties } from "react";

/**
 * About Section Styles
 *
 * This file contains styles specific to the about section of the homepage.
 * All styles use direct inline properties with vendor prefixes for Safari compatibility.
 */
export const aboutStyles: Record<string, CSSProperties> = {
  // About section
  about: {
    padding: "5rem 1.5rem",
    backgroundColor: "white",
    width: "100%",
  },
  aboutContainer: {
    maxWidth: "64rem",
    margin: "0 auto",
  },
  sectionBlock: {
    marginBottom: "4rem",
  },
};
