import React from "react";

interface IconProps {
  className?: string;
  size?: number;
}

export const NetworkPattern1 = ({ className = "", size = 100 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle
      cx="50"
      cy="50"
      r="48"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeOpacity="0.6"
    />
    <circle
      cx="50"
      cy="50"
      r="36"
      stroke="currentColor"
      strokeWidth="1"
      strokeOpacity="0.4"
    />
    <circle
      cx="50"
      cy="50"
      r="24"
      stroke="currentColor"
      strokeWidth="1"
      strokeOpacity="0.2"
    />
    <circle cx="20" cy="30" r="4" fill="currentColor" fillOpacity="0.6" />
    <circle cx="75" cy="65" r="4" fill="currentColor" fillOpacity="0.6" />
    <circle cx="40" cy="80" r="4" fill="currentColor" fillOpacity="0.6" />
    <path
      d="M20 30L40 80"
      stroke="currentColor"
      strokeWidth="0.5"
      strokeDasharray="2 2"
    />
    <path
      d="M20 30L75 65"
      stroke="currentColor"
      strokeWidth="0.5"
      strokeDasharray="2 2"
    />
    <path
      d="M40 80L75 65"
      stroke="currentColor"
      strokeWidth="0.5"
      strokeDasharray="2 2"
    />
  </svg>
);

export const NetworkPattern2 = ({ className = "", size = 100 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect
      x="5"
      y="5"
      width="90"
      height="90"
      rx="10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeOpacity="0.5"
    />
    <rect
      x="20"
      y="20"
      width="60"
      height="60"
      rx="6"
      stroke="currentColor"
      strokeWidth="1"
      strokeOpacity="0.3"
    />
    <circle cx="25" cy="25" r="5" fill="currentColor" fillOpacity="0.7" />
    <circle cx="75" cy="25" r="5" fill="currentColor" fillOpacity="0.7" />
    <circle cx="25" cy="75" r="5" fill="currentColor" fillOpacity="0.7" />
    <circle cx="75" cy="75" r="5" fill="currentColor" fillOpacity="0.7" />
    <circle cx="50" cy="50" r="8" fill="currentColor" fillOpacity="0.9" />
    <path d="M25 25L50 50" stroke="currentColor" strokeWidth="0.75" />
    <path d="M75 25L50 50" stroke="currentColor" strokeWidth="0.75" />
    <path d="M25 75L50 50" stroke="currentColor" strokeWidth="0.75" />
    <path d="M75 75L50 50" stroke="currentColor" strokeWidth="0.75" />
  </svg>
);

export const PlaceholderNetworkIcon = ({
  className = "",
  size = 50,
}: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 50 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Main circle with gradient */}
    <circle
      cx="25"
      cy="25"
      r="24"
      stroke="url(#networkGradient)"
      strokeWidth="1"
      strokeOpacity="0.6"
    />

    {/* Center node */}
    <circle cx="25" cy="25" r="4" fill="currentColor" fillOpacity="0.8" />

    {/* Outer nodes - smaller and more subtle */}
    <circle cx="12" cy="15" r="2.5" fill="currentColor" fillOpacity="0.5" />
    <circle cx="38" cy="15" r="2.5" fill="currentColor" fillOpacity="0.5" />
    <circle cx="12" cy="35" r="2.5" fill="currentColor" fillOpacity="0.5" />
    <circle cx="38" cy="35" r="2.5" fill="currentColor" fillOpacity="0.5" />

    {/* Connection lines - thinner and dashed for elegance */}
    <path
      d="M12 15L25 25"
      stroke="currentColor"
      strokeWidth="0.75"
      strokeOpacity="0.4"
      strokeDasharray="1 2"
    />
    <path
      d="M38 15L25 25"
      stroke="currentColor"
      strokeWidth="0.75"
      strokeOpacity="0.4"
      strokeDasharray="1 2"
    />
    <path
      d="M12 35L25 25"
      stroke="currentColor"
      strokeWidth="0.75"
      strokeOpacity="0.4"
      strokeDasharray="1 2"
    />
    <path
      d="M38 35L25 25"
      stroke="currentColor"
      strokeWidth="0.75"
      strokeOpacity="0.4"
      strokeDasharray="1 2"
    />

    {/* Inner ring */}
    <circle
      cx="25"
      cy="25"
      r="12"
      stroke="currentColor"
      strokeWidth="0.5"
      strokeOpacity="0.3"
    />

    {/* Gradient definition */}
    <defs>
      <linearGradient
        id="networkGradient"
        x1="0"
        y1="0"
        x2="50"
        y2="50"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="currentColor" stopOpacity="0.7" />
        <stop offset="1" stopColor="currentColor" stopOpacity="0.2" />
      </linearGradient>
    </defs>
  </svg>
);

export const CheckCircleIcon = ({ className = "", size = 20 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M6 10L9 13L14 7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Additional icons needed by NetworkMotifSection
export const NetworkIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className}`}
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

export const TrustBridgeIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className}`}
    width={size}
    height={size}
  >
    <path
      d="M3,17 L21,17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M6,17 C6,12 18,12 18,17"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <circle cx="6" cy="9" r="3" stroke="currentColor" strokeWidth="2" />
    <circle cx="18" cy="9" r="3" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const DataFlowIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className}`}
    width={size}
    height={size}
  >
    <path
      d="M4,12 L20,12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M16,8 L20,12 L16,16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x="2"
      y="4"
      width="6"
      height="16"
      rx="1"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

export const SecureAIIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className}`}
    width={size}
    height={size}
  >
    <path
      d="M12,3 L4,7 L4,12 C4,16.4183 7.58172,20 12,20 C16.4183,20 20,16.4183 20,12 L20,7 L12,3 Z"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M12,8 L12,14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M9,11 L15,11"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const ConnectedNodesIcon = ({
  className = "",
  size = 24,
}: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className}`}
    width={size}
    height={size}
  >
    <circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="2" />
    <circle cx="18" cy="6" r="3" stroke="currentColor" strokeWidth="2" />
    <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
    <circle cx="18" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
    <line
      x1="9"
      y1="6"
      x2="15"
      y2="6"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <line
      x1="6"
      y1="9"
      x2="6"
      y2="15"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <line
      x1="9"
      y1="18"
      x2="15"
      y2="18"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <line
      x1="18"
      y1="9"
      x2="18"
      y2="15"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);
