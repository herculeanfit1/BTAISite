import { CSSProperties } from "react";

/**
 * CTA Section Styles
 *
 * This file contains styles specific to call-to-action sections.
 * All styles use direct inline properties with vendor prefixes for Safari compatibility.
 */
export const ctaStyles: Record<string, CSSProperties> = {
  // CTA section
  cta: {
    padding: "5rem 1.5rem",
    backgroundColor: "black",
    color: "white",
    textAlign: "center",
    width: "100%",
  },

  // Form styles for the CTA
  input: {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "0.375rem",
    border: "none",
    backgroundColor: "#333",
    color: "white",
    marginBottom: "1rem",
    WebkitAppearance: "none", // Safari-specific input styling
    appearance: "none",
  },
};
