import React from "react";
import Link from "next/link";
import { Route } from "next";

interface ServiceCardProps {
  title: string;
  description: string;
  icon?: string;
  href: Route<string>;
  className?: string;
}

export const ServiceCard = ({
  title,
  description,
  icon,
  href,
  className = "",
}: ServiceCardProps) => {
  return (
    <div
      className={`group overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800 ${className}`}
    >
      <div className="p-6">
        {icon && <div className="text-primary mb-4">{icon}</div>}

        <h3 className="group-hover:text-primary mb-3 text-xl font-bold text-gray-900 transition-colors dark:text-white">
          {title}
        </h3>

        <p className="mb-6 text-gray-600 dark:text-gray-300">{description}</p>

        <Link
          href={href}
          className="text-primary hover:text-primary-dark inline-flex items-center font-medium transition-colors"
        >
          <span>Learn more</span>
          <svg
            className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        </Link>
      </div>
    </div>
  );
};
