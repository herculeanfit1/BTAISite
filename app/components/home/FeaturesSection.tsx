"use client";

import { features } from "@/app/data/features";

/**
 * FeaturesSection Component
 * Three service pillars: Govern, Relate, Build
 */
export const FeaturesSection = () => {
  return (
    <section id="solutions" className="w-full py-20 px-6 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-[1280px] mx-auto px-6">
        <h2 className="text-2xl font-bold mb-6 text-center leading-tight text-gray-900 dark:text-gray-100">
          Three ways we help
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-[400px] lg:max-w-none mx-auto lg:mx-0 px-4 lg:px-0">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 dark:text-blue-400 font-bold">
                  {feature.icon}
                </div>
                <span className="text-sm font-semibold uppercase tracking-wider text-[#5B90B0] dark:text-[#7ECEC1]">
                  {feature.label}
                </span>
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
              <p className="mt-5 text-sm italic text-gray-500 dark:text-gray-400">
                {feature.cta}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
