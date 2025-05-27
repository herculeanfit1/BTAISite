"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Route } from "next";

// Dynamically import the SimpleGlobe component
const SimpleGlobe = dynamic(
  () =>
    import("../globe/SimpleGlobe").then((mod) => ({
      default: mod.SimpleGlobe,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] md:h-[500px] bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-blue-200 dark:bg-blue-800 rounded-full mb-4 animate-spin"></div>
          <div className="h-3 bg-blue-200 dark:bg-blue-800 rounded w-24 mb-2"></div>
          <div className="h-2 bg-blue-200 dark:bg-blue-800 rounded w-16"></div>
        </div>
      </div>
    ),
  }
);

/**
 * GlobeOverlaySection Component
 *
 * Displays a 3D globe visualization with text overlay.
 * Uses dynamic import to prevent server-side rendering issues with WebGL.
 * Now fully responsive for mobile devices.
 *
 * @returns {JSX.Element} The rendered globe section
 */
export const GlobeOverlaySection = () => {
  return (
    <section className="py-12 md:py-20 px-4 md:px-6 w-full relative overflow-hidden">
      <div className="w-full max-w-7xl mx-auto">
        <div className="relative h-[300px] md:h-[500px] w-full rounded-xl md:rounded-2xl overflow-hidden shadow-lg md:shadow-xl">
          {/* Background gradient */}
          <div 
            className="absolute inset-0 z-0 opacity-15"
            style={{
              background: "linear-gradient(90deg, #3A5F77 0%, #9CAEB8 100%)"
            }}
          />

          {/* Globe Visualization */}
          <div className="absolute inset-0 z-10">
            <SimpleGlobe
              color="#5B90B0"
              wireframe={true}
              rotation={0.001}
              gridOpacity={0.6}
            />
          </div>

          {/* Content Overlay */}
          <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center p-4 md:p-6 text-center">
            <div className="max-w-2xl md:max-w-4xl backdrop-blur-sm bg-white/20 dark:bg-black/20 p-4 md:p-6 rounded-t-xl md:rounded-t-2xl">
              {/* Primary caption */}
              <p className="text-xl md:text-4xl font-medium text-[#5B90B0] mb-2 md:mb-3">
                AI Without Borders
              </p>
              
              {/* Secondary headline */}
              <h2 className="text-lg md:text-2xl font-bold mb-3 md:mb-4 leading-tight text-gray-900 dark:text-white">
                Scalable Solutions, Universal Impact
              </h2>
              
              {/* Description */}
              <p className="mb-4 md:mb-6 text-sm md:text-lg text-white/90 dark:text-gray-100 max-w-lg md:max-w-2xl mx-auto leading-relaxed">
                We deliver trusted AI strategies that scale from regional
                operations to worldwide expansion—helping your business unlock
                sustainable growth wherever opportunity arises.
              </p>
              
              {/* CTA Button */}
              <Link 
                href={"/#solutions" as Route<string>} 
                className="inline-flex items-center px-4 md:px-6 py-2 md:py-3 border border-transparent rounded-md font-medium bg-[#5B90B0] text-white hover:bg-[#4a7a96] transition-colors duration-300 text-sm md:text-base"
              >
                Explore Our Solutions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
