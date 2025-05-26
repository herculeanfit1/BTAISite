import { CSSProperties } from "react";

/**
 * Contact Section Styles
 *
 * This file contains styles specific to the contact section of the homepage.
 * All styles use direct inline properties with vendor prefixes for Safari compatibility.
 */
export const contactStyles: Record<string, CSSProperties> = {
  // Contact section
  contactSection: {
    padding: "5rem 1.5rem",
    backgroundColor: "white",
    width: "100%",
  },
  contactContainer: {
    maxWidth: "48rem",
    margin: "0 auto",
  },

  // Contact form
  contactForm: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.5rem",
    marginBottom: "3rem",
  },
  contactFormRow: {
    display: "grid",
    gap: "1.5rem",
    gridTemplateColumns: "1fr",
  },
  contactFormRowMd: {
    gridTemplateColumns: "repeat(2, 1fr)",
  },
  contactFormField: {
    display: "flex",
    flexDirection: "column" as const,
    marginBottom: "0",
  },
  contactLabel: {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "0.25rem",
  },
  required: {
    color: "#EF4444",
  },

  // Contact inputs
  contactInput: {
    width: "100%",
    padding: "0.75rem",
    borderRadius: "0.375rem",
    border: "1px solid #D1D5DB",
    fontSize: "1rem",
    color: "#111827",
    backgroundColor: "white",
    WebkitAppearance: "none",
  },
  contactTextarea: {
    width: "100%",
    padding: "0.75rem",
    borderRadius: "0.375rem",
    border: "1px solid #D1D5DB",
    fontSize: "1rem",
    color: "#111827",
    backgroundColor: "white",
    minHeight: "8rem",
    resize: "vertical" as const,
    WebkitAppearance: "none",
  },

  // Contact info grid
  contactInfoGrid: {
    display: "grid",
    gap: "1.5rem",
    gridTemplateColumns: "1fr",
    marginTop: "3rem",
  },
  contactInfoGridMd: {
    gridTemplateColumns: "repeat(3, 1fr)",
  },
};
