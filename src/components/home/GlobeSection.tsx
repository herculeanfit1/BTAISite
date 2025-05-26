"use client";

import { styles } from "@/app/styles/home";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import Link from "next/link";

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

interface GlobeSectionProps {
  isDesktop: boolean;
}

/**
 * Globe Section Component
 * Displays a 3D globe visualization with content overlay
 */
export const GlobeSection = ({ isDesktop }: GlobeSectionProps) => {
  const { resolvedTheme } = useTheme();

  return (
    <section
      style={{
        padding: "5rem 1.5rem",
        width: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={styles.container}>
        <div
          style={{
            position: "relative",
            height: "500px",
            borderRadius: "1rem",
            overflow: "hidden",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        >
          {/* Background gradient */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, #3A5F77 0%, #9CAEB8 100%)",
              opacity: 0.15,
              zIndex: 0,
            }}
          ></div>

          {/* Globe Visualization */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 10,
            }}
          >
            <SimpleGlobe
              color={resolvedTheme === "dark" ? "#9CAEB8" : "#5B90B0"}
              wireframe={true}
              rotation={0.001}
              gridOpacity={0.6}
            />
          </div>

          {/* Content Overlay */}
          <div
            style={{
              position: "absolute",
              inset: "auto 0 0 0",
              zIndex: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "1.5rem",
              textAlign: "center",
            }}
          >
            <div
              style={{
                maxWidth: "42rem",
                backdropFilter: "blur(8px)",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                padding: "1.5rem",
                borderRadius: "0.75rem 0.75rem 0 0",
              }}
            >
              <p
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#5B90B0",
                  marginBottom: "0.5rem",
                }}
              >
                Our Global Impact
              </p>
              <h2
                style={{
                  fontSize: isDesktop ? "2.25rem" : "1.875rem",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                  lineHeight: 1.2,
                  color: resolvedTheme === "dark" ? "#F9FAFB" : "#111827",
                }}
              >
                Global AI Solutions Network
              </h2>
              <p
                style={{
                  marginBottom: "1.5rem",
                  fontSize: "1.125rem",
                  color: resolvedTheme === "dark" ? "#FCFCFC" : "#FCFCFC",
                  maxWidth: "36rem",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                We connect businesses around the world with trusted AI
                implementation strategies and technologies for sustainable
                growth.
              </p>
              <Link
                href="/about"
                style={{
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
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#2563EB";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#3B82F6";
                }}
              >
                Learn About Our Approach
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
