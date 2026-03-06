import { Metadata } from "next";
import { ServicePageLayout } from "@/app/components/ServicePageLayout";

export const metadata: Metadata = {
  title: "Microsoft AI Enablement & Implementation | Bridging Trust AI",
  description:
    "Microsoft Copilot readiness, Copilot Studio governance, Power Platform controls, Entra and Intune hardening, and secure AI rollout patterns for Microsoft 365 environments.",
};

export default function EnablementPage() {
  return (
    <ServicePageLayout
      title="Microsoft AI Enablement & Implementation"
      subtitle="We don't just write the strategy — we help you implement the controls."
      description="Governance frameworks and data readiness are essential \u2014 but they only matter if you can turn them into operational reality. We help organizations take the final step from governance design to secure, governed AI deployment inside Microsoft 365. From readiness assessment to production rollout, we bring the implementation depth to make it work."
      sections={[
        {
          heading: "Microsoft Copilot Readiness & Deployment",
          content:
            "Copilot adoption involves far more than flipping a license switch. We guide you through the full readiness process \u2014 technical prerequisites, governance alignment, change management, and phased rollout \u2014 so your deployment succeeds on day one.",
          bullets: [
            "Copilot readiness assessment (technical, governance, and organizational)",
            "Phased rollout planning and success criteria",
            "License optimization and assignment strategy",
            "User readiness, training, and adoption support planning",
          ],
        },
        {
          heading: "Copilot Studio & Agent Governance",
          content:
            "Copilot Studio lets business users build AI agents \u2014 which is powerful but introduces new governance challenges. We help you set up the guardrails so innovation can happen safely.",
          bullets: [
            "Agent lifecycle governance (request, review, approve, monitor, retire)",
            "Connector and data source access controls",
            "Environment strategy for agent development vs. production",
            "Monitoring and compliance review processes",
          ],
        },
        {
          heading: "Power Platform Governance for AI",
          content:
            "Power Platform is often the first place organizations encounter ungoverned AI \u2014 Power Automate flows with AI Builder actions, Power Apps with Copilot features, and environments created without oversight. We help you take control.",
          bullets: [
            "Environment inventory and rationalization",
            "DLP policy design for Power Platform",
            "Maker governance and center of excellence patterns",
            "AI Builder and Copilot feature governance",
          ],
        },
        {
          heading: "Security Hardening & Admin Configuration",
          content:
            "AI deployment should tighten your security posture, not weaken it. We review and harden the admin-center configurations, Entra identity controls, and Intune policies that affect AI tool access and data flow.",
          bullets: [
            "Microsoft 365 admin center configuration review",
            "Entra ID conditional access policies for AI tools",
            "Intune compliance policies for AI-capable devices",
            "Security baseline alignment and gap analysis",
          ],
        },
        {
          heading: "Architecture Advisory & Implementation Support",
          content:
            "For organizations building custom AI solutions on Azure or integrating AI into existing workflows, we provide architecture review and implementation guidance grounded in security and governance best practices.",
          bullets: [
            "Azure AI and Azure OpenAI architecture patterns",
            "RAG (Retrieval-Augmented Generation) implementation guidance",
            "Integration patterns with Microsoft 365 and Azure services",
            "Secure development practices and deployment pipelines",
          ],
        },
      ]}
      outcomes={[
        "A Copilot readiness assessment with a clear go/no-go recommendation and remediation steps",
        "A phased deployment plan with governance checkpoints at each stage",
        "Agent and Power Platform governance policies ready for implementation",
        "Hardened admin-center and identity configurations",
        "Architecture guidance for custom AI solutions grounded in your security requirements",
      ]}
      ctaHeading="Ready to deploy AI in Microsoft 365?"
      ctaDescription="Start with a Copilot Readiness Review to assess your technical, governance, and organizational readiness for Microsoft AI adoption."
      ctaButtonText="Schedule a Copilot Readiness Review"
    />
  );
}
