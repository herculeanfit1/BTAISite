import { Metadata } from "next";
import { HomePageContent } from "../components/HomePageContent";

export const metadata: Metadata = {
  title: "Bridging Trust AI | Custom AI Solutions, Built to Ship",
  description:
    "We design and build custom AI systems — agents, automations, and integrations that run in production. Strategy through implementation, secure and governed by default.",
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