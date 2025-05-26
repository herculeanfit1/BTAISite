"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle = ({ className = "" }: ThemeToggleProps) => {
  const [mounted, setMounted] = useState(false);
  // We're keeping track of the theme for future functionality
  const { setTheme } = useTheme();

  // When mounted on client, render theme toggle
  useEffect(() => {
    setMounted(true);
  }, []);

  // We'll use light theme only for now to avoid hydration issues
  const handleToggle = () => {
    // For now, we'll maintain light theme only
    setTheme("light");
  };

  if (!mounted) {
    return (
      <div
        className={`h-10 w-10 animate-pulse rounded-md bg-gray-200 ${className}`}
      />
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`focus:ring-primary/30 flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 focus:ring-2 focus:outline-none ${className}`}
      aria-label="Theme toggle (light mode only)"
    >
      <svg
        className="h-5 w-5 text-gray-700"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
      </svg>
    </button>
  );
};
