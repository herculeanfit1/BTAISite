"use client";

import React from "react";
import {
  NetworkIcon,
  TrustBridgeIcon,
  DataFlowIcon,
  SecureAIIcon,
  ConnectedNodesIcon,
  NetworkPattern1,
  NetworkPattern2,
} from "./icons/NetworkIcons";

interface NetworkMotifSectionProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export const NetworkMotifSection: React.FC<NetworkMotifSectionProps> = ({
  title = "Network of Trust",
  subtitle = "Our technology is built on a foundation of interconnected trust and security.",
  className = "",
}) => {
  return (
    <section className={`relative overflow-hidden py-16 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
            {title}
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-gray-700 dark:text-gray-300">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Connected Systems */}
          <div className="group rounded-xl border border-gray-100/60 bg-white/80 p-8 shadow-sm backdrop-blur-sm transition-all duration-300 hover:translate-y-[-4px] hover:shadow-md dark:border-gray-700/40 dark:bg-gray-800/90">
            <div className="text-primary mb-6 h-12 w-12 transform transition-transform duration-300 group-hover:scale-110">
              <NetworkIcon size={48} />
            </div>
            <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
              Connected Systems
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Our solutions create a network of trust between AI and human
              decision-makers.
            </p>
          </div>

          {/* Trust Framework */}
          <div className="group rounded-xl border border-gray-100/60 bg-white/80 p-8 shadow-sm backdrop-blur-sm transition-all duration-300 hover:translate-y-[-4px] hover:shadow-md dark:border-gray-700/40 dark:bg-gray-800/90">
            <div className="text-primary mb-6 h-12 w-12 transform transition-transform duration-300 group-hover:scale-110">
              <TrustBridgeIcon size={48} />
            </div>
            <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
              Trust Framework
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              We build bridges between powerful AI capabilities and human values
              and ethics.
            </p>
          </div>

          {/* Transparent Data Flow */}
          <div className="group rounded-xl border border-gray-100/60 bg-white/80 p-8 shadow-sm backdrop-blur-sm transition-all duration-300 hover:translate-y-[-4px] hover:shadow-md dark:border-gray-700/40 dark:bg-gray-800/90">
            <div className="text-primary mb-6 h-12 w-12 transform transition-transform duration-300 group-hover:scale-110">
              <DataFlowIcon size={48} />
            </div>
            <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
              Transparent Data Flow
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Clear visibility into how data is processed, used, and protected
              throughout the AI lifecycle.
            </p>
          </div>

          {/* Secure Implementation */}
          <div className="group rounded-xl border border-gray-100/60 bg-white/80 p-8 shadow-sm backdrop-blur-sm transition-all duration-300 hover:translate-y-[-4px] hover:shadow-md dark:border-gray-700/40 dark:bg-gray-800/90">
            <div className="text-primary mb-6 h-12 w-12 transform transition-transform duration-300 group-hover:scale-110">
              <SecureAIIcon size={48} />
            </div>
            <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
              Secure Implementation
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Enterprise-grade security practices built into every AI solution
              we deliver.
            </p>
          </div>
        </div>

        <div className="mt-20 text-center">
          <div className="from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 inline-block rounded-full bg-gradient-to-br p-8 shadow-inner backdrop-blur-sm">
            <div className="text-primary animate-pulse-soft h-24 w-24">
              <ConnectedNodesIcon size={96} />
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="text-primary absolute -top-20 -left-20 h-80 w-80 opacity-5 dark:opacity-10">
        <NetworkPattern1 className="text-primary" />
      </div>
      <div className="text-accent absolute -right-20 -bottom-20 h-80 w-80 opacity-5 dark:opacity-10">
        <NetworkPattern2 className="text-accent" />
      </div>
    </section>
  );
};
