"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { isValidEmail } from "@/src/lib/validation";

const INTEREST_OPTIONS = [
  { value: "", label: "Select an option (optional)" },
  { value: "governance-assessment", label: "AI Governance Readiness Assessment" },
  { value: "data-readiness", label: "Data Readiness Assessment" },
  { value: "copilot-readiness", label: "Copilot Readiness Review" },
  { value: "general", label: "General Inquiry" },
] as const;

function validateField(name: string, value: string): string {
  const v = value.trim();
  switch (name) {
    case "firstName":
      if (!v || v.length < 2 || v.length > 50)
        return "First name is required (2-50 characters)";
      return "";
    case "lastName":
      if (!v || v.length < 2 || v.length > 50)
        return "Last name is required (2-50 characters)";
      return "";
    case "email":
      if (!v || !isValidEmail(v)) return "Please enter a valid email address";
      return "";
    case "company":
      if (v.length > 100) return "Company name is too long (max 100 characters)";
      return "";
    case "message":
      if (!v || v.length < 10 || v.length > 2000)
        return "Message must be between 10 and 2000 characters";
      return "";
    default:
      return "";
  }
}

const REQUIRED_FIELDS = ["firstName", "lastName", "email", "message"];

function inputBorderClass(
  fieldName: string,
  touched: Record<string, boolean>,
  errors: Record<string, string>,
  value: string,
): string {
  if (touched[fieldName] && errors[fieldName])
    return "border-red-500 dark:border-red-400";
  if (touched[fieldName] && !errors[fieldName] && value)
    return "border-green-500 dark:border-green-400";
  return "border-gray-300 dark:border-gray-600";
}

const INPUT_BASE =
  "w-full rounded-lg bg-white dark:bg-gray-800 px-4 py-3 text-base text-gray-900 dark:text-gray-100 outline-none transition-all duration-200 focus:border-[#5B90B0] focus:ring-1 focus:ring-[#5B90B0]";

/**
 * Contact Section Component
 * Displays the contact form with inline validation and Resend email integration
 */
export const ContactSection = () => {
  const searchParams = useSearchParams();
  const [interest, setInterest] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Field values for controlled validation
  const [values, setValues] = useState<Record<string, string>>({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    message: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const param = searchParams?.get("interest");
    if (param && INTEREST_OPTIONS.some((o) => o.value === param)) {
      setInterest(param);
    }
  }, [searchParams]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setValues((prev) => ({ ...prev, [name]: value }));
      if (touched[name]) {
        setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
      }
    },
    [touched],
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    },
    [],
  );

  const isFormValid =
    REQUIRED_FIELDS.every((f) => values[f]?.trim()) &&
    !REQUIRED_FIELDS.some((f) => validateField(f, values[f] || ""));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitResult(null);

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    const allErrors: Record<string, string> = {};
    for (const name of REQUIRED_FIELDS) {
      allTouched[name] = true;
      allErrors[name] = validateField(name, values[name] || "");
    }
    // Also validate optional company
    allTouched.company = true;
    allErrors.company = validateField("company", values.company || "");

    setTouched((prev) => ({ ...prev, ...allTouched }));
    setFieldErrors((prev) => ({ ...prev, ...allErrors }));

    if (Object.values(allErrors).some((err) => err)) return;

    setIsSubmitting(true);

    const data = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      company: values.company,
      interest,
      message: values.message,
      _gotcha: "",
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitResult({
          success: true,
          message:
            result.message ||
            "Thank you for your message! We'll get back to you soon.",
        });
        setValues({ firstName: "", lastName: "", email: "", company: "", message: "" });
        setInterest("");
        setTouched({});
        setFieldErrors({});
      } else {
        setSubmitResult({
          success: false,
          message:
            result.message ||
            "There was a problem sending your message. Please try again.",
        });
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitResult({
        success: false,
        message:
          "There was a problem connecting to our servers. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const messageLength = values.message?.length || 0;

  return (
    <section id="contact" className="w-full bg-gray-50 dark:bg-gray-800 py-20 px-6">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-center text-3xl font-bold leading-tight text-gray-900 dark:text-gray-100">
              Start a Conversation
            </h2>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              Whether you need an AI governance assessment, a Copilot readiness
              review, or help building the data foundation for responsible AI
              adoption — we&#39;d like to hear from you.
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

            <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
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
                  <label
                    htmlFor="firstName"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={values.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`${INPUT_BASE} border ${inputBorderClass("firstName", touched, fieldErrors, values.firstName)}`}
                    placeholder="Enter your first name"
                  />
                  {touched.firstName && fieldErrors.firstName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {fieldErrors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={values.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`${INPUT_BASE} border ${inputBorderClass("lastName", touched, fieldErrors, values.lastName)}`}
                    placeholder="Enter your last name"
                  />
                  {touched.lastName && fieldErrors.lastName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {fieldErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="company"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Company Name
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={values.company}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${INPUT_BASE} border ${inputBorderClass("company", touched, fieldErrors, values.company)}`}
                  placeholder="Enter your company name"
                />
                {touched.company && fieldErrors.company && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {fieldErrors.company}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${INPUT_BASE} border ${inputBorderClass("email", touched, fieldErrors, values.email)}`}
                  placeholder="Enter your email address"
                />
                {touched.email && fieldErrors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="interest"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  What are you interested in?
                </label>
                <select
                  id="interest"
                  name="interest"
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  className={`${INPUT_BASE} border border-gray-300 dark:border-gray-600`}
                >
                  {INTEREST_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      disabled={option.value === ""}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  What can we help you with? *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={values.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={6}
                  className={`${INPUT_BASE} min-h-[120px] resize-y border ${inputBorderClass("message", touched, fieldErrors, values.message)}`}
                  placeholder="Tell us about your project or questions..."
                />
                <div className="mt-1 flex justify-between">
                  {touched.message && fieldErrors.message ? (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {fieldErrors.message}
                    </p>
                  ) : (
                    <span />
                  )}
                  <p
                    className={`text-xs ${
                      messageLength > 2000
                        ? "text-red-600 dark:text-red-400"
                        : messageLength > 1800
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {messageLength}/2000 characters
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full rounded-lg px-6 py-3.5 text-base font-semibold text-white border-none outline-none transition-all duration-200 ${
                  isSubmitting
                    ? "cursor-not-allowed bg-gray-400"
                    : !isFormValid
                      ? "bg-[#5B90B0] opacity-60 cursor-not-allowed"
                      : "bg-[#5B90B0] hover:bg-[#3A5F77] cursor-pointer"
                }`}
              >
                {isSubmitting ? "Sending Message..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
