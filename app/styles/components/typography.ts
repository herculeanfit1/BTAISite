import { CSSProperties } from "react";

/**
 * Typography Styles
 *
 * This file contains all typography-related styles used throughout the application.
 * These styles are used for headings, paragraphs, and other text elements.
 *
 * All styles use direct inline properties with vendor prefixes for Safari compatibility.
 */
export const typographyStyles: Record<string, CSSProperties> = {
  // Headings
  heading1: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    marginBottom: "1rem",
    lineHeight: 1.2,
  },
  headingLarge: {
    fontSize: "3.5rem",
  },
  heading2: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "1.5rem",
    textAlign: "center",
    lineHeight: 1.2,
  },
  heading3: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    marginBottom: "1rem",
    lineHeight: 1.2,
  },
  subheading: {
    fontSize: "1.125rem",
    color: "#3B82F6",
    marginBottom: "1rem",
    fontWeight: "500",
  },

  // Paragraphs and text
  paragraph: {
    marginBottom: "1.25rem",
  },
  quoteText: {
    fontSize: "1.25rem",
    color: "#4B5563",
    fontStyle: "italic",
    lineHeight: 1.6,
  },

  // Footer typography
  footerHeading: {
    fontWeight: "bold",
    marginBottom: "1.5rem",
    fontSize: "1.25rem",
    lineHeight: 1.2,
    textAlign: "center",
    position: "relative",
    display: "inline-block",
    paddingBottom: "0.5rem",
  },
  copyright: {
    marginTop: "2rem",
    paddingTop: "2rem",
    borderTop: "1px solid #eaeaea",
    color: "#999",
    fontSize: "0.875rem",
    textAlign: "center",
    width: "100%",
    maxWidth: "600px",
  },

  // Specific component typography
  founderName: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center" as const,
    marginBottom: "0.5rem",
  },
  founderRole: {
    color: "#3B82F6",
    textAlign: "center" as const,
    marginBottom: "1rem",
  },
  founderBio: {
    color: "#4B5563",
    lineHeight: 1.6,
  },
  approachHeading: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "0.75rem",
  },
  contactInfoTitle: {
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "0.5rem",
  },
  contactInfoText: {
    color: "#4B5563",
  },
  ctaHeading: {
    color: "white",
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "1.5rem",
    lineHeight: 1.2,
  },
  ctaParagraph: {
    color: "#bbb",
    marginBottom: "1.25rem",
  },
};
