"use client";

import Image from "next/image";

/**
 * About Section Component
 * Displays company information and founder bios
 */
export const AboutSection = () => {
  return (
    <section id="about" className="w-full py-20 px-6 bg-white dark:bg-gray-900">
      <div className="w-full max-w-[1280px] mx-auto px-6">
        <h2 className="text-2xl font-bold mb-6 text-center leading-tight text-gray-900 dark:text-gray-100">
          Who we are
        </h2>
        <div className="max-w-4xl mx-auto">
          {/* Body */}
          <div className="mb-12 text-gray-600 dark:text-gray-400 leading-relaxed">
            <p className="mb-5">
              Bridging Trust AI was founded on a simple frustration: the organizations that
              would benefit most from AI are the ones least served by it. Enterprise vendors
              build for enterprise budgets, and off-the-shelf tools assume your business
              works like everyone else&apos;s. We build custom AI systems for organizations
              that don&apos;t fit the template — with the security and engineering discipline
              usually reserved for much larger companies.
            </p>
            <p className="mb-5">
              We run our own AI agent systems in production. We&apos;ve built agent-to-agent
              communication on the official Google A2A protocol. We maintain persistent AI
              assistants with sophisticated memory architectures. We&apos;ve tested our
              methodology across frontier models from Anthropic, OpenAI, Google, and the
              open-source ecosystem.
            </p>
            <p className="mb-5">
              When we build for your organization, we&apos;re not reading from a playbook we
              downloaded last week. We&apos;re drawing on thousands of hours of hands-on
              experience with the same technology we&apos;re deploying for you.
            </p>
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
                  Hands-on AI and cloud engineer — Azure architecture, full-stack
                  development, automation and CI/CD pipelines, and agentic AI systems
                  built on Docker orchestration and secure agent deployment, including
                  multiple n8n AI environments running 200k+ executions. Behind that,
                  ~20 years designing and securing Microsoft cloud and on-premises
                  environments across Microsoft 365, Azure, and Entra ID. That
                  governance and compliance depth is why the systems he builds pass
                  security review the first time.
                </p>
              </div>

              {/* Founder 2 - Bill (right) */}
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700">
                <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-600 mx-auto mb-6 overflow-hidden flex justify-center items-center">
                  <Image
                    src="/team/bill.schneider.jpeg"
                    alt="Bill Schneider"
                    width={128}
                    height={128}
                    className="object-cover w-full h-full scale-125"
                  />
                </div>
                <h3 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-gray-100">
                  Bill Schneider
                </h3>
                <p className="text-blue-500 dark:text-blue-400 text-center mb-4">
                  Co-Founder
                </p>
                <p className="text-center leading-relaxed text-gray-600 dark:text-gray-400">
                  Director of Technical Support, K&amp;E Consulting. 25-year systems
                  administrator specializing in enterprise infrastructure, Microsoft 365
                  environments, and AI adoption. Pioneer in AI agent relationship
                  methodology and the operational bridge between enterprise IT and frontier
                  AI capabilities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
