import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import type { CSSProperties } from "react";

export const metadata: Metadata = {
  title: "Terms of Service | Bridging Trust AI",
  description:
    "The terms and conditions governing your use of Bridging Trust AI services.",
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

const TermsPage = () => {
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
            Terms of Service
          </h1>
          <p
            style={{
              ...styles.paragraph,
              maxWidth: "48rem",
              margin: "0 auto 1.5rem",
              color: "#ffffff",
            }}
          >
            Please read these terms carefully before using our services.
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
                These Terms of Service ("Terms") govern your access to and use
                of the Bridging Trust AI LLC website and services.
              </p>
              <p style={styles.text}>
                By accessing or using our website, you agree to be bound by
                these Terms.
              </p>
            </div>

            {/* Services */}
            <div style={styles.sectionBlock}>
              <h2 style={styles.heading2}>Services</h2>
              <p style={styles.text}>
                We provide IT consulting and app development services as
                described on our website.
              </p>
            </div>

            {/* User Obligations */}
            <div style={styles.sectionBlock}>
              <h2 style={styles.heading2}>User Obligations</h2>
              <p style={styles.text}>
                You agree to provide accurate information when using our contact
                form and not to misuse our services in any way.
              </p>
            </div>

            {/* User Content */}
            <div style={styles.sectionBlock}>
              <h2 style={styles.heading2}>User Content</h2>
              <p style={styles.text}>
                By providing information, data, or other content to Bridging
                Trust AI LLC, you grant us a non-exclusive, royalty-free,
                worldwide, perpetual, and irrevocable right to use, process, and
                store such content for the purpose of providing our services to
                you.
              </p>
              <p style={styles.text}>
                You represent and warrant that you own or have the necessary
                rights to all content you provide and that such content does not
                violate the rights of any third party, including intellectual
                property rights, privacy rights, or publicity rights.
              </p>
            </div>

            {/* Intellectual Property */}
            <div style={styles.sectionBlock}>
              <h2 style={styles.heading2}>Intellectual Property</h2>
              <p style={styles.text}>
                All content and materials on the site, including text, graphics,
                logos, and software, are the property of Bridging Trust AI LLC
                or our licensors and are protected by applicable intellectual
                property laws.
              </p>
              <p style={styles.text}>
                Materials provided during the provision of our services are
                licensed to you for the duration of our engagement, unless
                otherwise specified in a separate agreement. You may not
                distribute, modify, transmit, reuse, download, repost, copy, or
                use such materials, whether in whole or in part, for commercial
                purposes or for personal gain, without express advance written
                permission from us.
              </p>
            </div>

            {/* Payments and Billing */}
            <div style={styles.sectionBlock}>
              <h2 style={styles.heading2}>Payments and Billing</h2>
              <p style={styles.text}>
                Fees for our services will be outlined in a separate agreement
                or proposal. Unless otherwise specified, all fees are quoted in
                U.S. dollars and are non-refundable.
              </p>
              <p style={styles.text}>
                You agree to provide current, complete, and accurate purchase
                and account information for all purchases made through our
                website. You further agree to promptly update account and
                payment information, including email address, payment method,
                and payment card expiration date, so that we can complete your
                transactions and contact you as needed.
              </p>
            </div>

            {/* Limitation of Liability */}
            <div style={styles.sectionBlock}>
              <h2 style={styles.heading2}>Limitation of Liability</h2>
              <p style={styles.text}>
                To the maximum extent permitted by applicable law, Bridging
                Trust AI LLC shall not be liable for any indirect, incidental,
                special, or consequential damages arising out of or in
                connection with your use of our services.
              </p>
              <p style={styles.text}>
                Our liability shall be limited to the maximum extent permitted
                by law, and shall not exceed the amount you paid to us over the
                12 months preceding the claim or $1,000, whichever is greater.
              </p>
            </div>

            {/* Disclaimer */}
            <div style={styles.sectionBlock}>
              <h2 style={styles.heading2}>Disclaimer</h2>
              <p style={styles.text}>
                Your use of our services is at your sole risk. Our services are
                provided on an "AS IS" and "AS AVAILABLE" basis. We expressly
                disclaim all warranties of any kind, whether express or implied,
                including but not limited to the implied warranties of
                merchantability, fitness for a particular purpose, and
                non-infringement.
              </p>
              <p style={styles.text}>
                We make no warranty that our services will meet your
                requirements, be available on an uninterrupted, timely, secure,
                or error-free basis, or that the results that may be obtained
                from the use of our services will be accurate or reliable.
              </p>
            </div>

            {/* Governing Law */}
            <div style={styles.sectionBlock}>
              <h2 style={styles.heading2}>Governing Law</h2>
              <p style={styles.text}>
                These Terms shall be governed by and construed in accordance
                with the laws of the State of Minnesota, without regard to
                conflict of law principles.
              </p>
            </div>

            {/* Changes to Terms */}
            <div style={styles.sectionBlock}>
              <h2 style={styles.heading2}>Changes to These Terms</h2>
              <p style={styles.text}>
                We reserve the right to modify these Terms at any time, and we
                will post the updated version with the new effective date on our
                website.
              </p>
            </div>

            {/* Contact */}
            <div style={styles.sectionBlock}>
              <h2 style={styles.heading2}>Contact Us</h2>
              <p style={styles.text}>
                If you have any questions about these Terms, please contact us
                at legal@bridgingtrustai.com.
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

export default TermsPage;
