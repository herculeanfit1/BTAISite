"use client";

import { useState } from "react";

/**
 * Contact Section Component
 * Displays the contact form for visitors to reach out with Resend email integration
 */
export const ContactSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Convert FormData to JSON
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      company: formData.get('company') as string,
      message: formData.get('message') as string,
      _gotcha: formData.get('_gotcha') as string, // Honeypot field
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitResult({
          success: true,
          message: result.message || 'Thank you for your message! We\'ll get back to you soon.',
        });
        form.reset();
      } else {
        setSubmitResult({
          success: false,
          message: result.message || 'There was a problem sending your message. Please try again.',
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitResult({
        success: false,
        message: 'There was a problem connecting to our servers. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" style={{ padding: "5rem 1.5rem", backgroundColor: "#F8F9FA", width: "100%" }}>
      <div style={{ width: "100%", maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{ maxWidth: "56rem", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1.5rem", textAlign: "center", lineHeight: 1.2, color: "#111827" }}>
              Contact Us
            </h2>
            <p style={{ fontSize: "1.125rem", color: "#4B5563", maxWidth: "42rem", margin: "0 auto", lineHeight: 1.6 }}>
              Have questions or ready to start your AI journey? Fill out the form below and our team will get back to you promptly.
            </p>
          </div>

          <div style={{ background: "white", borderRadius: "1rem", padding: "2.5rem", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)", border: "1px solid #f3f4f6" }}>
            {submitResult && submitResult.success && (
              <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "0.5rem" }}>
                <p style={{ color: "#166534", fontWeight: "500" }}>
                  {submitResult.message}
                </p>
              </div>
            )}

            {submitResult && !submitResult.success && (
              <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "0.5rem" }}>
                <p style={{ color: "#DC2626", fontWeight: "500" }}>
                  {submitResult.message}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Honeypot field for bot protection */}
              <input
                type="text"
                name="_gotcha"
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
                <div>
                  <label htmlFor="firstName" style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#374151", marginBottom: "0.5rem" }}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid #D1D5DB", borderRadius: "0.5rem", fontSize: "1rem", transition: "all 0.2s ease", outline: "none" }}
                    placeholder="Enter your first name"
                    onFocus={(e) => e.target.style.borderColor = "#5B90B0"}
                    onBlur={(e) => e.target.style.borderColor = "#D1D5DB"}
                  />
                </div>

                <div>
                  <label htmlFor="lastName" style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#374151", marginBottom: "0.5rem" }}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid #D1D5DB", borderRadius: "0.5rem", fontSize: "1rem", transition: "all 0.2s ease", outline: "none" }}
                    placeholder="Enter your last name"
                    onFocus={(e) => e.target.style.borderColor = "#5B90B0"}
                    onBlur={(e) => e.target.style.borderColor = "#D1D5DB"}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="company" style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#374151", marginBottom: "0.5rem" }}>
                  Company Name
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid #D1D5DB", borderRadius: "0.5rem", fontSize: "1rem", transition: "all 0.2s ease", outline: "none" }}
                  placeholder="Enter your company name"
                  onFocus={(e) => e.target.style.borderColor = "#5B90B0"}
                  onBlur={(e) => e.target.style.borderColor = "#D1D5DB"}
                />
              </div>

              <div>
                <label htmlFor="email" style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#374151", marginBottom: "0.5rem" }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid #D1D5DB", borderRadius: "0.5rem", fontSize: "1rem", transition: "all 0.2s ease", outline: "none" }}
                  placeholder="Enter your email address"
                  onFocus={(e) => e.target.style.borderColor = "#5B90B0"}
                  onBlur={(e) => e.target.style.borderColor = "#D1D5DB"}
                />
              </div>

              <div>
                <label htmlFor="message" style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#374151", marginBottom: "0.5rem" }}>
                  What can we help you with? *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid #D1D5DB", borderRadius: "0.5rem", fontSize: "1rem", transition: "all 0.2s ease", outline: "none", resize: "vertical", minHeight: "120px" }}
                  placeholder="Tell us about your project or questions..."
                  onFocus={(e) => e.target.style.borderColor = "#5B90B0"}
                  onBlur={(e) => e.target.style.borderColor = "#D1D5DB"}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  backgroundColor: isSubmitting ? "#9CA3AF" : "#5B90B0",
                  color: "white",
                  padding: "0.875rem 1.5rem",
                  borderRadius: "0.5rem",
                  fontSize: "1rem",
                  fontWeight: "600",
                  border: "none",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  outline: "none"
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) e.target.style.backgroundColor = "#3A5F77";
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) e.target.style.backgroundColor = "#5B90B0";
                }}
              >
                {isSubmitting ? 'Sending Message...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
