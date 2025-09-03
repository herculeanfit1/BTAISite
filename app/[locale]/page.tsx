import { Metadata } from "next";
import { HeroSection } from "../components/home/HeroSection";
import { LevelingSection } from "../components/home/LevelingSection";
import { FeaturesSection } from "../components/home/FeaturesSection";
import { AboutSection } from "../components/home/AboutSection";
import { ContactSection } from "../components/home/ContactSection";
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
  const { locale } = params;

  return <HomePageContent />;
}