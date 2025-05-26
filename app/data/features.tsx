import React from "react";

/**
 * FeatureData Type
 *
 * Defines the structure of a feature object displayed in the Features section
 */
export interface FeatureData {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}

/**
 * Feature data with SVG icons
 * Each feature contains:
 * - id: Unique identifier
 * - icon: SVG element for the feature icon
 * - title: Display name of the feature (updated for business value messaging)
 * - description: Detailed explanation of the feature (updated to focus on business outcomes)
 * - link: URL to learn more about the feature
 *
 * UPDATED: July 2024 - Changed headline and copy to focus on specific AI solution offerings:
 * - Card 1: Executive Enablement (Leadership Accelerator)
 * - Card 2: Copilot Compliance (Governance & Compliance)
 * - Card 3: App Development (Scalable AI Engineering)
 */
export const features: FeatureData[] = [
  {
    id: 1,
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9 6.75V15M15 9V17.25M4.5 19.5H19.5C20.3284 19.5 21 18.8284 21 18V6C21 5.17157 20.3284 4.5 19.5 4.5H4.5C3.67157 4.5 3 5.17157 3 6V18C3 18.8284 3.67157 19.5 4.5 19.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "AI Leadership Accelerator",
    description:
      "Empower your leadership team to strategically leverage AI. Our executive programs provide the knowledge and tools to drive successful AI adoption at the highest level of your organization.",
    link: "/coming-soon",
  },
  {
    id: 2,
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9 12.75L11.25 15L15 9.75M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Governance & Compliance Solutions",
    description:
      "Implement AI tools safely with our comprehensive governance framework. We ensure your AI deployments comply with regulations while maintaining security, ethics, and risk management.",
    link: "/coming-soon",
  },
  {
    id: 3,
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17.25 6.75L22.5 12L17.25 17.25M6.75 17.25L1.5 12L6.75 6.75M14.25 3.75L9.75 20.25"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Scalable AI Engineering",
    description:
      "Build custom AI applications tailored to your specific business needs. Our engineering team creates scalable, secure solutions that deliver immediate ROI while future-proofing your technology investment.",
    link: "/coming-soon",
  },
];
