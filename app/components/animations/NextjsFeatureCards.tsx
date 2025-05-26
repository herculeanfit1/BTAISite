"use client";

import React, { useState } from "react";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

/**
 * Next.js Feature Cards Component
 *
 * Displays a set of feature cards highlighting Next.js and React capabilities.
 * Cards have a hover effect to provide an interactive experience.
 */
export const NextjsFeatureCards: React.FC = () => {
  const features: FeatureCardProps[] = [
    {
      icon: "⚡",
      title: "Server Components",
      description:
        "Next.js 15 Server Components enable faster page loads with zero client-side JavaScript by default.",
    },
    {
      icon: "🔄",
      title: "Incremental Static Regeneration",
      description:
        "Update static content after deployment without rebuilding your entire site.",
    },
    {
      icon: "📱",
      title: "Automatic Image Optimization",
      description:
        "Resize, optimize, and serve images in modern formats for optimal performance.",
    },
    {
      icon: "🌐",
      title: "Edge Runtime",
      description:
        "Deploy globally and execute code at the edge, closer to your users for better performance.",
    },
  ];

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "1.5rem",
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "2rem 0",
      }}
    >
      {features.map((feature, index) => (
        <div
          key={index}
          style={{
            backgroundColor: hoveredIndex === index ? "#f4f9ff" : "white",
            borderRadius: "0.75rem",
            padding: "1.5rem",
            boxShadow:
              hoveredIndex === index
                ? "0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1)"
                : "0 1px 3px rgba(0, 0, 0, 0.1)",
            transition: "all 0.2s ease",
            border: "1px solid",
            borderColor: hoveredIndex === index ? "#bfdbfe" : "#f3f4f6",
            transform: hoveredIndex === index ? "translateY(-4px)" : "none",
          }}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div
            style={{
              fontSize: "2.5rem",
              marginBottom: "1rem",
            }}
          >
            {feature.icon}
          </div>
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: 600,
              marginBottom: "0.75rem",
              color: "#1F1F25",
            }}
          >
            {feature.title}
          </h3>
          <p
            style={{
              color: "#4B5563",
              lineHeight: 1.6,
            }}
          >
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
};
