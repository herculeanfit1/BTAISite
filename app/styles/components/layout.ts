import { CSSProperties } from "react";

/**
 * Layout Styles
 *
 * This file contains layout-related styles for containers, grids,
 * and general page structure elements.
 *
 * All styles use direct inline properties with vendor prefixes for Safari compatibility.
 */
export const layoutStyles: Record<string, CSSProperties> = {
  // Page layout
  pageContainer: {
    fontFamily:
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    lineHeight: 1.5,
    color: "#1F1F25",
    width: "100%",
    minHeight: "100vh",
    WebkitTextSizeAdjust: "100%", // Safari-specific text size adjustment
  },

  // Standard container
  container: {
    width: "100%",
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "0 1.5rem",
  },

  // Header and navigation
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

  // Grid layouts
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

  // Cards and containers
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
  missionBox: {
    padding: "2rem",
    backgroundColor: "#F9FAFB",
    borderRadius: "0.5rem",
    border: "1px solid #F3F4F6",
    marginBottom: "2rem",
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
  approachCard: {
    padding: "1.5rem",
    backgroundColor: "#F9FAFB",
    borderRadius: "0.5rem",
  },
  contactInfoCard: {
    padding: "1.5rem",
    backgroundColor: "#F9FAFB",
    borderRadius: "0.5rem",
  },

  // Footer layout
  footerContent: {
    maxWidth: "800px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
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

  // Forms and inputs
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
};
