import React from "react";
import Link from "next/link";

interface ServiceSection {
  heading: string;
  content: string;
  bullets?: string[];
}

interface ServicePageLayoutProps {
  title: string;
  subtitle: string;
  description: string;
  sections: ServiceSection[];
  outcomes: string[];
  ctaHeading: string;
  ctaDescription: string;
  ctaButtonText: string;
}

export const ServicePageLayout = ({
  title,
  subtitle,
  description,
  sections,
  outcomes,
  ctaHeading,
  ctaDescription,
  ctaButtonText,
}: ServicePageLayoutProps) => {
  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-900">
      {/* Page Header */}
      <div className="w-full pt-24 pb-12 px-6 text-center bg-[#3A5F77] dark:bg-[#2A4A5C]">
        <div className="w-full max-w-[1280px] mx-auto px-6">
          <h1 className="text-4xl font-bold mb-4 leading-tight text-white">
            {title}
          </h1>
          <p className="text-lg max-w-3xl mx-auto text-white/90">{subtitle}</p>
        </div>
      </div>

      {/* Overview Section */}
      <section className="w-full py-16 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
      </section>

      {/* Detail Sections */}
      {sections.map((section, index) => (
        <section
          key={section.heading}
          className={`w-full py-16 px-6 ${
            index % 2 === 0
              ? "bg-gray-50 dark:bg-gray-950"
              : "bg-white dark:bg-gray-900"
          }`}
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">
              {section.heading}
            </h2>
            <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
              {section.content}
            </p>
            {section.bullets && section.bullets.length > 0 && (
              <ul className="list-disc pl-6 leading-relaxed text-gray-600 dark:text-gray-400">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="mb-3">
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ))}

      {/* Outcomes Section */}
      <section className="w-full py-16 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 leading-tight text-gray-900 dark:text-gray-100">
            What You Get
          </h2>
          <div className="grid gap-4">
            {outcomes.map((outcome) => (
              <div
                key={outcome}
                className="flex items-start gap-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4"
              >
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#5B90B0]"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">
                  {outcome}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 px-6 bg-[#3A5F77] dark:bg-[#2A4A5C]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">{ctaHeading}</h2>
          <p className="text-lg mb-8 text-white/90">{ctaDescription}</p>
          <Link
            href="/#contact"
            className="inline-block rounded-lg bg-white px-8 py-3 font-semibold text-[#3A5F77] transition-colors hover:bg-gray-100"
          >
            {ctaButtonText}
          </Link>
        </div>
      </section>

      {/* Back Navigation */}
      <section className="w-full py-8 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center text-lg font-medium text-blue-500 dark:text-[#7BA8C4] hover:underline"
          >
            <span className="mr-2">&larr;</span> Back to Home
          </Link>
        </div>
      </section>
    </div>
  );
};
