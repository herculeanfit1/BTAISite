import { HeroSection } from "./HeroSection";
import { LevelingSection } from "./LevelingSection";
import { FeaturesSection } from "./FeaturesSection";
import { MethodologySection } from "./MethodologySection";
import { ProcessSection } from "./ProcessSection";
import { AudienceSection } from "./AudienceSection";
import { AboutSection } from "./AboutSection";
import { ContactSection } from "./ContactSection";

/**
 * The single homepage composition.
 *
 * This replaces two copies that carried a comment asking the next person to
 * "stay in sync" — app/page.tsx and the former HomePageContent.tsx. They had
 * already drifted: only one of them applied `pt-20`, the padding that clears
 * the fixed navbar. The reachable route is `/` (every `/{locale}` path 301s to
 * a canonical top-level path at the edge), so `pt-20` is the live behaviour and
 * is what this component keeps.
 *
 * Server component by design — none of these sections needs client state at
 * this level, and `"use client"` here would opt the whole homepage in.
 */
export function HomeSections() {
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
