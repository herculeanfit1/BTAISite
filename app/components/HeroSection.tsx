"use client";

import React from "react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Button } from "./Button";
import { AnimatedBackground } from "./hero/AnimatedBackground";
import { PlaceholderImage } from "./hero/PlaceholderImage";
import { TrustIndicator } from "./hero/TrustIndicator";
import { Route } from "next";

interface HeroSectionProps {
  title: string;
  titleHighlight?: string;
  description?: string;
  subtitle?: string;
  primaryButton?: {
    text: string;
    href: Route<string>;
  };
  secondaryButton?: {
    text: string;
    href: Route<string>;
  };
  ctaButton?: {
    text: string;
    href: Route<string>;
  };
  image?: ReactNode;
  hasImagePlaceholder?: boolean;
}

export const HeroSection = ({
  title,
  titleHighlight,
  description,
  subtitle,
  primaryButton,
  secondaryButton,
  ctaButton,
  image,
  hasImagePlaceholder = false,
}: HeroSectionProps) => {
  const [isMounted, setIsMounted] = useState(false);

  // Format title with highlighted part if provided
  const formattedTitle = titleHighlight
    ? title.replace(
        titleHighlight,
        `<span class="gradient-text">${titleHighlight}</span>`
      )
    : title;

  // Use either description or subtitle
  const displayText = description || subtitle || "";

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Simple skeleton version for server-side rendering to prevent hydration issues
  const skeleton = (
    <section className="hero-section relative flex min-h-[90vh] items-center overflow-hidden pt-32 pb-24">
      <div className="relative z-10 container flex flex-col items-center gap-16 lg:flex-row">
        <div className="flex-1 text-center lg:text-left">
          <div className="mb-8 inline-block">
            <span className="rounded-full bg-gray-100 px-5 py-2 text-sm dark:bg-gray-800">
              AI Consulting & Implementation
            </span>
          </div>

          <h1
            className="mb-6 text-4xl font-extrabold md:text-5xl lg:text-6xl"
            dangerouslySetInnerHTML={{ __html: formattedTitle }}
          />

          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-700 md:text-xl lg:mx-0 dark:text-gray-300">
            {displayText}
          </p>

          {(primaryButton || secondaryButton || ctaButton) && (
            <div className="flex flex-col justify-center gap-5 sm:flex-row lg:justify-start">
              {primaryButton && (
                <Button href={primaryButton.href} size="lg">
                  {primaryButton.text}
                </Button>
              )}
              {ctaButton && (
                <Button href={ctaButton.href} size="lg">
                  {ctaButton.text}
                </Button>
              )}
              {secondaryButton && (
                <Button href={secondaryButton.href} variant="outline" size="lg">
                  {secondaryButton.text}
                </Button>
              )}
            </div>
          )}
        </div>

        {(image || hasImagePlaceholder) && (
          <div className="flex flex-1 justify-center">
            <div className="relative w-full max-w-lg">
              <div className="dark:bg-dark/40 relative rounded-2xl border border-white/30 bg-white/20 p-6 shadow-xl dark:border-white/10">
                {image ? (
                  <div className="overflow-hidden rounded-xl">{image}</div>
                ) : (
                  hasImagePlaceholder && (
                    <div className="mx-auto aspect-square max-w-md rounded-2xl bg-gray-100 dark:bg-gray-800"></div>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );

  // If not mounted yet, return the skeleton version
  if (!isMounted) {
    return skeleton;
  }

  // Full version with animations and complex elements
  return (
    <section className="hero-section relative flex min-h-[90vh] items-center overflow-hidden pt-32 pb-24 transition-opacity duration-500">
      {/* Animated background */}
      <AnimatedBackground />

      <div className="relative z-10 container flex flex-col items-center gap-16 lg:flex-row">
        <div className="flex-1 text-center lg:text-left">
          {/* Tag line */}
          <div className="mb-8 inline-block">
            <span className="from-primary/20 to-accent/20 text-primary inline-flex items-center rounded-full bg-gradient-to-r px-5 py-2 text-sm font-medium backdrop-blur-sm dark:text-white">
              <span className="bg-primary mr-2 h-2 w-2 animate-pulse rounded-full"></span>
              AI Consulting & Implementation
            </span>
          </div>

          {/* Main heading */}
          <h1
            className="mb-6 text-4xl font-extrabold md:text-5xl lg:text-6xl"
            dangerouslySetInnerHTML={{ __html: formattedTitle }}
          />

          {/* Description text */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-700 md:text-xl lg:mx-0 dark:text-gray-300">
            {displayText}
          </p>

          {/* Action buttons */}
          {(primaryButton || secondaryButton || ctaButton) && (
            <div className="flex flex-col justify-center gap-5 sm:flex-row lg:justify-start">
              {primaryButton && (
                <Button
                  href={primaryButton.href}
                  size="lg"
                  className="from-primary to-primary-dark bg-gradient-to-r text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  {primaryButton.text}
                </Button>
              )}
              {ctaButton && (
                <Button
                  href={ctaButton.href}
                  size="lg"
                  className="from-primary to-primary-dark bg-gradient-to-r text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  {ctaButton.text}
                </Button>
              )}
              {secondaryButton && (
                <Button
                  href={secondaryButton.href}
                  variant="outline"
                  size="lg"
                  className="hover:bg-primary/5 border-2 transition-all duration-300 hover:-translate-y-1"
                >
                  {secondaryButton.text}
                </Button>
              )}
            </div>
          )}

          {/* Trust indicators */}
          <div className="mt-12">
            <div className="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <TrustIndicator text="ISO Certified" />
              <TrustIndicator text="GDPR Compliant" />
              <TrustIndicator text="Trusted by 100+ Organizations" />
            </div>
          </div>
        </div>

        {/* Right side - Image or placeholder */}
        {(image || hasImagePlaceholder) && (
          <div className="flex flex-1 justify-center">
            <div className="relative w-full max-w-lg">
              {/* Glass card effect */}
              <div className="from-primary/10 to-accent/10 absolute -inset-2 rounded-2xl bg-gradient-to-r opacity-50 blur-xl"></div>
              <div className="dark:bg-dark/40 relative rounded-2xl border border-white/30 bg-white/20 p-6 shadow-xl backdrop-blur-xl dark:border-white/10">
                {image ? (
                  <div className="overflow-hidden rounded-xl">{image}</div>
                ) : (
                  hasImagePlaceholder && (
                    <div className="mx-auto w-full max-w-[280px]">
                      <PlaceholderImage />
                    </div>
                  )
                )}
              </div>

              {/* Floating badges */}
              <div
                className="dark:bg-dark/80 text-primary animate-float absolute -bottom-6 -left-6 rounded-lg border border-white/50 bg-white px-4 py-2 text-sm font-semibold shadow-lg backdrop-blur-sm dark:border-white/10"
                style={{ animationDelay: "1s" }}
              >
                Enterprise Ready
              </div>
              <div
                className="dark:bg-dark/80 text-accent animate-float absolute -top-6 -right-6 rounded-lg border border-white/50 bg-white px-4 py-2 text-sm font-semibold shadow-lg backdrop-blur-sm dark:border-white/10"
                style={{ animationDelay: "2s" }}
              >
                AI Powered
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Wave bottom shape */}
      <div className="absolute bottom-0 left-0 h-16 w-full overflow-hidden">
        <svg
          className="dark:fill-dark absolute bottom-0 h-auto w-full fill-white"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
          ></path>
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
          ></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
        </svg>
      </div>
    </section>
  );
};
