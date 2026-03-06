"use client";

import { features } from "@/app/data/features";

interface FeaturesSectionProps {
  isDesktop: boolean;
}

/**
 * Features Section Component
 * Cards highlighting key services
 */
export const FeaturesSection = ({ isDesktop }: FeaturesSectionProps) => {
  return (
    <section id="solutions" className="w-full py-20 px-6 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-[1280px] mx-auto px-6">
        <h2 className="text-2xl font-bold mb-6 text-center leading-tight text-gray-900 dark:text-gray-100">
          What We Do
        </h2>
        <div
          style={{
            display: "grid",
            gap: isDesktop ? "2rem" : "1.5rem",
            gridTemplateColumns: isDesktop ? "repeat(2, 1fr)" : "1fr",
            maxWidth: isDesktop ? "none" : "400px",
            margin: isDesktop ? "0" : "0 auto",
            padding: isDesktop ? "0" : "0 1rem",
          }}
        >
          {features.map((feature) => (
            <div
              key={feature.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700"
            >
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-6 text-blue-500 dark:text-blue-400 font-bold">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-4 leading-tight text-gray-900 dark:text-gray-100">
                {feature.title}
              </h3>
              <p className="mb-3 text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
              <ul className="list-disc pl-5 mt-3 leading-relaxed text-gray-600 dark:text-gray-400 text-[0.95rem]">
                {feature.bullets.map((bullet) => (
                  <li key={bullet} className="mb-1">
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
