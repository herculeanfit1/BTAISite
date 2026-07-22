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
    label: "Strategy",
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
    title: "AI Strategy & Solution Design",
    description:
      "We start by finding where AI actually pays off in your business, then design something buildable. You get a clear recommendation and an architecture, not a deck full of possibilities.",
    bullets: [
      "Workflow discovery and use-case scoring by value and feasibility",
      "Build-vs-buy analysis and honest \u201Cdon\u2019t build this\u201D recommendations",
      "Solution architecture and data flow design",
      "Delivery roadmap with sequencing and effort estimates",
    ],
    cta: "For organizations that know AI should help somewhere, but need to know where first.",
  },
  {
    id: 2,
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
          d="M18 18.72a9.094 9.094 0 003.741-6.002M3.259 12.718A9.094 9.094 0 007 18.72m6-14.22a9.094 9.094 0 00-6 0M12 12a3 3 0 100-6 3 3 0 000 6zm0 0v6m-3-3h6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Custom AI Development",
    description:
      "We build the system. Agents, automations, and integrations designed around your workflows and your existing stack \u2014 not a generic product you have to bend your business around.",
    bullets: [
      "AI agents and assistants built on your data and processes",
      "Workflow and document automation, including retrieval and RAG pipelines",
      "LLM integration into existing applications and line-of-business systems",
      "Azure and Microsoft-ecosystem builds, plus self-hosted and local-model options when data can\u2019t leave your environment",
    ],
    cta: "For organizations that know what they want built and need a team that can actually ship it.",
  },
  {
    id: 3,
    label: "Operate",
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
    title: "Deployment & Ongoing Operations",
    description:
      "Shipping is the beginning, not the end. We deploy securely, prove it works, and make sure your team can run it after we\u2019re gone.",
    bullets: [
      "Secure deployment, identity, and least-privilege access design",
      "Evaluation, monitoring, and quality measurement in production",
      "Cost management and model routing strategy",
      "Documentation, handover, and team enablement",
    ],
    cta: "For organizations that have something running and need it to stay reliable, affordable, and owned in-house.",
  },
];
