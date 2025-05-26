import { ButtonHTMLAttributes } from "react";
import Link from "next/link";
import { Route } from "next";

type ButtonVariant = "primary" | "secondary" | "accent" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: Route<string>;
  isExternal?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  href,
  isExternal = false,
  className = "",
  icon,
  ...props
}: ButtonProps) => {
  const baseClasses =
    "btn inline-flex items-center justify-center font-medium rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98]";

  // Get variant classes using a type-safe approach
  const getVariantClasses = (variantType: ButtonVariant): string => {
    switch (variantType) {
      case "primary":
        return "bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg focus:ring-primary/50 border border-transparent";
      case "secondary":
        return "bg-white text-gray-800 dark:bg-dark/80 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-dark/60 focus:ring-gray-300 shadow-sm hover:shadow-md";
      case "accent":
        return "bg-accent text-white hover:bg-accent/90 shadow-md hover:shadow-lg focus:ring-accent/50 border border-transparent";
      case "outline":
        return "bg-transparent text-primary dark:text-primary/90 border border-primary/60 dark:border-primary/40 hover:bg-primary/5 focus:ring-primary/40 shadow-sm hover:shadow-md";
      default:
        return "bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg focus:ring-primary/50 border border-transparent";
    }
  };

  // Get size classes using a type-safe approach
  const getSizeClasses = (sizeType: ButtonSize): string => {
    switch (sizeType) {
      case "sm":
        return "text-xs px-3 py-1.5 gap-1.5";
      case "md":
        return "text-sm px-5 py-2.5 gap-2";
      case "lg":
        return "text-base px-7 py-3.5 gap-2.5 font-semibold";
      default:
        return "text-sm px-5 py-2.5 gap-2";
    }
  };

  const combinedClasses = `${baseClasses} ${getVariantClasses(variant)} ${getSizeClasses(size)} ${className}`;

  if (href) {
    const linkProps = isExternal
      ? { target: "_blank", rel: "noopener noreferrer" }
      : {};

    return (
      <Link href={href} className={combinedClasses} {...linkProps}>
        {icon && (
          <span className="inline-flex transition-transform duration-300 group-hover:translate-x-0.5">
            {icon}
          </span>
        )}
        {children}
      </Link>
    );
  }

  return (
    <button className={`group ${combinedClasses}`} {...props}>
      {icon && (
        <span className="inline-flex transition-transform duration-300 group-hover:translate-x-0.5">
          {icon}
        </span>
      )}
      {children}
    </button>
  );
};
