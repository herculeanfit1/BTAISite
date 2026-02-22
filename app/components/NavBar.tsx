"use client";

/**
 * NavBar Component
 *
 * A responsive navigation bar for the Bridging Trust AI website that includes:
 * - Company logo and name with gradient text effect
 * - Desktop navigation menu with hover effects
 * - Mobile hamburger menu with dropdown
 * - Scroll effect that adds shadow when scrolling down
 * - Theme toggle in the upper left corner
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";

interface NavBarProps {
  locale?: string;
}

// Main NavBar component that gets exported
export const NavBar = ({ locale: _locale }: NavBarProps) => {
  // State for mobile menu toggle and scroll detection
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll state for shadow effect
  useEffect(() => {
    const handleScroll = () => {
      // Add shadow when scrolled more than 10px
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle smooth scrolling to contact section
  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <nav
      className={`fixed top-0 right-0 left-0 z-50 w-full py-3 transition-all duration-300 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 ${isScrolled ? "shadow-lg" : "shadow-sm"}`}
      data-theme-bg="true"
    >
      {/* Theme Toggle in Very Top Corner */}
      <div className="absolute top-2 left-2 z-[1001]">
        <ThemeToggle />
      </div>

      <div className="w-full px-6">
        <div className="mx-auto flex h-12 max-w-[1400px] items-center justify-between">
          {/* Company Logo and Name */}
          <div className="flex items-center gap-4 ml-8">
            <div className="group flex flex-shrink-0 items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/images/logo/BTAI_Logo_Original.svg"
                  alt="Bridging Trust AI Logo"
                  width={108}
                  height={108}
                  className="mr-3 overflow-hidden rounded-full object-contain bg-[#f0f7fc] border-2 border-[#e5f1fa] transition-transform duration-300 group-hover:scale-110"
                />
                {/* Company name with gradient text effect */}
                <span
                  className="whitespace-nowrap font-bold text-[2.01rem] bg-gradient-to-r from-[#3A5F77] to-[#5B90B0] bg-clip-text text-transparent dark:from-[#5B90B0] dark:to-[#9CAEB8]"
                >
                  &nbsp;&nbsp;Bridging Trust AI
                </span>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation - always visible and right-justified */}
          <div className="ml-auto flex items-center gap-6">
            {/* Solutions link with hover underline effect */}
            <Link
              href="/#solutions"
              className="group relative overflow-hidden inline-block px-4 py-2 font-semibold text-[1.05rem] text-[#5B90B0] dark:text-[#9CAEB8] transition-colors hover:text-[#3A5F77] dark:hover:text-[#5B90B0]"
            >
              <span className="relative z-10">Solutions</span>
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#5B90B0] dark:bg-[#9CAEB8] transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {/* About link with hover underline effect */}
            <Link
              href="/#about"
              className="group relative overflow-hidden inline-block px-4 py-2 font-semibold text-[1.05rem] text-[#5B90B0] dark:text-[#9CAEB8] transition-colors hover:text-[#3A5F77] dark:hover:text-[#5B90B0]"
            >
              <span className="relative z-10">About</span>
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#5B90B0] dark:bg-[#9CAEB8] transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {/* Contact button styled as a call-to-action */}
            <a
              href="#contact"
              onClick={handleContactClick}
              className="inline-block cursor-pointer rounded-lg bg-[#5B90B0] dark:bg-[#3A5F77] px-6 py-2.5 text-[1.05rem] font-semibold text-white shadow-sm transition-all hover:bg-[#3A5F77] dark:hover:bg-[#5B90B0] hover:shadow-md"
            >
              Contact
            </a>
          </div>

          {/* Mobile Menu Button - hide on desktop */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 dark:text-gray-300 focus:outline-none"
              aria-label="Toggle menu"
            >
              {!isOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - only visible when isOpen is true and on small screens */}
      {isOpen && (
        <div className="absolute w-full bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 md:hidden">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/#solutions"
                className="py-2 font-semibold text-[#5B90B0] dark:text-[#9CAEB8] transition-colors hover:text-[#3A5F77] dark:hover:text-[#5B90B0]"
                onClick={() => setIsOpen(false)}
              >
                Solutions
              </Link>
              <Link
                href="/#about"
                className="py-2 font-semibold text-[#5B90B0] dark:text-[#9CAEB8] transition-colors hover:text-[#3A5F77] dark:hover:text-[#5B90B0]"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <a
                href="#contact"
                onClick={(e) => {
                  handleContactClick(e);
                  setIsOpen(false);
                }}
                className="py-2 font-semibold text-[#5B90B0] dark:text-[#9CAEB8] transition-colors hover:text-[#3A5F77] dark:hover:text-[#5B90B0] cursor-pointer"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
