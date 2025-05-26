import React from "react";

interface NetworkIconProps {
  className?: string;
  size?: number;
}

const NetworkIcon = ({ className = "", size = 24 }: NetworkIconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width={size}
    height={size}
  >
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="2" />
    <circle cx="20" cy="4" r="2" stroke="currentColor" strokeWidth="2" />
    <circle cx="4" cy="20" r="2" stroke="currentColor" strokeWidth="2" />
    <circle cx="20" cy="20" r="2" stroke="currentColor" strokeWidth="2" />
    <line
      x1="6"
      y1="4"
      x2="10"
      y2="10"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <line
      x1="18"
      y1="4"
      x2="14"
      y2="10"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <line
      x1="6"
      y1="20"
      x2="10"
      y2="14"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <line
      x1="18"
      y1="20"
      x2="14"
      y2="14"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

export default NetworkIcon;
