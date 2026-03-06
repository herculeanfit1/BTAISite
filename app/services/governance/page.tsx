import { Metadata } from "next";
import { ServicePageLayout } from "@/app/components/ServicePageLayout";

export const metadata: Metadata = {
  title: "AI Governance & Readiness | Bridging Trust AI",
  description:
    "AI governance frameworks, steering committee design, risk tiering, and adoption governance for Microsoft 365 environments. Move from AI experimentation to governed execution.",
};

export default function GovernancePage() {
  return (
    <ServicePageLayout
      title="AI Governance & Readiness"
      subtitle="Build the frameworks and operational structures to adopt AI responsibly and at scale."
      description="Most organizations know they need AI governance — but few know where to start. Without a clear framework, AI adoption becomes a patchwork of ad hoc decisions, ungoverned pilots, and growing risk exposure. We help you design and implement the governance structures that let AI scale with confidence."
      sections={[
        {
          heading: "Governance Framework Design",
          content:
            "We build AI governance frameworks tailored to your organization\u2019s size, risk tolerance, and regulatory landscape. This isn\u2019t a template exercise \u2014 it\u2019s a structured process that produces a living governance model your organization can operate and evolve.",
          bullets: [
            "AI governance charter and operating model",
            "Roles, responsibilities, and decision rights",
            "Governance committee structure and cadence",
            "Integration with existing IT and security governance",
          ],
        },
        {
          heading: "Policy & Acceptable Use",
          content:
            "Clear policies are the foundation of governed AI adoption. We help you define what acceptable use looks like \u2014 for employees, for specific tools, and for different risk levels \u2014 so your teams know what\u2019s expected before they start.",
          bullets: [
            "AI acceptable use policy development",
            "Tool-specific usage guidelines (Copilot, Copilot Studio, Power Platform)",
            "Prompt governance and data handling expectations",
            "Policy communication and training recommendations",
          ],
        },
        {
          heading: "Risk Assessment & Control Mapping",
          content:
            "Not all AI use cases carry the same risk. We help you classify and tier AI initiatives based on data sensitivity, business impact, and regulatory exposure \u2014 then map appropriate controls to each tier.",
          bullets: [
            "AI use case risk tiering methodology",
            "Evidence checklists and approval workflows",
            "Control mapping to SOC 2, NIST AI RMF, ISO 27001, and emerging frameworks",
            "Regulatory horizon scanning (EU AI Act, state-level AI legislation)",
          ],
        },
        {
          heading: "Adoption Governance for Microsoft 365",
          content:
            "If your organization runs on Microsoft 365, your AI governance strategy must account for the specific tools, admin controls, and data flows in that ecosystem. We bring deep Microsoft knowledge to your governance design.",
          bullets: [
            "Microsoft 365 Copilot governance and rollout controls",
            "Copilot Studio agent governance and approval processes",
            "Power Platform environment strategy and DLP policies",
            "Admin center configuration review and hardening",
          ],
        },
      ]}
      outcomes={[
        "A documented AI governance framework your organization can operate immediately",
        "Acceptable use policies ready for leadership approval and company-wide distribution",
        "A risk tiering model with evidence checklists for evaluating new AI initiatives",
        "A clear roadmap from current state to governed AI adoption",
        "Steering committee design with charter, membership, and meeting cadence",
      ]}
      ctaHeading="Ready to govern AI with confidence?"
      ctaDescription="Start with an AI Governance Readiness Assessment to understand where you stand and what\u2019s needed to move forward."
      ctaButtonText="Book a Governance Assessment"
      ctaInterest="governance-assessment"
    />
  );
}
