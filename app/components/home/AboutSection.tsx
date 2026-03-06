"use client";

import Image from "next/image";

/**
 * About Section Component
 * Displays company information, founders, and approach
 */
export const AboutSection = () => {
  return (
    <section id="about" className="w-full py-20 px-6 bg-white dark:bg-gray-900">
      <div className="w-full max-w-[1280px] mx-auto px-6">
        <h2 className="text-2xl font-bold mb-6 text-center leading-tight text-gray-900 dark:text-gray-100">
          About Us
        </h2>
        <div className="max-w-4xl mx-auto">
          {/* Origin Story */}
          <div className="mb-16">
            <h3 className="text-xl font-bold mb-4 leading-tight text-gray-900 dark:text-gray-100">
              Our Story
            </h3>
            <p className="mb-5 text-gray-600 dark:text-gray-400">
              Bridging Trust AI was founded on a straightforward observation: organizations are under enormous pressure to adopt AI, but most lack the governance, data readiness, and operational discipline to do it safely. Our founders bring decades of combined experience architecting secure, governed environments across Microsoft 365, Azure, and complex enterprise infrastructure. We started Bridging Trust AI to help organizations close the gap between AI ambition and operational reality — so they can adopt AI with confidence, not just enthusiasm.
            </p>
          </div>

          {/* Mission Section */}
          <div className="mb-16">
            <h3 className="text-xl font-bold mb-4 leading-tight text-gray-900 dark:text-gray-100">
              Our Mission
            </h3>
            <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 mb-8">
              <p className="text-xl italic leading-relaxed text-gray-600 dark:text-gray-300">
                &ldquo;To help organizations adopt AI with the governance, security, and operational discipline needed to scale with confidence.&rdquo;
              </p>
            </div>
          </div>

          {/* Founders Section */}
          <div className="mb-16">
            <h3 className="text-xl font-bold mb-4 leading-tight text-gray-900 dark:text-gray-100">
              Our Founders
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[400px] md:max-w-full mx-auto md:mx-0 px-4 md:px-0">
              {/* Founder 1 - Terence (left) */}
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700">
                <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-600 mx-auto mb-6 overflow-hidden flex justify-center items-center">
                  <Image
                    src="/team/terence.kolstad.png"
                    alt="Terence Kolstad"
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-gray-100">
                  Terence Kolstad
                </h3>
                <p className="text-blue-500 dark:text-blue-400 text-center mb-4">
                  Co-Founder
                </p>
                <p className="text-center leading-relaxed text-gray-600 dark:text-gray-400">
                  Terence Kolstad is a Minnesota-based technology strategist and AI governance advisor who helps organizations adopt AI with the structure, security, and data discipline needed to scale responsibly. With 18 years of experience designing, building, and securing cloud and on-premises environments, he brings a practical operator&#39;s perspective to AI readiness, Microsoft 365 governance, and secure modernization. His work sits at the intersection of AI governance, data governance, security, and Microsoft technologies — helping organizations evaluate risk, strengthen data foundations, and operationalize tools like Microsoft Copilot with confidence. As Co-Founder of Bridging Trust AI, he focuses on helping clients move beyond AI hype into governed execution — where innovation, productivity, and trust grow together.
                </p>
              </div>

              {/* Founder 2 - Bill (right) */}
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700">
                <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-600 mx-auto mb-6 overflow-hidden flex justify-center items-center">
                  {/* Placeholder for Bill's image */}
                </div>
                <h3 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-gray-100">
                  Bill Schneider
                </h3>
                <p className="text-blue-500 dark:text-blue-400 text-center mb-4">
                  Co-Founder
                </p>
                <p className="text-center leading-relaxed text-gray-600 dark:text-gray-400">
                  Bill Schneider brings 25 years of IT leadership to Bridging Trust AI, with deep experience helping organizations align technology strategy with business outcomes. His expertise spans Microsoft 365, Azure, security architecture, and the operational governance that makes technology adoption sustainable. Bill&#39;s focus at Bridging Trust AI is on helping leadership teams navigate AI adoption with clarity — ensuring that governance, security, and practical implementation work together rather than in tension. He specializes in translating complex technical and compliance requirements into actionable roadmaps that leadership, IT, and security stakeholders can align around.
                </p>
              </div>
            </div>
          </div>

          {/* Our Approach */}
          <div className="mb-16">
            <h3 className="text-xl font-bold mb-4 leading-tight text-gray-900 dark:text-gray-100">
              Our Approach
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="text-xl font-bold mb-3 text-center text-gray-900 dark:text-gray-100">
                  Governance-First
                </h4>
                <p className="text-center text-gray-600 dark:text-gray-400">
                  Every engagement starts with understanding your risk posture, compliance requirements, and organizational readiness. We build the governance foundation before deploying capabilities.
                </p>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="text-xl font-bold mb-3 text-center text-gray-900 dark:text-gray-100">
                  Security-Aligned
                </h4>
                <p className="text-center text-gray-600 dark:text-gray-400">
                  AI adoption must work within your existing security and compliance framework, not around it. We align AI initiatives with your controls, policies, and regulatory obligations.
                </p>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="text-xl font-bold mb-3 text-center text-gray-900 dark:text-gray-100">
                  Implementation-Ready
                </h4>
                <p className="text-center text-gray-600 dark:text-gray-400">
                  We don&#39;t stop at strategy decks. Our work produces actionable frameworks, hardened configurations, and operational playbooks your team can execute and maintain.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
