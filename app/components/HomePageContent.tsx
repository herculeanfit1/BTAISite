import { HeroSection } from "./home/HeroSection";
import { LevelingSection } from "./home/LevelingSection";
import { FeaturesSection } from "./home/FeaturesSection";
import { AboutSection } from "./home/AboutSection";
import { ContactSection } from "./home/ContactSection";

/**
 * HomePageContent Component
 *
 * Renders all homepage sections. Used by the locale-routed page.
 */
export const HomePageContent = () => {
  return (
    <div className="w-full min-h-screen leading-normal text-gray-900 dark:text-gray-100">
      <HeroSection />
      <LevelingSection />
      <FeaturesSection />
      <AboutSection />
      <ContactSection />
    </div>
  );
};
