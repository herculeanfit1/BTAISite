"use client";

import React, { useState, ReactNode } from "react";

export interface Tab {
  id: string;
  label: string;
  content: ReactNode;
  icon?: ReactNode;
}

interface TabSectionProps {
  title?: string;
  subtitle?: string;
  tabs: Tab[];
  defaultTabId?: string;
  orientation?: "horizontal" | "vertical";
  className?: string;
  tabStyle?: "underline" | "solid" | "pills";
}

export const TabSection = ({
  title,
  subtitle,
  tabs,
  defaultTabId,
  orientation = "horizontal",
  className = "",
  tabStyle = "underline",
}: TabSectionProps) => {
  // Ensure tabs have id property
  const processedTabs = tabs.map((tab, index) => {
    return {
      ...tab,
      id: tab.id || `tab-${index}`,
    };
  });

  const [activeTabId, setActiveTabId] = useState(
    defaultTabId || processedTabs[0]?.id
  );

  const activeTab =
    processedTabs.find((tab) => tab.id === activeTabId) || processedTabs[0];

  // Tab header styling based on selected style
  const getTabHeaderClasses = (isActive: boolean) => {
    const baseClasses =
      "px-4 py-2 font-medium transition-colors duration-200 flex items-center";

    switch (tabStyle) {
      case "solid":
        return `${baseClasses} ${
          isActive
            ? "bg-primary text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        }`;
      case "pills":
        return `${baseClasses} rounded-full ${
          isActive
            ? "bg-primary/10 text-primary dark:bg-primary/20"
            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        }`;
      default: // underline
        return `${baseClasses} border-b-2 ${
          isActive
            ? "border-primary text-primary dark:border-accent dark:text-accent"
            : "border-transparent text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
        }`;
    }
  };

  return (
    <section className={`py-12 ${className}`}>
      <div className="container">
        {(title || subtitle) && (
          <div className="mb-12 text-center">
            {title && (
              <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-300 dark:text-white">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mx-auto max-w-3xl text-lg text-gray-700 dark:text-gray-300">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div
          className={`flex flex-col ${orientation === "vertical" ? "gap-8 md:flex-row" : "gap-6"}`}
        >
          {/* Tab Headers */}
          <div
            className={`flex ${
              orientation === "vertical"
                ? "overflow-x-auto md:w-1/4 md:flex-col md:overflow-visible"
                : "flex-row overflow-x-auto"
            } ${tabStyle === "underline" ? "border-b border-gray-200 dark:border-gray-700" : ""}`}
          >
            {processedTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`${getTabHeaderClasses(tab.id === activeTabId)} ${
                  orientation === "vertical" ? "text-left" : ""
                }`}
                aria-selected={tab.id === activeTabId}
                role="tab"
              >
                {tab.icon && <span className="mr-2">{tab.icon}</span>}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div
            className={`mt-6 ${orientation === "vertical" ? "md:mt-0 md:w-3/4" : ""}`}
          >
            <div role="tabpanel" className="focus:outline-none">
              {activeTab.content}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
