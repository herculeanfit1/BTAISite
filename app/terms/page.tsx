import { Metadata } from "next";
import { TermsContent } from "../components/legal/TermsContent";

export const metadata: Metadata = {
  title: "Website Terms of Use",
  description:
    "The terms governing your use of the Bridging Trust AI website. Client engagements are governed by separate written agreements.",
};

export default function TermsPage() {
  return <TermsContent />;
}
