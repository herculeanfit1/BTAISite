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
import { Logo } from "./NavBar/Logo";
import { DesktopNav } from "./NavBar/DesktopNav";
import { MobileNav } from "./NavBar/MobileNav";

interface NavBarProps {
  locale?: string;
}

/**
 * Main NavBar component that gets exported
 */
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

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-30 w-full bg-white py-3 transition-all duration-300 ${
        isScrolled ? "border-b border-gray-200 shadow-md" : ""
      }`}
    >
      <div className="w-full px-6">
        <div className="mx-auto flex h-12 max-w-[1400px] items-center justify-between">
          <Logo />
          <DesktopNav />
          <MobileNav isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
      </div>
    </header>
  );
};
