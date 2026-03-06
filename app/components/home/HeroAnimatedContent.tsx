"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LazyMotion,
  domAnimation,
  m,
  AnimatePresence,
  MotionConfig,
} from "motion/react";

const HEADLINE_WORDS = [
  "AI",
  "that",
  "earns",
  "trust,",
  "one",
  "partnership",
  "at",
  "a",
  "time.",
];

const ROTATING_PHRASES = [
  "How can AI improve my operations?",
  "Is my data ready for AI?",
  "What's the ROI of AI adoption?",
  "How do I build an AI-ready team?",
];

const ARIA_LABEL = `Helping businesses answer questions like: ${ROTATING_PHRASES.join(", ")}`;

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
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % ROTATING_PHRASES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [reducedMotion]);

  const handleCtaClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
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
            className="font-extrabold leading-[1.05] mx-auto w-full mt-0 mb-6 sm:mb-8 text-5xl md:text-6xl lg:text-7xl"
            style={{ textWrap: "balance", maxWidth: 900 }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {HEADLINE_WORDS.map((word, i) => (
              <m.span
                key={i}
                className={`inline-block mr-[0.3em] ${
                  word === "trust,"
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

          {/* Subheadline with word rotation */}
          <div
            className="h-16 md:h-12 flex items-center justify-center mb-10"
            aria-label={ARIA_LABEL}
          >
            <span className="text-xl md:text-2xl text-gray-300 mr-2">
              Helping businesses answer:
            </span>
            <span className="relative inline-block w-[320px] md:w-[380px] h-8 text-left overflow-hidden">
              <AnimatePresence mode="wait">
                <m.span
                  key={phraseIndex}
                  className="absolute left-0 text-xl md:text-2xl font-medium text-[#7ECEC1] whitespace-nowrap"
                  initial={reducedMotion ? false : { y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={reducedMotion ? undefined : { y: -20, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  {ROTATING_PHRASES[phraseIndex]}
                </m.span>
              </AnimatePresence>
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
              Start a Conversation &rarr;
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
              Trusted by forward-thinking organizations
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                "Enterprise Ready",
                "SOC 2 Aligned",
                "NIST Framework",
                "Microsoft Ecosystem",
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
