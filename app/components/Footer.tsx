"use client";

/**
 * Footer Component
 *
 * A clean, minimalist footer for the Bridging Trust AI website that includes:
 * - "Quick Links" section with navigation links
 * - Horizontal layout of links with proper spacing
 * - Styling that matches the production site
 */

import React from "react";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="mt-auto w-full bg-gray-50 dark:bg-gray-800 pt-24 pb-16">
      <div className="container mx-auto max-w-5xl px-6">
        <div className="flex flex-col items-center justify-center">
          {/* Quick Links heading with blue underline */}
          <h3 className="relative mb-8 pb-2 text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Quick Links
            <span className="absolute bottom-0 left-1/2 h-0.5 w-10 -translate-x-1/2 bg-[#5B90B0]"></span>
          </h3>

          {/* Simple navigation with consistent spacing */}
          <div className="mb-16 flex flex-row items-center justify-center gap-14">
            <Link
              href="/#about"
              className="text-gray-500 dark:text-gray-400 transition-colors hover:text-[#5B90B0]"
            >
              About
            </Link>
            <Link
              href="/privacy"
              className="text-gray-500 dark:text-gray-400 transition-colors hover:text-[#5B90B0]"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-gray-500 dark:text-gray-400 transition-colors hover:text-[#5B90B0]"
            >
              Terms
            </Link>
          </div>

          {/* Spacer before divider */}
          <div className="h-10"></div>

          {/* Horizontal divider line - shorter and lighter */}
          <div className="mx-auto w-1/2 border-t-2 border-gray-200 dark:border-gray-600"></div>

          {/* Spacer after divider */}
          <div className="h-10"></div>

          {/* Copyright text */}
          <div className="text-center text-sm text-gray-500">
            <p className="bg-gradient-to-r from-[#3A5F77] to-[#5B90B0] bg-clip-text font-medium text-transparent">
              &copy; {new Date().getFullYear()} Bridging Trust AI. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
