import { Metadata } from "next";
import { HomePageContent } from "../components/HomePageContent";

export const metadata: Metadata = {
  title: "Bridging Trust AI — Better AI Starts With Better Relationships",
  description:
    "We help organizations build the trust infrastructure that makes AI actually work. AI governance, team enablement, and agent architecture for companies ready to lead in the age of AI.",
};

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function Home(props: PageProps) {
  const params = await props.params;
  
  // Use locale for potential future internationalization
  if (process.env.NODE_ENV === 'development') {
    console.warn(`Rendering page for locale: ${params.locale}`);
  }

  return <HomePageContent />;
}