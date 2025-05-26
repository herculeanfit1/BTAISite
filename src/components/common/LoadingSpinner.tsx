"use client";

import React from "react";

type SpinnerSize = "sm" | "md" | "lg";
type SpinnerColor = "primary" | "accent" | "white";

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  className?: string;
}

const sizeMap: Record<SpinnerSize, string> = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

const colorMap: Record<SpinnerColor, string> = {
  primary: "text-primary",
  accent: "text-accent",
  white: "text-white",
};

export const LoadingSpinner = ({
  size = "md",
  color = "primary",
  className = "",
}: LoadingSpinnerProps) => {
  // Validate size and color against allowed values to ensure type safety
  const validSize: SpinnerSize = Object.keys(sizeMap).includes(size)
    ? (size as SpinnerSize)
    : "md";

  const validColor: SpinnerColor = Object.keys(colorMap).includes(color)
    ? (color as SpinnerColor)
    : "primary";

  // Safely access values using validated keys
  const sizeClass = sizeMap[validSize] || sizeMap.md;
  const colorClass = colorMap[validColor] || colorMap.primary;

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClass} ${colorClass}`}
        style={{
          borderTopColor: "transparent",
          borderRightColor: "currentColor",
          borderBottomColor: "currentColor",
          borderLeftColor: "currentColor",
        }}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading</span>
      </div>
    </div>
  );
};

export const LoadingState = ({ label = "Loading" }: { label?: string }) => {
  return (
    <div className="flex w-full flex-col items-center justify-center py-12">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  );
};
