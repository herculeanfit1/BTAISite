"use client";

import { useState } from "react";
import { styles } from "@/app/styles/home";

interface ContactSectionProps {
  isDesktop: boolean;
}

/**
 * Contact Section Component
 * Displays the contact form for visitors to reach out with Formspree integration
 */
export const ContactSection = ({ isDesktop }: ContactSectionProps) => {
  // Form submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      // Using Formspree for static site contact forms
      const response = await fetch('https://formspree.io/f/xdkogqpb', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setSubmitResult({
          success: true,
          message: "Thank you for your message! We'll get back to you soon.",
        });
        form.reset();
      } else {
        setSubmitResult({
          success: false,
          message: "Something went wrong. Please try again.",
        });
      }
    } catch (err) {
      // Handle network or connection errors
      setSubmitResult({
        success: false,
        message: "There was a problem connecting to our servers. Please try again later.",
      });
      console.error("Contact form submission error:", err);
    }

    setIsSubmitting(false);
  };

  // Custom button style with brand gradient
  const buttonStyle = {
    ...styles.button,
    background: "linear-gradient(90deg, #3A5F77 0%, #5B90B0 100%)",
    color: "white",
    fontWeight: 500,
    padding: "0.75rem 1.5rem",
    borderRadius: "0.375rem",
    border: "none",
    cursor: isSubmitting ? "not-allowed" : "pointer",
    opacity: isSubmitting ? 0.7 : 1,
    transition: "all 0.2s ease-in-out",
  };

  return (
    <section id="contact" style={styles.contactSection}>
      <div style={styles.container}>
        <h2 style={styles.heading2}>Contact Us</h2>
        <div
          style={{
            ...styles.contactContainer,
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          <p style={styles.paragraph}>
            Have questions or ready to start your AI journey? Fill out the form
            below and our team will get back to you promptly. The contact form
            is the best way to reach our team.
          </p>

          {/* Contact Form with Formspree integration */}
          {submitResult && (
            <div
              style={{
                padding: "1rem",
                borderRadius: "0.375rem",
                marginBottom: "1.5rem",
                backgroundColor: submitResult.success
                  ? "rgba(52, 211, 153, 0.1)"
                  : "rgba(239, 68, 68, 0.1)",
                borderLeft: `4px solid ${submitResult.success ? "#34D399" : "#EF4444"}`,
              }}
            >
              {submitResult.message}
            </div>
          )}

          <form
            style={{ ...styles.contactForm, width: "100%" }}
            onSubmit={handleSubmit}
          >
            {/* Honeypot field for bot detection - hidden from users */}
            <input
              type="text"
              name="_gotcha"
              style={{ display: "none" }}
              tabIndex={-1}
              autoComplete="off"
            />

            <div
              style={{
                ...styles.contactFormRow,
                ...(isDesktop ? styles.contactFormRowMd : {}),
              }}
            >
              <div style={styles.contactFormField}>
                <label htmlFor="firstName" style={styles.contactLabel}>
                  First Name <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  style={styles.contactInput}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div style={styles.contactFormField}>
                <label htmlFor="lastName" style={styles.contactLabel}>
                  Last Name <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  style={styles.contactInput}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div style={styles.contactFormField}>
              <label htmlFor="company" style={styles.contactLabel}>
                Company Name
              </label>
              <input
                type="text"
                id="company"
                name="company"
                style={styles.contactInput}
                disabled={isSubmitting}
              />
            </div>

            <div style={styles.contactFormField}>
              <label htmlFor="email" style={styles.contactLabel}>
                Email Address <span style={styles.required}>*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                style={styles.contactInput}
                required
                disabled={isSubmitting}
              />
            </div>

            <div style={styles.contactFormField}>
              <label htmlFor="message" style={styles.contactLabel}>
                What can we help you with?{" "}
                <span style={styles.required}>*</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                style={styles.contactTextarea}
                required
                disabled={isSubmitting}
              ></textarea>
            </div>

            <div>
              <button type="submit" style={buttonStyle} disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
