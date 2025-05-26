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
    <footer className="mt-auto w-full bg-gray-50 py-16">
      <div className="container mx-auto max-w-5xl px-6">
        <div className="flex flex-col items-center justify-center">
          {/* Quick Links heading with blue underline */}
          <h3 className="relative mb-8 pb-2 text-2xl font-semibold text-gray-800">
            Quick Links
            <span className="absolute bottom-0 left-1/2 h-0.5 w-10 -translate-x-1/2 bg-[#5B90B0]"></span>
          </h3>

          {/* Simple navigation with fixed pixel spacing */}
          <div className="mb-16 flex flex-row items-center justify-center space-x-8">
            <Link
              href="/#about"
              className="mx-[15px] text-gray-500 transition-colors hover:text-[#5B90B0]"
            >
              About
            </Link>
            <div style={{ width: "22px" }}></div>
            <Link
              href="/privacy"
              className="mx-[15px] text-gray-500 transition-colors hover:text-[#5B90B0]"
            >
              Privacy
            </Link>
            <div style={{ width: "22px" }}></div>
            <Link
              href="/terms"
              className="mx-[15px] text-gray-500 transition-colors hover:text-[#5B90B0]"
            >
              Terms
            </Link>
          </div>

          {/* Large spacer before divider */}
          <div style={{ height: "40px" }}></div>

          {/* Horizontal divider line - shorter and lighter */}
          <div className="mx-auto w-1/2 border-t-2 border-gray-200"></div>

          {/* Large spacer after divider */}
          <div style={{ height: "40px" }}></div>

          {/* Copyright text */}
          <div className="text-center text-sm text-gray-500">
            <p
              style={{
                background: "linear-gradient(90deg, #3A5F77 0%, #5B90B0 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 500,
              }}
            >
              © {new Date().getFullYear()} Bridging Trust AI. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
