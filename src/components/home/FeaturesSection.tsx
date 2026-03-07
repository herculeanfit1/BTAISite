"use client";

import Link from "next/link";
import { styles } from "@/app/styles/home";
import { features } from "@/app/data/features";

interface FeaturesSectionProps {
  isDesktop: boolean;
}

/**
 * Features Section Component
 * Cards highlighting key services
 */
export const FeaturesSection = ({ isDesktop }: FeaturesSectionProps) => {
  return (
    <section id="solutions" style={styles.features}>
      <div style={styles.container}>
        <h2 style={styles.heading2}>What We Do</h2>
        <div
          style={{
            display: "grid",
            gap: "2rem",
            gridTemplateColumns: isDesktop ? "repeat(3, 1fr)" : "1fr",
          }}
        >
          {features.map((feature) => (
            <div key={feature.id} style={styles.card}>
              <div style={styles.iconFeature}>{feature.icon}</div>
              <h3 style={styles.heading3}>{feature.title}</h3>
              <p style={styles.paragraph}>{feature.description}</p>
              <ul style={{ listStyleType: "disc", paddingLeft: "1.25rem", margin: "0.75rem 0 0 0", lineHeight: 1.6, color: "#4B5563", fontSize: "0.95rem" }}>
                {feature.bullets.map((bullet) => (
                  <li key={bullet} style={{ marginBottom: "0.35rem" }}>{bullet}</li>
                ))}
              </ul>
              {feature.link && (
                <Link href={feature.link} style={{ display: "inline-flex", alignItems: "center", marginTop: "1.25rem", color: "#5B90B0", fontWeight: 500 }}>
                  Learn more &rarr;
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
