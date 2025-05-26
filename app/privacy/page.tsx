import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import type { CSSProperties } from "react";

export const metadata: Metadata = {
  title: "Privacy Policy | Bridging Trust AI",
  description:
    "Learn about how Bridging Trust AI handles your data and protects your privacy.",
};

/**
 * Safari-compatible styles using inline JavaScript objects
 * These match the same styling approach used on the homepage
 */
const styles: Record<string, CSSProperties> = {
  // Layout components
  pageContainer: {
    fontFamily:
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    lineHeight: 1.5,
    color: "#333",
    width: "100%",
    minHeight: "100vh",
    backgroundColor: "white",
    paddingBottom: "4rem",
    WebkitTextSizeAdjust: "100%",
  },

  // Header section
  headerSection: {
    padding: "3rem 1.5rem",
    textAlign: "center" as const,
    width: "100%",
  },
  container: {
    width: "100%",
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "0 1.5rem",
  },
  heading1: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    marginBottom: "1rem",
    lineHeight: 1.2,
    color: "#111827",
  },
  paragraph: {
    fontSize: "1.125rem",
    color: "#4B5563",
    marginBottom: "1.5rem",
    maxWidth: "64rem",
    margin: "0 auto 1.5rem",
  },

  // Main content
  mainSection: {
    padding: "3rem 1.5rem",
    backgroundColor: "white",
    width: "100%",
  },
  contentContainer: {
    maxWidth: "64rem",
    margin: "0 auto",
  },

  // Section blocks
  sectionBlock: {
    marginBottom: "3rem",
  },
  heading2: {
    fontSize: "1.875rem",
    fontWeight: "bold",
    marginBottom: "1.5rem",
    color: "#111827",
    lineHeight: 1.2,
  },
  heading3: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "1rem",
    color: "#111827",
    lineHeight: 1.2,
  },
  text: {
    fontSize: "1.125rem",
    color: "#4B5563",
    marginBottom: "1.5rem",
    lineHeight: 1.6,
  },

  // List
  list: {
    listStyleType: "disc",
    paddingLeft: "1.5rem",
    color: "#4B5563",
    marginBottom: "2rem",
    lineHeight: 1.6,
  },
  listItem: {
    marginBottom: "1rem",
  },
  strong: {
    fontWeight: "600",
  },

  // Back link
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    marginTop: "2rem",
    textDecoration: "none",
    color: "#3B82F6",
    fontWeight: "500",
    fontSize: "1.125rem",
  },
  arrow: {
    marginRight: "0.5rem",
  },
};

const PrivacyPage = () => {
  return (
    <div style={styles.pageContainer}>
      {/* Header Section */}
      <div
        style={{
          ...styles.headerSection,
          backgroundColor: "#3A5F77",
          position: "relative",
        }}
      >
        <div style={styles.container}>
          <h1 style={{ ...styles.heading1, color: "#ffffff" }}>
            Privacy Policy
          </h1>
          <p
            style={{
              ...styles.paragraph,
              maxWidth: "48rem",
              margin: "0 auto 1.5rem",
              color: "#ffffff",
            }}
          >
            At Bridging Trust AI, we take your privacy seriously. This policy
            explains how we collect, use, and protect your information.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <section style={styles.mainSection}>
        <div style={styles.container}>
          <div style={styles.contentContainer}>
            {/* Last Updated */}
            <div style={styles.sectionBlock}>
              <p style={styles.text}>
                <span style={styles.strong}>Last Updated:</span> March 1, 2025
              </p>
            </div>

            {/* Introduction */}
            <div style={styles.sectionBlock}>
              <h2 style={styles.heading2}>Introduction</h2>
              <p style={styles.text}>
                Bridging Trust AI LLC ("we," "us," or "our") is committed to
                protecting your privacy and ensuring your experience on our
                website is secure and transparent.
              </p>
              <p style={styles.text}>
                This Privacy Policy explains how we collect, use, disclose, and
                safeguard the personal information you provide through our
                contact form.
              </p>
            </div>

            {/* Information We Collect */}
            <div style={styles.sectionBlock}>
              <h2 style={styles.heading2}>Information We Collect</h2>
              <p style={styles.text}>
                We only collect the following personal information when you
                submit our contact form: first name, last name, company name,
                email address, and any notes or description you provide to help
                us respond to your inquiry.
              </p>
            </div>

            {/* How We Use Your Information */}
            <div style={styles.sectionBlock}>
              <h2 style={styles.heading2}>Use of Information</h2>
              <p style={styles.text}>
                We use the information you provide solely to respond to your
                inquiries, provide support, and share relevant information about
                our IT consulting and app development services.
              </p>
            </div>

            {/* Disclosure of Your Information */}
            <div style={styles.sectionBlock}>
              <h2 style={styles.heading2}>Disclosure of Information</h2>
              <p style={styles.text}>
                We may share your information in the following circumstances:
              </p>
              <ul style={styles.list}>
                <li style={styles.listItem}>
                  With service providers who perform services on our behalf
                </li>
                <li style={styles.listItem}>
                  To comply with legal obligations
                </li>
                <li style={styles.listItem}>
                  To protect our rights and the rights of others
                </li>
                <li style={styles.listItem}>
                  In connection with a business transaction, such as a merger or
                  acquisition
                </li>
              </ul>
            </div>

            {/* Data Security */}
            <div style={styles.sectionBlock}>
              <h2 style={styles.heading2}>Data Security</h2>
              <p style={styles.text}>
                We implement reasonable administrative, technical, and physical
                safeguards to protect your information from unauthorized access,
                disclosure, alteration, or destruction.
              </p>
            </div>

            {/* Your Rights */}
            <div style={styles.sectionBlock}>
              <h2 style={styles.heading2}>Your Rights</h2>
              <p style={styles.text}>
                You may request access to, correction of, or deletion of your
                personal data at any time by contacting us using the information
                below.
              </p>
            </div>

            {/* Children's Privacy */}
            <div style={styles.sectionBlock}>
              <h2 style={styles.heading2}>Children's Privacy</h2>
              <p style={styles.text}>
                Our services are not directed to individuals under the age of
                18. We do not knowingly collect personal information from
                children. If you believe we have collected personal information
                from a child, please contact us so we can promptly remove the
                information.
              </p>
            </div>

            {/* Changes to This Privacy Policy */}
            <div style={styles.sectionBlock}>
              <h2 style={styles.heading2}>Changes to This Privacy Policy</h2>
              <p style={styles.text}>
                We may update this Privacy Policy from time to time, and we will
                post the revised version with the updated effective date on this
                page.
              </p>
            </div>

            {/* Contact Us */}
            <div style={styles.sectionBlock}>
              <h2 style={styles.heading2}>Contact Us</h2>
              <p style={styles.text}>
                If you have any questions or concerns about this Privacy Policy,
                please contact us at privacy@bridgingtrustai.com.
              </p>
            </div>

            {/* Back to Home Link */}
            <div>
              <Link href="/" style={styles.backLink}>
                <span style={styles.arrow}>←</span> Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPage;
