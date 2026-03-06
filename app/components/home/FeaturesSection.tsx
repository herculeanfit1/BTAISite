"use client";

import Link from "next/link";
import { features } from "@/app/data/features";

/**
 * Features Section Component
 * Cards highlighting key services
 */
export const FeaturesSection = () => {
  return (
    <section id="solutions" className="w-full py-20 px-6 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-[1280px] mx-auto px-6">
        <h2 className="text-2xl font-bold mb-6 text-center leading-tight text-gray-900 dark:text-gray-100">
          What We Do
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-[400px] md:max-w-none mx-auto md:mx-0 px-4 md:px-0">
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
              {feature.link && (
                <Link
                  href={feature.link}
                  className="inline-flex items-center mt-5 text-[#5B90B0] dark:text-[#7BA8C4] font-medium hover:underline"
                >
                  Learn more <span className="ml-1">&rarr;</span>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
