import { Metadata } from "next";
import { ProductTermsContent } from "../../components/legal/ProductTermsContent";

export const metadata: Metadata = {
  title: "Product License Terms | Bridging Trust AI",
  description:
    "Licence terms for Bridging Trust AI solutions deployed into your environment, and our commitments on scoped access, credential rotation, incident notification and decommission.",
};

export default function ProductTermsPage() {
  return <ProductTermsContent />;
}
