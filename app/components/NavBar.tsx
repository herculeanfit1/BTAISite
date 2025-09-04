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
 *
 * The component ensures proper spacing, sizing, and responsive behavior
 * to match the production website appearance.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";

interface NavBarProps {
  locale?: string;
}

// Main NavBar component that gets exported
export const NavBar = ({ locale }: NavBarProps) => {
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

  // Handle mobile menu toggle
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const mobileMenu = document.querySelector('[data-mobile-menu]');
      const toggleButton = document.querySelector('[data-toggle="mobile-menu"]');
      
      if (isOpen && !mobileMenu?.contains(target) && !toggleButton?.contains(target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

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
    <header
      role="navigation"
      className={`sticky top-0 z-50 w-full transition-all duration-300 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/80 dark:supports-[backdrop-filter]:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700 ${isScrolled ? "shadow-lg" : "shadow-sm"}`}
      data-theme-bg="true"
    >
      {/* Theme Toggle in Very Top Corner */}
      <div className="absolute top-2 left-2 z-[1001]">
        <ThemeToggle />
      </div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-3">
          {/* Brand - Mobile-first with proper truncation */}
          <Link href="/" className="flex items-center gap-2 min-w-0 max-w-[70%] sm:max-w-none">
            <Image
              src="/images/logo/BTAI_Logo_Original.svg"
              alt="Bridging Trust AI Logo"
              width={36}
              height={36}
              className="h-9 w-9 rounded-full shrink-0 transition-transform duration-300 hover:scale-110"
              style={{
                objectFit: "contain",
                borderRadius: "50%",
                backgroundColor: "#f0f7fc",
                border: "2px solid #e5f1fa",
              }}
            />
            <span className="truncate whitespace-nowrap text-lg font-semibold leading-tight sm:text-xl bg-gradient-to-r from-[#3A5F77] to-[#5B90B0] bg-clip-text text-transparent dark:from-[#5B90B0] dark:to-[#9CAEB8]">
              Bridging Trust AI
            </span>
          </Link>

          {/* Mobile menu button */}
          <button
            className="inline-flex items-center justify-center rounded-md border px-2 py-1 lg:hidden"
            aria-controls="site-menu"
            aria-expanded={isOpen}
            aria-label="Toggle menu"
            data-toggle="mobile-menu"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="sr-only">Open menu</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Desktop nav - hidden on mobile */}
          <div id="site-menu" className="hidden items-center gap-6 lg:flex">
            <Link
              href="/#solutions"
              className="group relative px-4 py-2 font-semibold text-[#5B90B0] dark:text-[#9CAEB8] transition-colors hover:text-[#3A5F77] dark:hover:text-[#5B90B0]"
            >
              <span className="relative z-10">Solutions</span>
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#5B90B0] dark:bg-[#9CAEB8] transition-all duration-300 group-hover:w-full"></span>
            </Link>
            
            <Link
              href="/#about"
              className="group relative px-4 py-2 font-semibold text-[#5B90B0] dark:text-[#9CAEB8] transition-colors hover:text-[#3A5F77] dark:hover:text-[#5B90B0]"
            >
              <span className="relative z-10">About</span>
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#5B90B0] dark:bg-[#9CAEB8] transition-all duration-300 group-hover:w-full"></span>
            </Link>
            
            <a
              href="#contact"
              onClick={handleContactClick}
              className="rounded-lg px-6 py-2 font-medium text-white bg-[#5B90B0] dark:bg-[#3A5F77] transition-all hover:bg-[#3A5F77] dark:hover:bg-[#5B90B0] hover:shadow-md cursor-pointer"
            >
              Contact
            </a>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {isOpen && (
        <div className="border-t lg:hidden" data-mobile-menu>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2 space-y-2">
            <Link
              href="/#solutions"
              className="block py-2 font-semibold text-[#5B90B0] dark:text-[#9CAEB8] transition-colors hover:text-[#3A5F77] dark:hover:text-[#5B90B0]"
              onClick={() => setIsOpen(false)}
            >
              Solutions
            </Link>
            <Link
              href="/#about"
              className="block py-2 font-semibold text-[#5B90B0] dark:text-[#9CAEB8] transition-colors hover:text-[#3A5F77] dark:hover:text-[#5B90B0]"
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
              className="block py-2 font-semibold text-[#5B90B0] dark:text-[#9CAEB8] transition-colors hover:text-[#3A5F77] dark:hover:text-[#5B90B0] cursor-pointer"
            >
              Contact
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
