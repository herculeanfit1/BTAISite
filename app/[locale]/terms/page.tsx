import { Metadata } from "next";
import { TermsContent } from "../../components/legal/TermsContent";

export const metadata: Metadata = {
  title: "Terms of Service | Bridging Trust AI",
  description:
    "The terms and conditions governing your use of Bridging Trust AI services.",
};

export default function TermsPage() {
  return <TermsContent />;
}
