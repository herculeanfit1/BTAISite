import dynamic from "next/dynamic";
import { HeroScrollIndicator } from "./HeroScrollIndicator";

const HeroBackground = dynamic(() => import("./HeroBackground"), {
  ssr: false,
});

const HeroAnimatedContent = dynamic(
  () =>
    import("./HeroAnimatedContent").then((mod) => ({
      default: mod.HeroAnimatedContent,
    })),
  { ssr: false },
);

/**
 * HeroSection — Server Component shell
 *
 * Renders the full hero as static HTML (visible before JS loads).
 * Client sub-components enhance with animations after hydration.
 */
export const HeroSection = () => {
  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden hero-aurora pt-20">
      {/* Static aurora gradient is applied via the hero-aurora class */}

      {/* Client-side animated background layers (orbs + particles) */}
      <HeroBackground />

      {/* SSR fallback: static text visible before JS */}
      <noscript>
        <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 text-center">
          <h1
            className="font-extrabold leading-[1.05] mx-auto w-full mt-0 mb-6 sm:mb-8 text-5xl md:text-6xl lg:text-7xl text-[#F5F0EB]"
            style={{ textWrap: "balance", maxWidth: 900 }}
          >
            AI that earns trust, one partnership at a time.
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10">
            Helping businesses answer: How can AI improve my operations?
          </p>
          <a
            href="#contact"
            className="inline-block rounded-xl px-8 py-4 text-lg font-semibold bg-[#5B90B0] text-white"
          >
            Start a Conversation &rarr;
          </a>
        </div>
      </noscript>

      {/* Client-side animated text content */}
      <HeroAnimatedContent />

      {/* Scroll indicator */}
      <HeroScrollIndicator />
    </section>
  );
};
