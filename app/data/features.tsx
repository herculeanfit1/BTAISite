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
  bullets: string[];
  link?: string;
}

/**
 * Feature data with SVG icons
 * Three governance-aligned service pillars:
 * - Card 1: AI Governance & Readiness
 * - Card 2: Data Governance & Security for AI
 * - Card 3: Microsoft AI Enablement & Implementation
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
    title: "AI Governance & Readiness",
    description:
      "We help organizations build the governance frameworks, policies, and operational structures needed to adopt AI responsibly and at scale.",
    bullets: [
      "AI governance frameworks and steering committee design",
      "Acceptable use policies and responsible AI guardrails",
      "Risk tiering, evidence checklists, and control mapping",
      "Alignment with NIST AI RMF, SOC 2, and emerging regulatory expectations",
      "AI adoption governance for Microsoft 365 environments",
    ],
    link: "/services/governance",
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
    title: "Data Governance & Security for AI",
    description:
      "AI is only as good as the data it can access — and only as safe as the controls around it. We help you get your data house in order before broad AI deployment.",
    bullets: [
      "Data classification and sensitivity labeling readiness",
      "Microsoft Purview-aligned governance strategy",
      "Tenant data exposure review before Copilot rollout",
      "Access, retention, and DLP alignment for AI workloads",
      "Governance for prompts, agents, and connected data sources",
    ],
    link: "/services/data-governance",
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
    title: "Microsoft AI Enablement & Implementation",
    description:
      "We don't just write the strategy — we help you implement the controls. From readiness assessment to secure rollout, we turn AI governance into operational reality.",
    bullets: [
      "Microsoft Copilot readiness assessment and deployment planning",
      "Copilot Studio and agent governance",
      "Power Platform governance for AI use cases",
      "Entra, Intune, and admin-center hardening for AI readiness",
      "Licensing advisory and secure rollout patterns",
    ],
    link: "/services/enablement",
  },
];
