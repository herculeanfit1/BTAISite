import { CSSProperties } from "react";

/**
 * Button Styles
 *
 * This file contains all button and interactive element styles.
 * These styles use Safari-compatible properties with vendor prefixes where needed.
 */
export const buttonStyles: Record<string, CSSProperties> = {
  // Base button
  button: {
    display: "inline-block",
    padding: "0.75rem 1.5rem",
    borderRadius: "0.375rem",
    fontWeight: 500,
    textAlign: "center" as const,
    cursor: "pointer",
    WebkitTransition: "all 0.2s ease", // Safari-specific transition
    transition: "all 0.2s ease",
    border: "1px solid transparent",
    backgroundColor: "transparent",
  },

  // Button variants
  buttonPrimary: {
    backgroundColor: "#5B90B0",
    color: "#FCFCFC",
  },
  buttonOutline: {
    backgroundColor: "transparent",
    borderColor: "#BFC5C8",
    color: "#1F1F25",
  },
  buttonWhite: {
    backgroundColor: "#FCFCFC",
    color: "#3A5F77",
  },

  // Button containers
  buttonContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
  },
  buttonContainerRow: {
    flexDirection: "row",
    justifyContent: "center",
  },

  // Link styles
  navLink: {
    color: "#5B90B0",
    textDecoration: "none",
    marginLeft: "1.5rem",
    WebkitTapHighlightColor: "transparent", // Prevents tap highlight in Safari/iOS
  },
  featureLink: {
    color: "#5B90B0",
    fontSize: "0.875rem",
    textDecoration: "none",
    fontWeight: 600,
    display: "inline-block",
    marginTop: "1rem",
  },
  footerLink: {
    display: "inline-block",
    margin: "0 0.75rem 0.75rem",
    padding: "0.25rem 0.5rem",
    color: "#666",
    textDecoration: "none",
    transition: "color 0.2s ease",
    borderRadius: "4px",
  },
  footerLinkHover: {
    color: "#3b82f6",
    backgroundColor: "rgba(59, 130, 246, 0.05)",
  },
  contactInfoLink: {
    color: "#3B82F6",
    textDecoration: "none",
    WebkitTransition: "text-decoration 0.2s ease",
    transition: "text-decoration 0.2s ease",
  },
  contactInfoLinkHover: {
    textDecoration: "underline",
  },
};
