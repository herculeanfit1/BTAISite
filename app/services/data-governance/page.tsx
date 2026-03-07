import { Metadata } from "next";
import { ServicePageLayout } from "@/app/components/ServicePageLayout";

export const metadata: Metadata = {
  title: "Data Governance & Security for AI | Bridging Trust AI",
  description:
    "Data classification readiness, Microsoft Purview strategy, tenant exposure review, and DLP alignment for AI workloads. Get your data house in order before deploying Copilot.",
};

export default function DataGovernancePage() {
  return (
    <ServicePageLayout
      title="Data Governance & Security for AI"
      subtitle="AI is only as good as the data it can access — and only as safe as the controls around it."
      description="Before you deploy Microsoft Copilot or any AI tool that touches organizational data, you need to understand what data you have, how it\u2019s classified, who can access it, and what controls are in place. Most organizations find significant gaps when they look. We help you find and close those gaps before they become incidents."
      sections={[
        {
          heading: "Data Classification & Sensitivity Readiness",
          content:
            "AI tools like Copilot can surface any data a user has access to \u2014 including content that\u2019s overclassified, underclassified, or not classified at all. We assess your current data classification posture and build a practical remediation plan.",
          bullets: [
            "Current state assessment of classification and labeling maturity",
            "Sensitivity label taxonomy design or refinement",
            "Auto-labeling strategy and pilot recommendations",
            "Gap analysis between current state and AI-ready state",
          ],
        },
        {
          heading: "Microsoft Purview Governance Strategy",
          content:
            "Purview is the control plane for data governance in Microsoft 365 \u2014 but most organizations aren\u2019t using it to its full potential. We help you design a Purview strategy that supports both data governance and AI readiness.",
          bullets: [
            "Purview Information Protection configuration review",
            "Data Loss Prevention (DLP) policy alignment for AI workloads",
            "Retention and records management assessment",
            "Compliance portal configuration and monitoring setup",
          ],
        },
        {
          heading: "Tenant Data Exposure Review",
          content:
            "Before broad Copilot deployment, you need to understand your blast radius. We conduct a structured review of your Microsoft 365 tenant to identify overshared content, misconfigured permissions, and data exposure risks.",
          bullets: [
            "SharePoint and OneDrive permissions audit",
            "Oversharing identification and remediation planning",
            "Guest access and external sharing review",
            "Teams and Groups membership and data access assessment",
          ],
        },
        {
          heading: "AI-Specific Data Controls",
          content:
            "AI workloads introduce new data flow patterns \u2014 prompts, agent connections, grounding data, and generated outputs. Your data governance strategy needs to account for these new patterns.",
          bullets: [
            "Governance for AI prompts and generated content",
            "Copilot Studio connector and data source governance",
            "Knowledge base and grounding data access controls",
            "Logging, monitoring, and audit trail for AI data interactions",
          ],
        },
      ]}
      outcomes={[
        "A data classification readiness assessment with prioritized remediation steps",
        "A Purview governance strategy aligned to your AI adoption timeline",
        "A tenant exposure report identifying specific oversharing and permission risks",
        "DLP and retention policy recommendations for AI workloads",
        "A clear picture of what \u201Cdata-ready for AI\u201D looks like for your organization",
      ]}
      ctaHeading="Is your data ready for AI?"
      ctaDescription="Start with a Data Readiness Assessment to understand your classification gaps, permission risks, and Purview maturity before deploying Copilot."
      ctaButtonText="Request a Data Readiness Assessment"
      ctaInterest="data-readiness"
    />
  );
}
