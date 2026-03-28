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
  label: string;
  description: string;
  bullets: string[];
  cta: string;
  link?: string;
}

/**
 * Feature data with SVG icons
 * Three service pillars: Govern, Relate, Build
 */
export const features: FeatureData[] = [
  {
    id: 1,
    label: "Govern",
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
    title: "AI Governance & Data Readiness",
    description:
      "Before your organization can trust AI, your data has to be trustworthy. We assess your Microsoft 365 environment, implement data classification and governance with Purview, and build the compliance foundation that makes AI deployment defensible.",
    bullets: [
      "Microsoft Copilot readiness assessment",
      "Data governance and classification",
      "AI acceptable use policy development",
      "Compliance alignment (HIPAA, SOC 2, financial services)",
      "Shadow AI detection and remediation",
    ],
    cta: "For organizations that need to get their house in order before \u2014 or alongside \u2014 AI adoption.",
  },
  {
    id: 2,
    label: "Relate",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18 18.72a9.094 9.094 0 003.741-6.002M3.259 12.718A9.094 9.094 0 007 18.72m6-14.22a9.094 9.094 0 00-6 0M12 12a3 3 0 100-6 3 3 0 000 6zm0 0v6m-3-3h6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "AI Interaction Training & Workshops",
    description:
      "Your team\u2019s relationship with AI determines your ROI. We run hands-on workshops that transform how your people work with AI \u2014 from tentative prompt-and-pray to confident, strategic collaboration that produces real business value.",
    bullets: [
      "Executive AI orientation sessions",
      "Team-specific workflow integration workshops",
      "Model interaction methodology training",
      "AI readiness assessment (where does your team actually stand?)",
      "Ongoing advisory retainer for evolving AI landscape",
    ],
    cta: "For organizations where the technology is deployed but the adoption isn\u2019t happening \u2014 or isn\u2019t producing the results you expected.",
  },
  {
    id: 3,
    label: "Build",
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
    title: "Agent Architecture & AI Infrastructure",
    description:
      "The next wave of AI isn\u2019t chat interfaces. It\u2019s autonomous agents that work alongside your team, communicate with each other, and operate on your behalf. We design and implement the agent infrastructure that makes this possible and secure.",
    bullets: [
      "Autonomous agent architecture design",
      "Agent-to-agent communication (Google A2A protocol)",
      "Agent trust and identity verification",
      "Memory system design for persistent AI assistants",
      "Custom agent deployment on enterprise infrastructure",
    ],
    cta: "For organizations ready to move beyond chatbots into agentic AI \u2014 and need a partner who understands both the technology and the trust requirements.",
  },
];
