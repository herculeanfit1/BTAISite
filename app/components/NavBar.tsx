"use client";

/**
 * NavBar Component
 *
 * A responsive navigation bar for the Bridging Trust AI website that includes:
 * - Company logo and name with gradient text effect
 * - Desktop navigation menu with hover effects
 * - Mobile hamburger menu with dropdown
 * - Scroll effect that adds shadow when scrolling down
 *
 * The component ensures proper spacing, sizing, and responsive behavior
 * to match the production website appearance.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

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
      className={`fixed top-0 right-0 left-0 z-50 w-full transition-all duration-300 ${isScrolled ? "shadow-lg" : "shadow-sm"}`}
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(10px)",
        borderBottom: isScrolled ? "1px solid #e5e7eb" : "1px solid rgba(229, 231, 235, 0.3)",
        paddingTop: "0.75rem",
        paddingBottom: "0.75rem",
      }}
    >
      <div className="w-full px-6">
        <div className="mx-auto flex h-12 max-w-[1400px] items-center justify-between">
          {/* Company Logo and Name */}
          <div className="group flex flex-shrink-0 items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logo/BTAI_Logo_Original.svg"
                alt="Bridging Trust AI Logo"
                width={83}
                height={83}
                className="mr-3 overflow-hidden rounded-full transition-transform duration-300 group-hover:scale-110"
                style={{
                  objectFit: "contain",
                  borderRadius: "50%",
                  backgroundColor: "#f0f7fc",
                  border: "2px solid #e5f1fa",
                }}
              />
                            {/* Company name with gradient text effect */}
              <span
                className="text-xl font-bold whitespace-nowrap"
                style={{
                  fontWeight: "700",
                  fontSize: "1.75rem",
                  background: "linear-gradient(90deg, #3A5F77 0%, #5B90B0 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  color: "#3A5F77", // Fallback for browsers that don't support gradient text
                }}
              >
                   Bridging Trust AI
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - always visible and right-justified */}
          <div className="ml-auto flex items-center" style={{ gap: "2rem" }}>
            {/* Solutions link with hover underline effect */}
            <Link
              href="/#solutions"
              className="group relative px-4 py-2 font-semibold text-[#5B90B0] transition-colors hover:text-[#3A5F77]"
              style={{
                fontWeight: 600,
                overflow: "hidden",
                fontSize: "1.05rem",
                display: "inline-block",
              }}
            >
              <span className="relative z-10">Solutions</span>
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#5B90B0] transition-all duration-300 group-hover:w-full"></span>
            </Link>
            
            {/* About link with hover underline effect */}
            <Link
              href="/#about"
              className="group relative px-4 py-2 font-semibold text-[#5B90B0] transition-colors hover:text-[#3A5F77]"
              style={{
                fontWeight: 600,
                overflow: "hidden",
                fontSize: "1.05rem",
                display: "inline-block",
              }}
            >
              <span className="relative z-10">About</span>
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#5B90B0] transition-all duration-300 group-hover:w-full"></span>
            </Link>
            
            {/* Contact button styled as a call-to-action */}
            <a
              href="#contact"
              onClick={handleContactClick}
              className="rounded-lg px-6 py-2 font-medium text-white transition-all hover:bg-[#3A5F77] hover:shadow-md cursor-pointer"
              style={{
                backgroundColor: "#5B90B0",
                fontWeight: 600,
                color: "white",
                fontSize: "1.05rem",
                padding: "10px 24px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                display: "inline-block",
              }}
            >
              Contact
            </a>
          </div>

          {/* Mobile Menu Button - hide on desktop */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="absolute top-3 right-6 text-gray-600 focus:outline-none"
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
        <div className="absolute w-full bg-white shadow-lg md:hidden" style={{ backgroundColor: "rgba(255, 255, 255, 0.98)", backdropFilter: "blur(10px)" }}>
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/#solutions"
                className="py-2 font-semibold text-[#5B90B0] transition-colors hover:text-[#3A5F77]"
                onClick={() => setIsOpen(false)}
              >
                Solutions
              </Link>
              <Link
                href="/#about"
                className="py-2 font-semibold text-[#5B90B0] transition-colors hover:text-[#3A5F77]"
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
                className="py-2 font-semibold text-[#5B90B0] transition-colors hover:text-[#3A5F77] cursor-pointer"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
