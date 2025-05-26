import { CSSProperties } from "react";

/**
 * Safari-compatible styles using inline JavaScript objects
 *
 * These styles use:
 * - Direct inline styles without CSS modules for Safari compatibility
 * - Vendor prefixes like WebkitTransition for Safari
 * - Careful use of flexbox properties that work in Safari
 * - Optimized border-radius and box-shadow properties
 */
export const styles: Record<string, CSSProperties> = {
  // Layout components
  pageContainer: {
    fontFamily:
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    lineHeight: 1.5,
    color: "#1F1F25",
    width: "100%",
    minHeight: "100vh",
    WebkitTextSizeAdjust: "100%", // Safari-specific text size adjustment
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1.5rem",
    borderBottom: "1px solid #D8DADC",
    width: "100%",
  },
  logo: {
    fontSize: "2.52rem",
    fontWeight: "bold",
  },
  nav: {
    display: "none", // Hidden on mobile
  },
  navDesktop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    marginRight: "1.5rem",
  },
  navLink: {
    color: "#5B90B0",
    textDecoration: "none",
    marginLeft: "1.5rem",
    WebkitTapHighlightColor: "transparent", // Prevents tap highlight in Safari/iOS
  },

  // Button styles
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

  // Section styles
  hero: {
    padding: "5rem 1.5rem",
    textAlign: "center",
    width: "100%",
  },
  container: {
    width: "100%",
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "0 1.5rem",
  },

  // Typography
  heading1: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    marginBottom: "1rem",
    lineHeight: 1.2,
  },
  headingLarge: {
    fontSize: "3.5rem",
  },
  paragraph: {
    marginBottom: "1.25rem",
  },

  // Layout helpers
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

  // Features section
  features: {
    padding: "5rem 1.5rem",
    backgroundColor: "#F8F9FA",
    width: "100%",
  },
  heading2: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "1.5rem",
    textAlign: "center",
    lineHeight: 1.2,
  },
  grid: {
    display: "grid",
    gap: "2rem",
    gridTemplateColumns: "1fr", // Single column on mobile
  },
  gridDesktop: {
    gridTemplateColumns: "repeat(3, 1fr)", // Three columns on desktop
  },
  gridFooter: {
    gridTemplateColumns: "repeat(4, 1fr)",
  },
  card: {
    background: "white",
    borderRadius: "0.75rem",
    padding: "2rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #f3f4f6",
  },
  iconFeature: {
    width: "3rem",
    height: "3rem",
    borderRadius: "50%",
    backgroundColor: "#ebf5ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "1.5rem",
    color: "#3b82f6",
    fontWeight: "bold",
  },
  heading3: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    marginBottom: "1rem",
    lineHeight: 1.2,
  },

  // CTA section
  cta: {
    padding: "5rem 1.5rem",
    backgroundColor: "black",
    color: "white",
    textAlign: "center",
    width: "100%",
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

  // Form styles
  form: {
    maxWidth: "500px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
  },
  formRow: {
    flexDirection: "row",
    gap: "1rem",
  },
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

  // Contact section styles - renamed to avoid conflicts
  contactSection: {
    padding: "5rem 1.5rem",
    backgroundColor: "white",
    width: "100%",
  },
  contactContainer: {
    maxWidth: "48rem",
    margin: "0 auto",
  },
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
  contactInfoGrid: {
    display: "grid",
    gap: "1.5rem",
    gridTemplateColumns: "1fr",
    marginTop: "3rem",
  },
  contactInfoGridMd: {
    gridTemplateColumns: "repeat(3, 1fr)",
  },
  contactInfoCard: {
    padding: "1.5rem",
    backgroundColor: "#F9FAFB",
    borderRadius: "0.5rem",
  },
  contactInfoTitle: {
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "0.5rem",
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
  contactInfoText: {
    color: "#4B5563",
  },

  // Footer styles
  footer: {
    padding: "4rem 1.5rem 3rem",
    backgroundColor: "#f9fafb",
    width: "100%",
    textAlign: "center",
  },
  footerContent: {
    maxWidth: "800px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
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
  footerHeadingAccent: {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    height: "2px",
    width: "40px",
    backgroundColor: "#3b82f6",
    borderRadius: "2px",
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

  // Link styling
  featureLink: {
    color: "#5B90B0",
    fontSize: "0.875rem",
    textDecoration: "none",
    fontWeight: 600,
    display: "inline-block",
    marginTop: "1rem",
  },

  // About section styles
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
  subheading: {
    fontSize: "1.125rem",
    color: "#3B82F6",
    marginBottom: "1rem",
    fontWeight: "500",
  },
  missionBox: {
    padding: "2rem",
    backgroundColor: "#F9FAFB",
    borderRadius: "0.5rem",
    border: "1px solid #F3F4F6",
    marginBottom: "2rem",
  },
  quoteText: {
    fontSize: "1.25rem",
    color: "#4B5563",
    fontStyle: "italic",
    lineHeight: 1.6,
  },
  founderCard: {
    padding: "1.5rem",
    backgroundColor: "white",
    borderRadius: "0.5rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #F3F4F6",
  },
  profileImage: {
    width: "8rem",
    height: "8rem",
    borderRadius: "9999px",
    backgroundColor: "#E5E7EB",
    margin: "0 auto 1.5rem auto",
    overflow: "hidden",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
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
  approachCard: {
    padding: "1.5rem",
    backgroundColor: "#F9FAFB",
    borderRadius: "0.5rem",
  },
  approachHeading: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "0.75rem",
  },
};
