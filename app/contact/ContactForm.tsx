"use client";

import { useState, FormEvent } from "react";
import { Button } from "../components/Button";
import { useAnalytics } from "../../lib/useAnalytics";
import { logger } from "../../lib/logger";
import Link from "next/link";

interface FormState {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  companyEmail: string;
  phone: string;
  message: string;
  aiKnowledgeLevel: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  message?: string;
}

const ContactForm = () => {
  const { trackFormSubmission, trackButtonClick } = useAnalytics();
  const [formState, setFormState] = useState<FormState>({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    companyEmail: "",
    phone: "",
    message: "",
    aiKnowledgeLevel: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formState.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formState.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formState.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formState.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formState.message.trim()) {
      newErrors.message = "Please share your amazing idea with us";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (
      Object.prototype.hasOwnProperty.call(errors, name as keyof FormErrors)
        ? Object.prototype.hasOwnProperty.call(errors, name as keyof FormErrors)
          ? Object.prototype.hasOwnProperty.call(
              errors,
              name as keyof FormErrors
            )
            ? Object.prototype.hasOwnProperty.call(
                errors,
                name as keyof FormErrors
              )
              ? Object.prototype.hasOwnProperty.call(
                  errors,
                  name as keyof FormErrors
                )
                ? Object.prototype.hasOwnProperty.call(
                    errors,
                    name as keyof FormErrors
                  )
                  ? Object.prototype.hasOwnProperty.call(
                      errors,
                      name as keyof FormErrors
                    )
                    ? errors[name as keyof FormErrors]
                    : undefined
                  : undefined
                : undefined
              : undefined
            : undefined
          : undefined
        : undefined
    ) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Track validation errors
      trackFormSubmission("contact_form", {
        status: "validation_error",
        errors: Object.keys(errors),
      });
      logger.warn("Contact form validation failed", { errors });
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit to API endpoint
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${formState.firstName} ${formState.lastName}`,
          email: formState.email,
          company: formState.company,
          phone: formState.phone,
          companyEmail: formState.companyEmail,
          message: formState.message,
          aiKnowledgeLevel: formState.aiKnowledgeLevel,
          recipient: "sales@bridgingtrust.ai",
        }),
      });

      // Track successful form submission
      trackFormSubmission("contact_form", {
        status: "success",
        has_company: !!formState.company.trim(),
        message_length: formState.message.length,
      });

      logger.info("Contact form submitted successfully", {
        email: formState.email,
        hasCompany: !!formState.company.trim(),
      });

      setIsSubmitted(true);
      setFormState({
        firstName: "",
        lastName: "",
        company: "",
        email: "",
        companyEmail: "",
        phone: "",
        message: "",
        aiKnowledgeLevel: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);

      // Track form submission error
      trackFormSubmission("contact_form", {
        status: "error",
      });

      logger.error("Contact form submission failed", {
        error: error instanceof Error ? error.message : String(error),
      });

      alert("There was an error submitting your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendAnother = () => {
    trackButtonClick("send_another_message");
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-900/20">
        <svg
          className="mx-auto mb-4 h-12 w-12 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
          Thank You!
        </h3>
        <p className="mb-4 text-gray-600 dark:text-gray-300">
          Your message has been received. Our team will get back to you as soon
          as possible.
        </p>
        <Button variant="secondary" onClick={handleSendAnother}>
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="firstName"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formState.firstName}
            onChange={handleChange}
            className={`focus:ring-primary focus:border-primary dark:focus:ring-accent dark:focus:border-accent w-full rounded-md border bg-white p-3 text-gray-900 focus:ring-2 dark:bg-gray-800 dark:text-white ${
              errors.firstName
                ? "border-red-500 dark:border-red-500"
                : "border-gray-300 dark:border-gray-700"
            }`}
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? "firstName-error" : undefined}
          />
          {errors.firstName && (
            <p id="firstName-error" className="mt-1 text-sm text-red-500">
              {errors.firstName}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formState.lastName}
            onChange={handleChange}
            className={`focus:ring-primary focus:border-primary dark:focus:ring-accent dark:focus:border-accent w-full rounded-md border bg-white p-3 text-gray-900 focus:ring-2 dark:bg-gray-800 dark:text-white ${
              errors.lastName
                ? "border-red-500 dark:border-red-500"
                : "border-gray-300 dark:border-gray-700"
            }`}
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? "lastName-error" : undefined}
          />
          {errors.lastName && (
            <p id="lastName-error" className="mt-1 text-sm text-red-500">
              {errors.lastName}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="company"
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Company Name
        </label>
        <input
          type="text"
          id="company"
          name="company"
          value={formState.company}
          onChange={handleChange}
          className="focus:ring-primary focus:border-primary dark:focus:ring-accent dark:focus:border-accent w-full rounded-md border border-gray-300 bg-white p-3 text-gray-900 focus:ring-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formState.email}
          onChange={handleChange}
          className={`focus:ring-primary focus:border-primary dark:focus:ring-accent dark:focus:border-accent w-full rounded-md border bg-white p-3 text-gray-900 focus:ring-2 dark:bg-gray-800 dark:text-white ${
            errors.email
              ? "border-red-500 dark:border-red-500"
              : "border-gray-300 dark:border-gray-700"
          }`}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <p id="email-error" className="mt-1 text-sm text-red-500">
            {errors.email}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="companyEmail"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Company Email (Optional)
          </label>
          <input
            type="email"
            id="companyEmail"
            name="companyEmail"
            value={formState.companyEmail}
            onChange={handleChange}
            className="focus:ring-primary focus:border-primary dark:focus:ring-accent dark:focus:border-accent w-full rounded-md border border-gray-300 bg-white p-3 text-gray-900 focus:ring-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formState.phone}
            onChange={handleChange}
            className="focus:ring-primary focus:border-primary dark:focus:ring-accent dark:focus:border-accent w-full rounded-md border border-gray-300 bg-white p-3 text-gray-900 focus:ring-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="aiKnowledgeLevel"
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Current AI Knowledge Level
        </label>
        <select
          id="aiKnowledgeLevel"
          name="aiKnowledgeLevel"
          value={formState.aiKnowledgeLevel}
          onChange={handleChange}
          className="focus:ring-primary focus:border-primary dark:focus:ring-accent dark:focus:border-accent w-full rounded-md border border-gray-300 bg-white p-3 text-gray-900 focus:ring-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="">-- Select your knowledge level --</option>
          <option value="beginner">Beginner - What is AI? 🤷</option>
          <option value="intermediate">
            Intermediate - This stuff is cool, but I don't know what I don't
            know. 🧐
          </option>
          <option value="advanced">
            Advanced - I am full on drinking the Kool-Aid! 😁
          </option>
        </select>
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          What amazing idea will we create together?{" "}
          <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={formState.message}
          onChange={handleChange}
          className={`focus:ring-primary focus:border-primary dark:focus:ring-accent dark:focus:border-accent w-full rounded-md border bg-white p-3 text-gray-900 focus:ring-2 dark:bg-gray-800 dark:text-white ${
            errors.message
              ? "border-red-500 dark:border-red-500"
              : "border-gray-300 dark:border-gray-700"
          }`}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        {errors.message && (
          <p id="message-error" className="mt-1 text-sm text-red-500">
            {errors.message}
          </p>
        )}
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        <p>
          By submitting this form, you agree to our{" "}
          <Link href="/coming-soon" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      <div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <svg
                className="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Sending...
            </>
          ) : (
            "Send Message"
          )}
        </Button>
      </div>
    </form>
  );
};

export default ContactForm;
