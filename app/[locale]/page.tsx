import { Metadata } from "next";
import { HeroSection } from "../components/home/HeroSection";
import { LevelingSection } from "../components/home/LevelingSection";
import { FeaturesSection } from "../components/home/FeaturesSection";
import { AboutSection } from "../components/home/AboutSection";
import { ContactSection } from "../components/home/ContactSection";
import { ResponsiveWrapper } from "../components/ResponsiveWrapper";

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

  return (
    <ResponsiveWrapper>
      {(isDesktop) => (
        <div
          style={{
            fontFamily:
              'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            lineHeight: 1.5,
            color: "#1F1F25",
            width: "100%",
            minHeight: "100vh",
            WebkitTextSizeAdjust: "100%", // Safari-specific text size adjustment
          }}
        >
          {/* Hero Section */}
          <HeroSection />

          {/* Leveling the Playing Field Section */}
          <LevelingSection />

          {/* Features Section */}
          <FeaturesSection isDesktop={isDesktop} />

          {/* About Us Section */}
          <AboutSection isDesktop={isDesktop} />

          {/* Contact Section */}
          <ContactSection />
        </div>
      )}
    </ResponsiveWrapper>
  );
}