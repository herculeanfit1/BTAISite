"use client";

import React, { useState, ReactNode } from "react";

export interface AccordionItem {
  id?: string;
  title: string;
  content: ReactNode;
  question?: string;
  answer?: string;
}

interface AccordionSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  items: AccordionItem[];
  className?: string;
  allowMultiple?: boolean;
  defaultExpandedIds?: string[];
  showItemBorders?: boolean;
  showDividers?: boolean;
}

export const AccordionSection = ({
  title,
  subtitle,
  description,
  items,
  className = "",
  allowMultiple = false,
  defaultExpandedIds = [],
  showItemBorders = true,
  showDividers = true,
}: AccordionSectionProps) => {
  // Process items to ensure each has an ID and handle question/answer format
  const processedItems = items.map((item, index) => {
    // Convert question/answer format to title/content if needed
    const processedItem = {
      ...item,
      id: item.id || `accordion-item-${index}`,
      title: item.title || item.question || `Item ${index + 1}`,
      content: item.content || item.answer || "",
    };

    return processedItem;
  });

  const [expandedIds, setExpandedIds] = useState<string[]>(defaultExpandedIds);

  const toggleItem = (id: string) => {
    if (expandedIds.includes(id)) {
      setExpandedIds(expandedIds.filter((itemId) => itemId !== id));
    } else {
      if (allowMultiple) {
        setExpandedIds([...expandedIds, id]);
      } else {
        setExpandedIds([id]);
      }
    }
  };

  const getItemClasses = () => {
    let classes = "overflow-hidden transition-all";

    if (showItemBorders) {
      classes += " border border-gray-200 dark:border-gray-700 rounded-lg";
    }

    return classes;
  };

  const getContentClasses = (isExpanded: boolean) => {
    return `px-6 pb-6 overflow-hidden transition-all duration-300 ease-in-out ${
      isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
    }`;
  };

  return (
    <section className={`py-12 ${className}`}>
      <div className="container">
        {(title || subtitle || description) && (
          <div className="mb-12 text-center">
            {title && (
              <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-300 dark:text-white">
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

        <div className="mx-auto max-w-3xl">
          <div className={`space-y-${showDividers ? "6" : "4"}`}>
            {processedItems.map((item) => {
              const isExpanded = expandedIds.includes(item.id);

              return (
                <div key={item.id} className={getItemClasses()}>
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="flex w-full items-center justify-between p-6 text-left focus:outline-none"
                    aria-expanded={isExpanded}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-300 dark:text-white">
                      {item.title}
                    </h3>
                    <svg
                      className={`h-5 w-5 text-gray-500 transition-transform duration-300 dark:text-gray-400 ${
                        isExpanded ? "rotate-180 transform" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <div className={getContentClasses(isExpanded)}>
                    {item.content}
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
