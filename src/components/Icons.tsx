import React from "react";

interface IconProps {
  className?: string;
  size?: number;
  color?: string;
}

// A collection of optimized SVG icons
export const Icons = {
  // Analytics icon - smooth graph representation
  Analytics: ({
    className = "",
    size = 16,
    color = "currentColor",
  }: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 3v18h18" />
      <path d="M18 9l-6-6-7 7" />
      <path d="M18 17V9" />
      <path d="M11 9v8" />
      <path d="M6 12v5" />
    </svg>
  ),

  // AI icon - brain with neural connections
  AI: ({ className = "", size = 16, color = "currentColor" }: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2a8 8 0 0 0-8 8c0 2.2.9 4.2 2.3 5.6" />
      <path d="M20 15.6A8 8 0 0 0 12 2" />
      <path d="M9 22h6" />
      <path d="M12 16v6" />
      <path d="M14.2 10.4l-4.4.9" />
      <path d="M12 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
      <path d="M17 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
      <path d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
    </svg>
  ),

  // Security icon - shield with checkmark
  Security: ({
    className = "",
    size = 16,
    color = "currentColor",
  }: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),

  // Research icon - magnifying glass with document
  Research: ({
    className = "",
    size = 16,
    color = "currentColor",
  }: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
      <path d="M12 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v3.5" />
      <circle cx="16.5" cy="17.5" r="2.5" />
      <path d="M18.5 19.5 21 22" />
    </svg>
  ),

  // Ethics icon - balance scales
  Ethics: ({
    className = "",
    size = 16,
    color = "currentColor",
  }: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3v18" />
      <path d="M5 7h14" />
      <path d="M3 10c1-1 2-1 3-1 1.5 0 3 1 3 3 0 3-2 4-2 4" />
      <path d="M17 10c1-1 2-1 3-1 1.5 0 3 1 3 3 0 3-2 4-2 4" />
      <path d="M3 21h18" />
    </svg>
  ),

  // Consulting icon - discussion/chat bubbles
  Consulting: ({
    className = "",
    size = 16,
    color = "currentColor",
  }: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
      <path d="M16 6a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" />
      <path d="M12 20a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
    </svg>
  ),

  // Integration icon - connecting pieces/puzzle
  Integration: ({
    className = "",
    size = 16,
    color = "currentColor",
  }: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 16v-5a2 2 0 0 1 2-2h16" />
      <path d="M7 9H3" />
      <path d="M11 6v5a2 2 0 0 1-2 2H3" />
      <path d="M16 16v-3a2 2 0 0 1 2-2h3" />
      <circle cx="18" cy="18" r="3" />
      <circle cx="8" cy="19" r="3" />
      <circle cx="20" cy="8" r="3" />
    </svg>
  ),

  // Check icon - checkmark in circle
  Check: ({ className = "", size = 16, color = "currentColor" }: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),

  // Cross icon - X in circle
  Cross: ({ className = "", size = 16, color = "currentColor" }: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
};
