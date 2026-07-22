import { HeroSection } from "./components/home/HeroSection";
import { LevelingSection } from "./components/home/LevelingSection";
import { FeaturesSection } from "./components/home/FeaturesSection";
import { MethodologySection } from "./components/home/MethodologySection";
import { ProcessSection } from "./components/home/ProcessSection";
import { AudienceSection } from "./components/home/AudienceSection";
import { AboutSection } from "./components/home/AboutSection";
import { ContactSection } from "./components/home/ContactSection";

export default function HomePage() {
  return (
    <div className="w-full min-h-screen pt-20 leading-normal text-gray-900 dark:text-gray-100">
      <HeroSection />
      <LevelingSection />
      <FeaturesSection />
      <MethodologySection />
      <ProcessSection />
      <AudienceSection />
      <AboutSection />
      <ContactSection />
    </div>
  );
}
