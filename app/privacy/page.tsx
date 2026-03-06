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
    paddingTop: "6rem",
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
                <span style={styles.strong}>Last Updated:</span> March 6, 2026
              </p>
            </div>

            {/* Introduction */}
            <div style={styles.sectionBlock}>
              <h2 style={styles.heading2}>Introduction</h2>
              <p style={styles.text}>
                Bridging Trust AI LLC (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting your privacy and ensuring your experience on our website is secure and transparent.
              </p>
              <p style={styles.text}>
                This Privacy Policy explains how we collect, use, disclose, and safeguard the personal information you provide through our website and services.
              </p>
            </div>

            {/* Information We Collect */}
            <div style={styles.sectionBlock}>
              <h2 style={styles.heading2}>Information We Collect</h2>
              <h3 style={styles.heading3}>Information you provide directly</h3>
              <p style={styles.text}>
                We collect the following personal information when you submit our contact form: first name, last name, company name, email address, and any notes or description you provide to help us respond to your inquiry.
              </p>
              <h3 style={styles.heading3}>Information collected automatically</h3>
              <p style={styles.text}>
                When you visit our website, we may automatically collect certain technical information including your IP address (for rate limiting and security purposes), browser type, referring URL, and pages visited. We use Google Analytics to understand how visitors use our site. Google Analytics uses cookies and collects anonymized usage data in accordance with Google&#39;s privacy policy.
              </p>
              <h3 style={styles.heading3}>Information from service engagements</h3>
              <p style={styles.text}>
                During consulting engagements, clients may provide us with access to organizational data, configurations, documentation, or other materials necessary to deliver our services. The handling of such data is governed by the specific engagement agreement in place.
              </p>
            </div>

            {/* Use of Information */}
            <div style={styles.sectionBlock}>
              <h2 style={styles.heading2}>Use of Information</h2>
              <p style={styles.text}>
                We use the information we collect to:
              </p>
              <ul style={styles.list}>
                <li style={styles.listItem}>Respond to your inquiries and provide support</li>
                <li style={styles.listItem}>Deliver our consulting and advisory services</li>
                <li style={styles.listItem}>Share relevant information about our AI governance, data governance, and Microsoft AI enablement services</li>
                <li style={styles.listItem}>Improve our website functionality and user experience</li>
                <li style={styles.listItem}>Maintain security and prevent abuse (including rate limiting)</li>
                <li style={styles.listItem}>Comply with legal obligations</li>
              </ul>
              <p style={styles.text}>
                We do not sell your personal information to third parties.
              </p>
            </div>

            {/* Disclosure of Information */}
            <div style={styles.sectionBlock}>
              <h2 style={styles.heading2}>Disclosure of Information</h2>
              <p style={styles.text}>
                We may share your information in the following circumstances:
              </p>
              <ul style={styles.list}>
                <li style={styles.listItem}>
                  With service providers who perform services on our behalf (including our email delivery provider, Resend, for processing contact form submissions)
                </li>
                <li style={styles.listItem}>
                  To comply with legal obligations, court orders, or government requests
                </li>
                <li style={styles.listItem}>
                  To protect our rights, property, or safety, and the rights of others
                </li>
                <li style={styles.listItem}>
                  In connection with a business transaction, such as a merger, acquisition, or sale of assets, in which case you would be notified of any change in ownership or control of your personal information
                </li>
              </ul>
            </div>

            {/* Data Security */}
            <div style={styles.sectionBlock}>
              <h2 style={styles.heading2}>Data Security</h2>
              <p style={styles.text}>
                We implement reasonable administrative, technical, and physical safeguards to protect your information from unauthorized access, disclosure, alteration, or destruction. These measures include encrypted transmission (HTTPS/TLS), server-side input validation, rate limiting on form submissions, and bot protection mechanisms.
              </p>
              <p style={styles.text}>
                No method of electronic transmission or storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
              </p>
            </div>

            {/* Data Retention */}
            <div style={styles.sectionBlock}>
              <h2 style={styles.heading2}>Data Retention</h2>
              <p style={styles.text}>
                We retain contact form submissions and inquiry data for as long as necessary to respond to your inquiry and maintain our business relationship. Engagement-related data is retained in accordance with the terms of the applicable engagement agreement and our record retention practices. You may request deletion of your data at any time.
              </p>
            </div>

            {/* Your Rights */}
            <div style={styles.sectionBlock}>
              <h2 style={styles.heading2}>Your Rights</h2>
              <p style={styles.text}>
                Depending on your jurisdiction, you may have the following rights regarding your personal data:
              </p>
              <ul style={styles.list}>
                <li style={styles.listItem}><span style={styles.strong}>Access</span>: Request a copy of the personal data we hold about you</li>
                <li style={styles.listItem}><span style={styles.strong}>Correction</span>: Request correction of inaccurate or incomplete data</li>
                <li style={styles.listItem}><span style={styles.strong}>Deletion</span>: Request deletion of your personal data</li>
                <li style={styles.listItem}><span style={styles.strong}>Portability</span>: Request a copy of your data in a portable format</li>
                <li style={styles.listItem}><span style={styles.strong}>Objection</span>: Object to certain processing of your personal data</li>
              </ul>
              <p style={styles.text}>
                To exercise any of these rights, contact us using the information below. We will respond to your request within 30 days.
              </p>
            </div>

            {/* Children's Privacy */}
            <div style={styles.sectionBlock}>
              <h2 style={styles.heading2}>Children&#39;s Privacy</h2>
              <p style={styles.text}>
                Our website and services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children through our website.
              </p>
              <p style={styles.text}>
                Bridging Trust AI LLC also develops software products that may be used in educational contexts. Any such products that collect, process, or interact with data belonging to minors will maintain separate, product-specific privacy policies that comply with applicable children&#39;s privacy laws, including COPPA (Children&#39;s Online Privacy Protection Act) and relevant state regulations. Those product-specific privacy policies will be made available within the applicable product.
              </p>
              <p style={styles.text}>
                If you believe we have inadvertently collected personal information from a child through this website, please contact us immediately so we can promptly remove the information.
              </p>
            </div>

            {/* Third-Party Services */}
            <div style={styles.sectionBlock}>
              <h2 style={styles.heading2}>Third-Party Services</h2>
              <p style={styles.text}>
                Our website may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to review the privacy policies of any third-party services you access through our website.
              </p>
              <p style={styles.text}>
                We use the following third-party services:
              </p>
              <ul style={styles.list}>
                <li style={styles.listItem}><span style={styles.strong}>Google Analytics</span>: Website traffic analysis (anonymized data)</li>
                <li style={styles.listItem}><span style={styles.strong}>Resend</span>: Email delivery for contact form submissions</li>
                <li style={styles.listItem}><span style={styles.strong}>Azure Static Web Apps</span>: Website hosting (Microsoft)</li>
              </ul>
            </div>

            {/* International Data Transfers */}
            <div style={styles.sectionBlock}>
              <h2 style={styles.heading2}>International Data Transfers</h2>
              <p style={styles.text}>
                Our website is hosted in the United States. If you access our website from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States where our servers are located. By using our website, you consent to the transfer of your information to the United States.
              </p>
            </div>

            {/* Changes to This Privacy Policy */}
            <div style={styles.sectionBlock}>
              <h2 style={styles.heading2}>Changes to This Privacy Policy</h2>
              <p style={styles.text}>
                We may update this Privacy Policy from time to time, and we will post the revised version with the updated effective date on this page. We encourage you to review this Privacy Policy periodically for any changes.
              </p>
            </div>

            {/* Contact Us */}
            <div style={styles.sectionBlock}>
              <h2 style={styles.heading2}>Contact Us</h2>
              <p style={styles.text}>
                If you have any questions or concerns about this Privacy Policy, please contact us at privacy@bridgingtrust.ai.
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
