"use client";

import React from "react";
import type { ReactNode } from "react";
import { useState, useEffect } from "react";

export interface TimelineItem {
  title: string;
  date?: string;
  description?: string;
  content?: ReactNode;
  icon?: ReactNode;
}

interface TimelineProps {
  title?: string;
  subtitle?: string;
  items?: TimelineItem[];
  steps?: TimelineItem[];
  className?: string;
  alternating?: boolean;
  iconPosition?: "start" | "center";
  showDates?: boolean;
  description?: string;
}

export const Timeline = ({
  title,
  subtitle,
  items,
  steps,
  description,
  className = "",
  alternating = true,
  iconPosition = "center",
  showDates = true,
}: TimelineProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use either items or steps, with steps taking precedence
  const timelineItems = steps || items || [];

  // Map steps to the expected format if they have description but no content
  const processedItems = timelineItems.map((item) => {
    if (item.description && !item.content) {
      return {
        ...item,
        content: item.description,
      };
    }
    return item;
  });

  // Default icon if none provided
  const defaultIcon = (
    <svg
      className="h-4 w-4 text-white"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );

  // Return a simple placeholder during SSR to prevent hydration issues
  if (!mounted) {
    return (
      <section className={`py-20 ${className}`}>
        <div className="container">
          <div className="h-96"></div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-20 ${className}`}>
      <div className="container">
        {(title || subtitle || description) && (
          <div className="mb-12 text-center">
            {title && (
              <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-gray-300 dark:text-white">
                {title}
              </h2>
            )}
            {(subtitle || description) && (
              <p className="mx-auto max-w-3xl text-lg text-gray-700 dark:text-gray-300">
                {subtitle || description}
              </p>
            )}
          </div>
        )}

        <div className="relative mx-auto max-w-4xl">
          {/* Timeline Line */}
          <div
            className={`absolute ${
              iconPosition === "center" ? "left-1/2" : "left-6"
            } top-0 bottom-0 w-1 bg-gray-200 dark:bg-gray-700 ${
              iconPosition === "center" ? "-translate-x-1/2" : ""
            } hidden md:block`}
          />

          <div className="space-y-12">
            {processedItems.map((item, index) => {
              const isEven = index % 2 === 0;
              const alignment = alternating && isEven ? "left" : "right";

              return (
                <div
                  key={index}
                  className={`relative flex items-start ${
                    iconPosition === "center"
                      ? alternating
                        ? `md:flex-row${isEven ? "" : "-reverse"}`
                        : "md:flex-row"
                      : "md:flex-row"
                  }`}
                >
                  {/* Content Positioned Based on Alternating Setting */}
                  {iconPosition === "center" && (
                    <>
                      <div
                        className={`md:w-1/2 ${!isEven && alternating ? "md:pl-12" : "md:pr-12"}`}
                      >
                        {(alignment === "left" || !alternating) && (
                          <div className="dark:bg-dark/40 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                            {showDates && item.date && (
                              <div className="text-primary mb-2 text-sm font-medium">
                                {item.date}
                              </div>
                            )}
                            <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-300 dark:text-white">
                              {item.title}
                            </h3>
                            <div className="text-gray-700 dark:text-gray-300">
                              {item.content || item.description}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Icon in the middle - only visible on md+ screens */}
                      <div className="absolute left-1/2 hidden -translate-x-1/2 items-center justify-center md:flex">
                        <div className="bg-primary z-10 flex h-9 w-9 items-center justify-center rounded-full">
                          {item.icon || defaultIcon}
                        </div>
                      </div>

                      <div
                        className={`md:w-1/2 ${isEven && alternating ? "md:pl-12" : "md:pr-12"}`}
                      >
                        {(alignment === "right" || !alternating) && (
                          <div className="dark:bg-dark/40 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                            {showDates && item.date && (
                              <div className="text-primary mb-2 text-sm font-medium">
                                {item.date}
                              </div>
                            )}
                            <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-300 dark:text-white">
                              {item.title}
                            </h3>
                            <div className="text-gray-700 dark:text-gray-300">
                              {item.content || item.description}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Icon at Start Layout */}
                  {iconPosition === "start" && (
                    <>
                      {/* Icon at left - visible on all screens */}
                      <div className="mr-4 flex-shrink-0 md:mr-6">
                        <div className="bg-primary z-10 flex h-9 w-9 items-center justify-center rounded-full">
                          {item.icon || defaultIcon}
                        </div>
                      </div>

                      <div className="flex-grow">
                        <div className="dark:bg-dark/40 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                          {showDates && item.date && (
                            <div className="text-primary mb-2 text-sm font-medium">
                              {item.date}
                            </div>
                          )}
                          <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-300 dark:text-white">
                            {item.title}
                          </h3>
                          <div className="text-gray-700 dark:text-gray-300">
                            {item.content || item.description}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Mobile View - Same for Both Layouts */}
                  <div className="flex flex-row md:hidden">
                    <div className="mr-4 flex-shrink-0">
                      <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full">
                        {item.icon || defaultIcon}
                      </div>
                    </div>
                    <div className="flex-grow">
                      {showDates && item.date && (
                        <div className="text-primary mb-1 text-sm font-medium">
                          {item.date}
                        </div>
                      )}
                      <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-300 dark:text-white">
                        {item.title}
                      </h3>
                      <div className="text-gray-700 dark:text-gray-300">
                        {item.content || item.description}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
