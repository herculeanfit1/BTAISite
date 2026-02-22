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
    <section id="contact" className="w-full bg-gray-50 dark:bg-gray-800 py-20 px-6">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-center text-3xl font-bold leading-tight text-gray-900 dark:text-gray-100">
              Contact Us
            </h2>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              Have questions or ready to start your AI journey? Fill out the form below and our team will get back to you promptly.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 p-10 shadow-md">
            {submitResult && submitResult.success && (
              <div className="mb-6 rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 p-4">
                <p className="font-medium text-green-800 dark:text-green-300">
                  {submitResult.message}
                </p>
              </div>
            )}

            {submitResult && !submitResult.success && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4">
                <p className="font-medium text-red-600 dark:text-red-400">
                  {submitResult.message}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Honeypot field for bot protection */}
              <input
                type="text"
                name="_gotcha"
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-base text-gray-900 dark:text-gray-100 outline-none transition-all duration-200 focus:border-[#5B90B0] focus:ring-1 focus:ring-[#5B90B0]"
                    placeholder="Enter your first name"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-base text-gray-900 dark:text-gray-100 outline-none transition-all duration-200 focus:border-[#5B90B0] focus:ring-1 focus:ring-[#5B90B0]"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="company" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Company Name
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-base text-gray-900 dark:text-gray-100 outline-none transition-all duration-200 focus:border-[#5B90B0] focus:ring-1 focus:ring-[#5B90B0]"
                  placeholder="Enter your company name"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-base text-gray-900 dark:text-gray-100 outline-none transition-all duration-200 focus:border-[#5B90B0] focus:ring-1 focus:ring-[#5B90B0]"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  What can we help you with? *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  className="w-full min-h-[120px] resize-y rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-base text-gray-900 dark:text-gray-100 outline-none transition-all duration-200 focus:border-[#5B90B0] focus:ring-1 focus:ring-[#5B90B0]"
                  placeholder="Tell us about your project or questions..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full rounded-lg px-6 py-3.5 text-base font-semibold text-white border-none outline-none transition-all duration-200 ${
                  isSubmitting
                    ? "cursor-not-allowed bg-gray-400"
                    : "cursor-pointer bg-[#5B90B0] hover:bg-[#3A5F77]"
                }`}
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
