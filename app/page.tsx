import { HeroSection } from "./components/home/HeroSection";
import { LevelingSection } from "./components/home/LevelingSection";
import { FeaturesSection } from "./components/home/FeaturesSection";
import { GlobeOverlaySection } from "./components/home/GlobeOverlaySection";
import { AboutSection } from "./components/home/AboutSection";
import { ContactSection } from "./components/home/ContactSection";

export default function HomePage() {
  return (
    <div className="w-full min-h-screen pt-20 leading-normal text-gray-900 dark:text-gray-100">
      <HeroSection />
      <LevelingSection />
      <FeaturesSection />
      <GlobeOverlaySection />
      <AboutSection />
      <ContactSection />
    </div>
  );
}
