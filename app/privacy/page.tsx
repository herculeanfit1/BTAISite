import { Metadata } from "next";
import { PrivacyContent } from "../components/legal/PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy | Bridging Trust AI",
  description:
    "Learn about how Bridging Trust AI handles your data and protects your privacy.",
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
