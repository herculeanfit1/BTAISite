import React from "react";
import Link from "next/link";
import { Route } from "next";

interface SimpleCardProps {
  title: string;
  description: string;
  href: Route<string>;
  className?: string;
}

export const SimpleCard = ({
  title,
  description,
  href,
  className = "",
}: SimpleCardProps) => {
  return (
    <div
      className={`group dark:bg-dark/50 hover:border-primary/20 dark:hover:border-primary/30 relative overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-md transition-all duration-300 hover:shadow-lg dark:border-gray-800 ${className}`}
    >
      {/* Subtle gradient accent in corner */}
      <div className="from-primary/10 dark:from-primary/20 absolute top-0 right-0 h-16 w-16 rounded-bl-full bg-gradient-to-bl to-transparent"></div>

      <h3 className="group-hover:text-primary mb-3 text-xl font-semibold text-gray-900 transition-colors dark:text-white">
        {title}
      </h3>

      <p className="mb-4 text-gray-600 dark:text-gray-300">{description}</p>

      <Link
        href={href}
        className="text-primary inline-flex items-center font-medium"
      >
        Learn more
        <svg
          className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Link>
    </div>
  );
};
