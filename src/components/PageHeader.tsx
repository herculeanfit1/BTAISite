import React from "react";
import { Breadcrumbs } from "./Breadcrumbs";
import { Route } from "next";

interface PageHeaderProps {
  title: string;
  description?: string;
  showBreadcrumbs?: boolean;
  customBreadcrumbs?: {
    label: string;
    href: Route<string>;
  }[];
}

export const PageHeader = ({
  title,
  description,
  showBreadcrumbs = true,
  customBreadcrumbs,
}: PageHeaderProps) => {
  return (
    <section className="from-primary/10 to-accent/10 dark:from-primary/5 dark:to-dark bg-gradient-to-r py-20">
      <div className="container">
        {showBreadcrumbs && (
          <div className="mb-8">
            <Breadcrumbs
              customItems={customBreadcrumbs}
              className="text-gray-600 dark:text-gray-400"
            />
          </div>
        )}

        <div className="text-center">
          <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="mx-auto max-w-3xl text-lg text-gray-700 dark:text-gray-300">
              {description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
