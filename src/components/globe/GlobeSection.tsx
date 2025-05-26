import React from "react";
import dynamic from "next/dynamic";
import { Route } from "next";
import { useTheme } from "next-themes";
import Link from "next/link";

// Dynamically import the SimpleGlobe component
const SimpleGlobe = dynamic(
  () => import("./SimpleGlobe").then((mod) => ({ default: mod.SimpleGlobe })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[500px] w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex animate-pulse flex-col items-center">
          <div className="mb-6 h-40 w-40 rounded-full bg-gray-200 dark:bg-gray-800"></div>
          <div className="mb-2.5 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800"></div>
          <div className="h-2 w-1/2 rounded bg-gray-200 dark:bg-gray-800"></div>
        </div>
      </div>
    ),
  }
);

// Comment out problematic component to avoid build errors
// const GlobeVisualization = dynamic(
//   () => import('./GlobeVisualization').then(mod => ({ default: mod.GlobeVisualization }))
//     .catch(() => {
//       console.warn('Failed to load GlobeVisualization, using SimpleGlobe fallback');
//       return ({ title, description, subtitle, ctaText, ctaLink, className }: any) => (
//         <FallbackGlobeSection
//           title={title}
//           description={description}
//           subtitle={subtitle}
//           ctaText={ctaText}
//           ctaLink={ctaLink}
//           className={className}
//         />
//       );
//     }),
//   {
//     ssr: false,
//     loading: () => (
//       <div className="w-full h-[500px] bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
//         <div className="animate-pulse flex flex-col items-center">
//           <div className="w-40 h-40 bg-gray-200 dark:bg-gray-800 rounded-full mb-6"></div>
//           <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2.5"></div>
//           <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
//         </div>
//       </div>
//     )
//   }
// );

interface GlobeSectionProps {
  title?: string;
  description?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: Route<string>;
  className?: string;
}

// Main component that uses SimpleGlobe is now refactored into the main GlobeSection
// and is no longer needed as a separate component

export const GlobeSection = ({
  title = "Global AI Partnership",
  description = "Bridging Trust AI connects businesses around the world with trusted AI implementation strategies for sustainable growth.",
  subtitle = "Our Global Reach",
  ctaText = "Learn More",
  ctaLink = "/about" as Route<string>,
  className = "",
}: GlobeSectionProps) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  return (
    <section className={`overflow-hidden py-20 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="relative h-[500px] w-full overflow-hidden rounded-2xl shadow-xl">
          {/* Background gradient */}
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-purple-50/30 to-blue-50/30 dark:from-gray-900/50 dark:to-purple-900/30"></div>

          {/* Globe visualization */}
          <div className="absolute inset-0 z-10">
            <SimpleGlobe
              color={isDarkMode ? "#6366f1" : "#818cf8"}
              wireframe={true}
              rotation={0.001}
              gridOpacity={0.6}
            />
          </div>

          {/* Content overlay - positioned at the bottom */}
          <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center p-6 text-center">
            <div className="max-w-2xl rounded-t-xl bg-white/20 p-6 backdrop-blur-sm dark:bg-gray-900/30">
              {subtitle && (
                <p className="text-primary mb-2 text-sm font-medium">
                  {subtitle}
                </p>
              )}
              {title && (
                <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mx-auto mb-6 max-w-xl text-lg text-gray-700 dark:text-gray-300">
                  {description}
                </p>
              )}
              {ctaText && ctaLink && (
                <Link
                  href={ctaLink}
                  className="bg-primary hover:bg-primary-dark inline-flex items-center rounded-md border border-transparent px-6 py-3 text-base font-medium text-white shadow-sm transition-colors duration-300"
                >
                  {ctaText}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GlobeSection;
