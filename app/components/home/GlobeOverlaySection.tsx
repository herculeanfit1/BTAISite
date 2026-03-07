"use client";

import Link from "next/link";

/**
 * AI Without Borders Section Component
 * Clean section with proper text styling and consistent button design
 */
export const GlobeOverlaySection = () => {
  return (
    <section className="py-16 md:py-24 px-4 md:px-6 w-full bg-slate-900">
      <div className="w-full max-w-7xl mx-auto text-center">
        <h2 className="text-lg md:text-2xl font-bold mb-4 md:mb-6 leading-tight text-center text-[#5B90B0]">
          AI Without Borders
        </h2>
        <p className="text-[1.4em] font-medium mb-4 md:mb-6 leading-tight text-center text-gray-400">
          Scalable Solutions, Universal Impact
        </p>
        <p className="mb-6 md:mb-8 text-sm md:text-lg max-w-lg md:max-w-2xl mx-auto leading-relaxed text-center text-gray-400">
          We deliver trusted AI strategies that scale from regional operations to worldwide expansion—helping your business unlock sustainable growth wherever opportunity arises.
        </p>
        <Link
          href="/#solutions"
          className="inline-block px-6 py-2.5 rounded-lg font-semibold text-white bg-[#5B90B0] hover:bg-[#4a7a96] transition-all duration-300 shadow-sm hover:shadow-md"
        >
          Explore Our Solutions
        </Link>
      </div>
    </section>
  );
};
