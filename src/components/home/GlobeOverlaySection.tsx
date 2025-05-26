"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Route } from "next";

// Dynamically import the SimpleGlobe component
const SimpleGlobe = dynamic(
  () =>
    import("../globe/SimpleGlobe").then((mod) => ({
      default: mod.SimpleGlobe,
    })),
  {
    ssr: false,
    loading: () => (
      <div style={{ height: "500px", backgroundColor: "#f9fafb" }}></div>
    ),
  }
);

/**
 * GlobeOverlaySection Component
 *
 * Displays a 3D globe visualization with text overlay.
 * Uses dynamic import to prevent server-side rendering issues with WebGL.
 *
 * @returns {JSX.Element} The rendered globe section
 */
export const GlobeOverlaySection = () => {
  // Styles for the section
  const sectionStyles = {
    padding: "5rem 1.5rem",
    width: "100%",
    position: "relative" as const,
    overflow: "hidden" as const,
  };

  // Styles for the container
  const containerStyles = {
    width: "100%",
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "0 1.5rem",
  };

  // Styles for the globe container
  const globeContainerStyles = {
    position: "relative" as const,
    height: "500px",
    borderRadius: "1rem",
    overflow: "hidden" as const,
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  };

  // Styles for the background gradient
  const gradientStyles = {
    position: "absolute" as const,
    inset: 0,
    background: "linear-gradient(90deg, #3A5F77 0%, #9CAEB8 100%)",
    opacity: 0.15,
    zIndex: 0,
  };

  // Styles for the globe visualization
  const globeStyles = {
    position: "absolute" as const,
    inset: 0,
    zIndex: 10,
  };

  // Styles for the content overlay
  const overlayStyles = {
    position: "absolute" as const,
    inset: "auto 0 0 0",
    zIndex: 20,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    padding: "1.5rem",
    textAlign: "center" as const,
  };

  // Styles for the content box
  const contentBoxStyles = {
    maxWidth: "42rem",
    backdropFilter: "blur(8px)",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: "1.5rem",
    borderRadius: "0.75rem 0.75rem 0 0",
  };

  // Styles for the primary caption
  const captionStyles = {
    fontSize: "2.25rem",
    fontWeight: 500,
    color: "#5B90B0",
    marginBottom: "0.5rem",
  };

  // Styles for the secondary headline
  const headlineStyles = {
    fontSize: "1.41rem",
    fontWeight: "bold",
    marginBottom: "1rem",
    lineHeight: 1.2,
    color: "#111827",
  };

  // Styles for the description
  const descriptionStyles = {
    marginBottom: "1.5rem",
    fontSize: "1.125rem",
    color: "#FCFCFC",
    maxWidth: "36rem",
    marginLeft: "auto",
    marginRight: "auto",
  };

  // Styles for the link button
  const buttonStyles = {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.75rem 1.5rem",
    border: "1px solid transparent",
    borderRadius: "0.375rem",
    fontWeight: 500,
    backgroundColor: "#5B90B0",
    color: "white",
    textDecoration: "none",
    transition: "background-color 0.3s ease",
    cursor: "pointer",
  };

  return (
    <section style={sectionStyles}>
      <div style={containerStyles}>
        <div style={globeContainerStyles}>
          {/* Background gradient */}
          <div style={gradientStyles}></div>

          {/* Globe Visualization */}
          <div style={globeStyles}>
            <SimpleGlobe
              color="#5B90B0"
              wireframe={true}
              rotation={0.001}
              gridOpacity={0.6}
            />
          </div>

          {/* Content Overlay */}
          <div style={overlayStyles}>
            <div style={contentBoxStyles}>
              {/* Primary caption - large size */}
              <p style={captionStyles}>AI Without Borders</p>
              {/* Secondary headline - medium size */}
              <h2 style={headlineStyles}>
                Scalable Solutions, Universal Impact
              </h2>
              <p style={descriptionStyles}>
                We deliver trusted AI strategies that scale from regional
                operations to worldwide expansion—helping your business unlock
                sustainable growth wherever opportunity arises.
              </p>
              <Link href={"/#solutions" as Route<string>} style={buttonStyles}>
                Explore Our Solutions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
