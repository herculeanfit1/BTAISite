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
              Bridging Trust AI began with a simple observation: the breakthroughs we delivered for global enterprises should not be reserved for organizations with nine-figure IT budgets. Drawing on decades of combined experience architecting secure, AI-enabled solutions for complex, highly regulated environments, our founders set out to translate that same caliber of innovation into pragmatic, right-sized programs for growth-minded companies.
            </p>
            <p style={styles.paragraph}>
              We have led large-scale transformations—modernizing data estates, automating business processes, and hardening cloud infrastructures—so we understand both the promise and the pitfalls of enterprise AI. Today, we package that institutional knowledge into streamlined engagements that remove the typical barriers of cost, complexity, and change-management risk.
            </p>
            <p style={styles.paragraph}>
              Our mission is straightforward: empower leadership teams to adopt AI with confidence, governance, and measurable ROI. Whether you're piloting Microsoft Copilot, evaluating ethical guardrails, or scaling a new AI-driven product, we bridge the gap between visionary strategy and operational reality—so your organization can compete at enterprise speed without losing its agility.
            </p>
          </div>

          {/* Mission Section */}
          <div style={styles.sectionBlock}>
            <h3 style={styles.heading3}>Our Mission</h3>
            <div style={styles.missionBox}>
              <p style={styles.quoteText}>
                "To make AI accessible and beneficial for everyone by bridging
                technical expertise with business needs, enabling smaller
                companies to compete effectively with industry giants."
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
                  Bill Schneider helps organizations unlock the potential of
                  technology. With 25 years of leadership in IT, he's an expert
                  in finding practical ways to streamline work, keep data safe,
                  and manage resources wisely. Bill's experience spans a range
                  of technologies—from Microsoft 365 and Azure to AI-driven
                  tools that empower teams to adapt and thrive.
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
                  Terence Kolstad is a Minnesota‑based IT strategist with 18
                  years of experience designing, building, and securing cloud
                  and on‑premises environments for mid‑market and enterprise
                  customers. As Lead Solutions Architect at Cyber Advisors, he
                  guides clients through Microsoft 365, Azure, and Veeam
                  transformations that harden security postures while unlocking
                  productivity.
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
                  Human-Centered
                </h4>
                <p style={{ textAlign: "center" }}>
                  We design AI solutions that complement human work, enhance
                  capabilities, and respect human values and judgment.
                </p>
              </div>
              <div style={styles.approachCard}>
                <h4 style={{ ...styles.approachHeading, textAlign: "center" }}>
                  Ethical & Transparent
                </h4>
                <p style={{ textAlign: "center" }}>
                  We prioritize explainable AI that stakeholders can understand,
                  trust, and verify, with clear frameworks for responsible use.
                </p>
              </div>
              <div style={styles.approachCard}>
                <h4 style={{ ...styles.approachHeading, textAlign: "center" }}>
                  Results-Driven
                </h4>
                <p style={{ textAlign: "center" }}>
                  Our solutions are designed with clear business outcomes in
                  mind, focused on delivering measurable value and competitive
                  advantage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
