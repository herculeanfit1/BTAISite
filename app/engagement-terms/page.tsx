import { Metadata } from "next";
import { EngagementTermsContent } from "../components/legal/EngagementTermsContent";

export const metadata: Metadata = {
  title: "Engagement Terms",
  description:
    "How Bridging Trust AI handles ownership of custom work product, third-party components, and the limitations of the AI systems we build.",
};

export default function EngagementTermsPage() {
  return <EngagementTermsContent />;
}
