"use client";

import { useState, useEffect, useCallback } from "react";
import { LazyMotion, domAnimation, m, MotionConfig } from "motion/react";

const HEADLINE_WORDS = [
  "Most",
  "AI",
  "pilots",
  "never",
  "reach",
  "production.",
  "We",
  "build",
  "the",
  "ones",
  "that",
  "do.",
];

const SHIMMER_WORD = "production.";

const SUBHEADLINE_LEAD =
  "Bridging Trust AI designs and builds custom AI systems — agents, automations, and integrations that run in production, not in a demo.";

const SUBHEADLINE_TAIL =
  "We start with strategy, we finish with working software, and everything we ship is secure and governed by default.";

const ARIA_LABEL = `Most AI pilots never reach production. We build the ones that do. ${SUBHEADLINE_LEAD} ${SUBHEADLINE_TAIL}`;

const wordVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export function HeroAnimatedContent() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
  }, []);

  const handleCtaClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const url = new URL(window.location.href);
      url.searchParams.set("interest", "general");
      window.history.replaceState({}, "", url.toString());
      const el = document.getElementById("contact");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    },
    [],
  );

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>
        <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 text-center">
          {/* Headline with staggered word reveal */}
          <m.h1
            className="font-extrabold leading-[1.05] mx-auto w-full mt-0 mb-6 sm:mb-8 text-3xl sm:text-5xl md:text-6xl lg:text-7xl"
            style={{ textWrap: "balance", maxWidth: 900 }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {HEADLINE_WORDS.map((word, i) => (
              <m.span
                key={i}
                className={`inline-block mr-[0.3em] ${
                  word === SHIMMER_WORD
                    ? "hero-shimmer bg-clip-text text-transparent"
                    : "text-[#F5F0EB]"
                }`}
                variants={wordVariants}
                transition={{
                  duration: 0.5,
                  ease: [0.2, 0.65, 0.3, 0.9],
                }}
              >
                {word}
              </m.span>
            ))}
          </m.h1>

          {/* Subheadline */}
          <div
            className="min-h-20 md:min-h-16 flex flex-col items-center justify-center mb-10 gap-2"
            aria-label={ARIA_LABEL}
          >
            <span className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed">
              {SUBHEADLINE_LEAD}
            </span>
            <span className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed">
              {SUBHEADLINE_TAIL}
            </span>
          </div>

          {/* CTA Button */}
          <m.div
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <a
              href="#contact"
              onClick={handleCtaClick}
              className="inline-block rounded-xl px-8 py-4 text-lg font-semibold bg-[#5B90B0] dark:bg-[#7ECEC1] text-white dark:text-gray-900 transition-all duration-300 hover:bg-[#3A5F77] dark:hover:bg-[#5B90B0] dark:hover:text-white hover:shadow-[0_0_24px_rgba(91,144,176,0.4)]"
            >
              Book an AI Opportunity Assessment &rarr;
            </a>
          </m.div>

          {/* Trust Strip */}
          <m.div
            className="mt-12"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <p className="text-sm text-gray-400 opacity-70 mb-4">
              Strategy through implementation
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                "AI Agents",
                "Automation",
                "Integration",
              ].map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-white/20 px-4 py-1.5 text-xs text-gray-400"
                >
                  {badge}
                </span>
              ))}
            </div>
          </m.div>
        </div>
      </LazyMotion>
    </MotionConfig>
  );
}
