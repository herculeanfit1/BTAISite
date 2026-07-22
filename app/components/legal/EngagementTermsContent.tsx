import React from "react";
import Link from "next/link";

/**
 * EngagementTermsContent — single source for the engagement terms page prose.
 *
 * Rendered by both the locale and non-locale routes so the two can never
 * drift. Edit the legal text here and nowhere else.
 *
 * SCOPE: this page carries only terms that can be stated without counsel
 * review — intellectual property, AI system limitations, and third-party
 * components. Liability, indemnification, warranty, acceptance, termination
 * and governing law are deliberately absent and live in the engagement
 * agreement. Do not add them here.
 */

export const EngagementTermsContent = () => {
  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-900 pb-16 leading-normal">
      {/* Header Section */}
      <div className="w-full pt-24 pb-12 px-6 text-center bg-[#3A5F77] dark:bg-[#2A4A5C]">
        <div className="w-full max-w-[1280px] mx-auto px-6">
          <h1 className="text-4xl font-bold mb-4 leading-tight text-white">
            Engagement Terms &mdash; Intellectual Property, AI Systems &amp; Components
          </h1>
          <p className="text-lg max-w-3xl mx-auto mb-6 text-white/90">
            How we handle ownership of what we build, and what you should know
            about the AI systems we deliver.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <section className="w-full py-12 px-6 bg-white dark:bg-gray-900">
        <div className="w-full max-w-[1280px] mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Last Updated */}
            <div className="mb-12">
              <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-gray-100">Last Updated:</span> July 22, 2026
              </p>
            </div>

            {/* Scope of this document */}
            <div className="mb-12 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">Scope of This Document</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                This document is <span className="font-semibold text-gray-900 dark:text-gray-100">supplemental</span>. It is not a complete agreement and it is not the whole of the terms that govern an engagement.
              </p>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                It states how we handle intellectual property and what we disclose about AI systems, so that you can review those positions before we speak. Commercial terms &mdash; scope, price, schedule, acceptance, warranty, liability, indemnification and termination &mdash; are set out in the written engagement agreement and its statement of work.
              </p>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                Publishing this page is not an offer, and viewing it does not create an engagement or bind either party. These terms take effect only when incorporated into a signed engagement agreement.
              </p>
            </div>

            {/* Ownership of Work Product */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">Ownership of Work Product</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                Our default position is that you own what we build for you.
              </p>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-gray-100">Foreground work product</span> &mdash; the source code, configurations, prompts, infrastructure definitions and documentation created specifically for your engagement &mdash; is assigned to you upon full payment. You may use, modify, extend and maintain it without further permission from us and without any continuing dependency on us.
              </p>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-gray-100">Background intellectual property</span> &mdash; the tooling, scaffolding, libraries, internal frameworks, methodologies and general-purpose components that we bring to the engagement, or develop independently of it &mdash; remains ours. Where background intellectual property is incorporated into your deliverables, you receive a perpetual, irrevocable, worldwide licence to use it as part of those deliverables. We remain free to reuse it on other engagements.
              </p>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                Productized solutions that we license into your environment are governed separately by our{" "}
                <Link href="/product-terms" className="text-blue-500 dark:text-[#7BA8C4] hover:underline">Product License Terms</Link>, not by this section. Those solutions remain our property and are licensed, not assigned.
              </p>
            </div>

            {/* Third-Party and Open-Source Components */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">Third-Party and Open-Source Components</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                Deliverables will normally include third-party and open-source components. Those components are not ours to assign; they remain subject to their own licences, which pass through to you with the deliverable.
              </p>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                AI systems also depend on third-party model providers and cloud services governed by their own terms. Which providers a solution depends on is identified during design, so that you can assess those terms before we build on them.
              </p>
            </div>

            {/* What You Should Know About AI Systems */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">What You Should Know About AI Systems</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                AI systems behave differently from conventional software, and we would rather say so plainly than have it discovered after delivery.
              </p>
              <ul className="list-disc pl-6 mb-8 leading-relaxed text-lg text-gray-600 dark:text-gray-400">
                <li className="mb-4">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">They are not deterministic.</span> The same input can produce different output on different runs. Systems are designed to tolerate this, but it cannot be eliminated.
                </li>
                <li className="mb-4">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Output can be wrong.</span> AI systems can produce inaccurate, incomplete or fabricated results that read as confident and plausible. Where output informs a consequential decision, the system is designed to keep a person in the loop, and we will say so during design rather than after.
                </li>
                <li className="mb-4">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Model providers change things outside our control.</span> Providers deprecate models, alter behaviour, change pricing and adjust their own terms on their own schedule. This can affect a working system without any change on your side or ours.
                </li>
                <li className="mb-4">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Behaviour drifts over time.</span> A system that performs well at handover may perform differently months later as models, data and usage change. Ongoing evaluation is how that is detected, and it is a distinct service from building the system.
                </li>
                <li className="mb-4">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Modification changes behaviour.</span> Once work product is assigned to you and your team modifies it, its behaviour is no longer something we can speak to.
                </li>
              </ul>
            </div>

            {/* Related Documents */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">Related Documents</h2>
              <ul className="list-disc pl-6 mb-8 leading-relaxed text-lg text-gray-600 dark:text-gray-400">
                <li className="mb-4">
                  <Link href="/terms" className="text-blue-500 dark:text-[#7BA8C4] hover:underline">Website Terms of Use</Link> &mdash; your use of this website
                </li>
                <li className="mb-4">
                  <Link href="/product-terms" className="text-blue-500 dark:text-[#7BA8C4] hover:underline">Product License Terms</Link> &mdash; solutions we deploy into your environment
                </li>
                <li className="mb-4">
                  <Link href="/privacy" className="text-blue-500 dark:text-[#7BA8C4] hover:underline">Privacy Policy</Link> &mdash; how we handle personal information
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">Contact Us</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                Questions about these terms before an engagement are welcome and expected. Reach us through the{" "}
                <Link href="/#contact" className="text-blue-500 dark:text-[#7BA8C4] hover:underline">contact form</Link>.
              </p>
            </div>

            {/* Back to Home Link */}
            <div>
              <Link href="/" className="inline-flex items-center mt-8 text-lg font-medium text-blue-500 dark:text-[#7BA8C4] hover:underline">
                <span className="mr-2">&larr;</span> Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
