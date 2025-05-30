"use client";

import { styles } from "@/app/styles/home";
import { features } from "@/app/data/features";
import Link from "next/link";

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
        <h2 style={styles.heading2}>Our Solutions</h2>
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
              <Link href={feature.link} style={styles.featureLink}>
                Learn more →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
