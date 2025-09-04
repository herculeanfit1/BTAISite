import { Metadata } from "next";
import { HomePageContent } from "../components/HomePageContent";

export const metadata: Metadata = {
  title: "Bridging Trust AI - Ethical AI Solutions",
  description:
    "Building ethical AI solutions that enhance human capabilities while maintaining transparency.",
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