"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Route } from "next";

interface BreadcrumbsProps {
  customItems?: {
    label: string;
    href: Route<string>;
  }[];
  homeLabel?: string;
  className?: string;
}

export const Breadcrumbs = ({
  customItems,
  homeLabel = "Home",
  className = "",
}: BreadcrumbsProps) => {
  const pathname = usePathname();

  // Use custom items if provided, otherwise generate from pathname
  const items =
    customItems ||
    (pathname
      ? generateBreadcrumbs(pathname, homeLabel)
      : [{ label: homeLabel, href: "/" as Route<string> }]);

  return (
    <nav aria-label="Breadcrumb" className={`text-sm ${className}`}>
      <ol className="flex flex-wrap items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={typeof item.href === "string" ? item.href : index.toString()}
              className="flex items-center"
            >
              {index > 0 && (
                <svg
                  className="mx-2 h-4 w-4 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}

              {isLast ? (
                <span
                  aria-current="page"
                  className="font-medium text-gray-800 dark:text-gray-200"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-primary dark:hover:text-accent text-gray-600 dark:text-gray-400"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

function generateBreadcrumbs(pathname: string, homeLabel: string) {
  // Always have the home page as the first breadcrumb
  const breadcrumbs = [{ label: homeLabel, href: "/" as Route<string> }];

  if (pathname === "/") {
    return breadcrumbs;
  }

  // Split pathname into segments and create breadcrumbs
  const segments = pathname.split("/").filter(Boolean);

  let path = "";
  segments.forEach((segment) => {
    path = `${path}/${segment}`;

    breadcrumbs.push({
      label: formatBreadcrumbLabel(segment),
      href: path as Route<string>,
    });
  });

  return breadcrumbs;
}

function formatBreadcrumbLabel(segment: string): string {
  // Handle case where segment might be a dynamic route parameter (e.g., [slug])
  if (segment.startsWith("[") && segment.endsWith("]")) {
    return "Details";
  }

  // Convert kebab-case or snake_case to title case
  return segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
