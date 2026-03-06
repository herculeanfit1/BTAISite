"use client";

import Image from "next/image";
import { styles } from "@/app/styles/home";

interface AboutSectionProps {
  isDesktop: boolean;
}

/**
 * About Section Component
 * Displays company information, founders, and approach
 */
export const AboutSection = ({ isDesktop }: AboutSectionProps) => {
  return (
    <section id="about" style={styles.about}>
      <div style={styles.container}>
        <h2 style={styles.heading2}>About Us</h2>
        <div style={styles.aboutContainer}>
          {/* Origin Story */}
          <div style={styles.sectionBlock}>
            <h3 style={styles.heading3}>Our Story</h3>
            <p style={styles.paragraph}>
              Bridging Trust AI was founded on a straightforward observation: organizations are under enormous pressure to adopt AI, but most lack the governance, data readiness, and operational discipline to do it safely. Our founders bring decades of combined experience architecting secure, governed environments across Microsoft 365, Azure, and complex enterprise infrastructure. We started Bridging Trust AI to help organizations close the gap between AI ambition and operational reality — so they can adopt AI with confidence, not just enthusiasm.
            </p>
          </div>

          {/* Mission Section */}
          <div style={styles.sectionBlock}>
            <h3 style={styles.heading3}>Our Mission</h3>
            <div style={styles.missionBox}>
              <p style={styles.quoteText}>
                &ldquo;To help organizations adopt AI with the governance, security, and operational discipline needed to scale with confidence.&rdquo;
              </p>
            </div>
          </div>

          {/* Founders Section */}
          <div style={styles.sectionBlock}>
            <h3 style={styles.heading3}>Our Founders</h3>
            <div
              style={
                isDesktop
                  ? {
                      ...styles.grid,
                      ...styles.gridDesktop,
                      gridTemplateColumns: "repeat(2, 1fr)",
                      maxWidth: "100%",
                    }
                  : {
                      ...styles.grid,
                      maxWidth: "400px",
                      margin: "0 auto",
                      padding: "0 1rem",
                    }
              }
            >
              {/* Founder 1 - Bill (now first) */}
              <div style={{ ...styles.founderCard, maxWidth: "100%" }}>
                <div style={styles.profileImage}>
                  {/* Placeholder for Bill's image */}
                </div>
                <h3 style={styles.founderName}>Bill Schneider</h3>
                <p style={styles.founderRole}>
                  Co-Founder
                </p>
                <p style={{ ...styles.founderBio, textAlign: "center" }}>
                  Bill Schneider brings 25 years of IT leadership to Bridging Trust AI, with deep experience helping organizations align technology strategy with business outcomes. His expertise spans Microsoft 365, Azure, security architecture, and the operational governance that makes technology adoption sustainable. Bill&#39;s focus at Bridging Trust AI is on helping leadership teams navigate AI adoption with clarity — ensuring that governance, security, and practical implementation work together rather than in tension. He specializes in translating complex technical and compliance requirements into actionable roadmaps that leadership, IT, and security stakeholders can align around.
                </p>
              </div>

              {/* Founder 2 - Terence (now second) */}
              <div style={{ ...styles.founderCard, maxWidth: "100%" }}>
                <div style={styles.profileImage}>
                  <Image
                    src="/team/terence.kolstad.png"
                    alt="Terence Kolstad"
                    width={128}
                    height={128}
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                </div>
                <h3 style={styles.founderName}>Terence Kolstad</h3>
                <p style={styles.founderRole}>
                  Co-Founder
                </p>
                <p style={{ ...styles.founderBio, textAlign: "center" }}>
                  Terence Kolstad is a Minnesota-based technology strategist and AI governance advisor who helps organizations adopt AI with the structure, security, and data discipline needed to scale responsibly. With 18 years of experience designing, building, and securing cloud and on-premises environments, he brings a practical operator&#39;s perspective to AI readiness, Microsoft 365 governance, and secure modernization. His work sits at the intersection of AI governance, data governance, security, and Microsoft technologies — helping organizations evaluate risk, strengthen data foundations, and operationalize tools like Microsoft Copilot with confidence. As Co-Founder of Bridging Trust AI, he focuses on helping clients move beyond AI hype into governed execution — where innovation, productivity, and trust grow together.
                </p>
              </div>
            </div>
          </div>

          {/* Our Approach */}
          <div style={styles.sectionBlock}>
            <h3 style={styles.heading3}>Our Approach</h3>
            <div
              style={
                isDesktop
                  ? { ...styles.grid, ...styles.gridDesktop }
                  : styles.grid
              }
            >
              <div style={styles.approachCard}>
                <h4 style={{ ...styles.approachHeading, textAlign: "center" }}>
                  Governance-First
                </h4>
                <p style={{ textAlign: "center" }}>
                  Every engagement starts with understanding your risk posture, compliance requirements, and organizational readiness. We build the governance foundation before deploying capabilities.
                </p>
              </div>
              <div style={styles.approachCard}>
                <h4 style={{ ...styles.approachHeading, textAlign: "center" }}>
                  Security-Aligned
                </h4>
                <p style={{ textAlign: "center" }}>
                  AI adoption must work within your existing security and compliance framework, not around it. We align AI initiatives with your controls, policies, and regulatory obligations.
                </p>
              </div>
              <div style={styles.approachCard}>
                <h4 style={{ ...styles.approachHeading, textAlign: "center" }}>
                  Implementation-Ready
                </h4>
                <p style={{ textAlign: "center" }}>
                  We don&#39;t stop at strategy decks. Our work produces actionable frameworks, hardened configurations, and operational playbooks your team can execute and maintain.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
