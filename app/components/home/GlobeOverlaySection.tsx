"use client";

import Link from "next/link";
import { Route } from "next";

/**
 * AI Without Borders Section Component
 * Clean section with proper text styling and consistent button design
 */
export const GlobeOverlaySection = () => {
  return (
    <section className="py-16 md:py-24 px-4 md:px-6 w-full bg-slate-900">
      <div className="w-full max-w-7xl mx-auto text-center">
        <h2 
          className="text-lg md:text-2xl font-bold mb-4 md:mb-6 leading-tight text-center"
          style={{ color: '#5B90B0' }} // Use the blue color for the main heading
        >
          AI Without Borders
        </h2>
        {/* Force deployment refresh - v2 */}
        <p 
          className="text-xl md:text-4xl font-medium mb-4 md:mb-6 leading-tight text-center"
          style={{ 
            color: '#9ca3af', // gray-400 equivalent for consistent light color
            fontSize: '1.4em' // Increase by 40% (1.0 * 1.4 = 1.4)
          }}
        >
          Scalable Solutions, Universal Impact
        </p>
        <p 
          className="mb-6 md:mb-8 text-sm md:text-lg max-w-lg md:max-w-2xl mx-auto leading-relaxed text-center"
          style={{ color: '#9ca3af' }} // gray-400 equivalent for consistent light color
        >
          We deliver trusted AI strategies that scale from regional operations to worldwide expansion—helping your business unlock sustainable growth wherever opportunity arises.
        </p>
        <Link
          href="/#solutions"
          className="inline-flex items-center px-6 py-3 rounded-lg font-medium text-white bg-[#5B90B0] hover:bg-[#4a7a96] transition-all duration-300 hover:shadow-md"
          style={{ 
            fontWeight: 600,
            fontSize: '1.05rem',
            padding: '10px 24px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            display: 'inline-block'
          }}
        >
          Explore Our Solutions
        </Link>
      </div>
    </section>
  );
};