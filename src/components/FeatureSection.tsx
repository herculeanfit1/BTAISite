"use client";

import React from "react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

export interface Feature {
  title: string;
  description: string;
  icon: string | ReactNode;
}

export interface FeatureSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  features: Feature[];
  columns?: 2 | 3 | 4;
  className?: string;
  variant?: "default" | "cards" | "minimal";
  centered?: boolean;
  layout?: string; // Added to support the test with layout="alternate"
}

export const FeatureSection = ({
  title,
  subtitle,
  description,
  features,
  columns = 3,
  className = "",
  variant = "default",
  centered = true,
  layout,
}: FeatureSectionProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Styling for different variants
  const getFeatureItemClasses = () => {
    switch (variant) {
      case "cards":
        return "bg-white dark:bg-dark/40 p-6 rounded-lg shadow-md";
      case "minimal":
        return "";
      default:
        return "p-6";
    }
  };

  // Styling for feature icon
  const getIconClasses = () => {
    switch (variant) {
      case "cards":
        return "w-8 h-8 text-primary transition-transform ease-in-out duration-300 transform group-hover:scale-110";
      case "minimal":
        return "w-6 h-6 text-primary mr-4 transition-all duration-300 group-hover:text-primary-dark";
      default:
        return "w-10 h-10 bg-primary/10 text-primary p-2 rounded-lg mb-4 transition-all duration-300 shadow-sm";
    }
  };

  // Render icon based on the type
  const renderIcon = (icon: string | ReactNode) => {
    if (typeof icon === "string") {
      const iconClass = "w-5 h-5"; // Smaller, consistent size

      switch (icon) {
        case "UserGroup":
        case "users":
          return (
            <svg
              className={iconClass}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          );
        case "ShieldCheck":
        case "shield":
          return (
            <svg
              className={iconClass}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          );
        case "Cog":
        case "settings":
          return (
            <svg
              className={iconClass}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          );
        case "check":
          return (
            <svg
              className={iconClass}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          );
        case "refresh":
          return (
            <svg
              className={iconClass}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          );
        default:
          return (
            <svg
              className={iconClass}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          );
      }
    }

    // If it's a ReactNode, check if it's a valid React element
    if (React.isValidElement(icon)) {
      // For TypeScript safety, return the original icon without attempting to clone it
      // This avoids type errors while still displaying the icon correctly
      return icon;
    }

    return icon;
  };

  // Return an empty container for server-side rendering to prevent hydration mismatch
  if (!mounted) {
    return (
      <section className={`features-section py-12 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="h-96"></div>
        </div>
      </section>
    );
  }

  return (
    <section className={`features-section py-12 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className={`mb-12 ${centered ? "text-center" : ""}`}>
          <h2 className="mb-4 text-3xl font-bold dark:text-white">{title}</h2>
          {subtitle && (
            <p className="mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300">
              {subtitle}
            </p>
          )}
          {description && (
            <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600 dark:text-gray-300">
              {description}
            </p>
          )}
        </div>

        {/* Features grid */}
        <div
          className={`features-grid grid grid-cols-1 ${
            // Use safe access method to avoid object injection warnings
            // The columns value is typed as 2 | 3 | 4 so it's safe, but linters still flag it
            columns === 2
              ? "md:grid-cols-2"
              : columns === 3
                ? "md:grid-cols-3"
                : columns === 4
                  ? "md:grid-cols-2 lg:grid-cols-4"
                  : "md:grid-cols-3" // Default fallback to 3 columns
          } gap-8 ${layout === "alternate" ? "alternate-layout" : ""}`}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group feature-item ${getFeatureItemClasses()} ${
                centered ? "flex flex-col items-center text-center" : ""
              }`}
            >
              <div className={`icon-container ${getIconClasses()}`}>
                {renderIcon(feature.icon)}
              </div>
              <h3 className="mt-2 mb-2 text-xl font-semibold dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
