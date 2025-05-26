import React, { ReactNode } from "react";
import { Button } from "./Button";
import { Icons } from "./Icons";
import { Route } from "next";

export interface Feature {
  text: string;
  included: boolean | "partial";
}

export interface PricingPlan {
  id?: string;
  name?: string;
  title?: string;
  price: string;
  pricePeriod?: string;
  description: string;
  features: string[] | Feature[];
  highlighted?: boolean;
  featured?: boolean;
  buttonText?: string;
  buttonHref?: Route<string>;
  badge?: string;
  cta?: string;
  href?: Route<string>;
}

interface PricingTableProps {
  title?: string;
  subtitle?: string;
  description?: string;
  plans?: PricingPlan[];
  tiers?: PricingPlan[];
  className?: string;
  layout?: "grid" | "columns";
}

export const PricingTable = ({
  title,
  subtitle,
  description,
  plans,
  tiers,
  className = "",
  layout = "grid",
}: PricingTableProps) => {
  // Use either plans or tiers
  const pricingPlans = plans || tiers || [];

  // Ensure each plan has an id
  const processedPlans = pricingPlans.map((plan, index) => {
    // If plan only has string features, convert to Feature objects
    let processedFeatures = plan.features;
    if (plan.features.length > 0 && typeof plan.features[0] === "string") {
      processedFeatures = (plan.features as string[]).map((feature) => ({
        text: feature,
        included: true,
      }));
    }

    return {
      ...plan,
      id: plan.id || `plan-${index}`,
      name: plan.name || plan.title || "Plan",
      highlighted: plan.highlighted || plan.featured || false,
      buttonText: plan.buttonText || plan.cta || "Get Started",
      buttonHref: plan.buttonHref || plan.href || "/#",
      features: processedFeatures,
    };
  });

  // Render feature with checkmark, x, or partial mark based on included status
  const renderFeatureIcon = (included: boolean | "partial") => {
    if (included === true) {
      return <Icons.Check className="text-primary h-5 w-5" />;
    } else if (included === "partial") {
      return (
        <svg
          className="h-5 w-5 text-yellow-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      );
    } else {
      return <Icons.Cross className="h-5 w-5 text-gray-400" />;
    }
  };

  // Render a single pricing plan card
  const renderPlan = (plan: PricingPlan) => {
    const cardClasses = plan.highlighted
      ? "border-primary dark:border-primary scale-105 shadow-xl"
      : "border-gray-200 dark:border-gray-700";

    return (
      <div
        className={`dark:bg-dark/40 flex flex-col rounded-lg border-2 bg-white p-6 ${cardClasses} transition-all`}
        key={plan.id}
      >
        {plan.badge && (
          <div className="mb-4">
            <span className="text-primary bg-primary/10 rounded-full px-3 py-1 text-xs font-semibold">
              {plan.badge}
            </span>
          </div>
        )}
        <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-300 dark:text-white">
          {plan.name}
        </h3>
        <div className="mb-2">
          <span className="text-3xl font-bold text-gray-900 dark:text-gray-300 dark:text-white">
            {plan.price}
          </span>
          {plan.pricePeriod && (
            <span className="text-gray-500 dark:text-gray-400">
              /{plan.pricePeriod}
            </span>
          )}
        </div>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          {plan.description}
        </p>
        <ul className="mb-6 flex-grow space-y-3">
          {(plan.features as Feature[]).map((feature, index) => (
            <li key={index} className="flex items-center">
              <span className="mr-2">
                {renderFeatureIcon(feature.included)}
              </span>
              <span
                className={`text-sm ${
                  feature.included === false
                    ? "text-gray-500 dark:text-gray-400"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
        {(plan.buttonText || plan.cta) && (plan.buttonHref || plan.href) && (
          <Button
            href={(plan.buttonHref || plan.href || "/#") as Route<string>}
            variant={plan.highlighted ? "primary" : "secondary"}
            className="w-full"
          >
            {plan.buttonText || plan.cta}
          </Button>
        )}
      </div>
    );
  };

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

        <div
          className={`${
            layout === "grid"
              ? "grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col gap-8 md:flex-row"
          } mx-auto max-w-6xl`}
        >
          {processedPlans.map((plan) => renderPlan(plan))}
        </div>
      </div>
    </section>
  );
};
