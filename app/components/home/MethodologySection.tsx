"use client";

/**
 * MethodologySection Component
 *
 * Displays the Bridging Trust AI methodology — the key differentiator.
 * Uses a darker background to set it apart visually.
 */

const PRINCIPLES = [
  {
    number: "1",
    title: "Meet the Intelligence Where It Is",
    description:
      "AI isn\u2019t a tool to command. It\u2019s an intelligence to collaborate with. When your team learns the difference, everything changes \u2014 from the quality of outputs to the speed of adoption to the confidence in results.",
  },
  {
    number: "2",
    title: "Trust Is Infrastructure, Not a Checkbox",
    description:
      "Compliance frameworks check boxes. We build the actual trust infrastructure: between humans and AI systems, between AI systems and each other, between your organization and the rapidly evolving AI landscape. This is what makes AI sustainable, not just deployable.",
  },
  {
    number: "3",
    title: "Measure What Matters",
    description:
      "We don\u2019t just implement and walk away. Our engagements include measurable baselines and improvement tracking so you can see \u2014 in real numbers \u2014 what the right approach produces versus the default one.",
  },
] as const;

export const MethodologySection = () => {
  return (
    <section id="methodology" className="w-full py-20 px-6 bg-gray-900 dark:bg-gray-950">
      <div className="w-full max-w-[1280px] mx-auto px-6">
        <h2 className="text-2xl font-bold mb-6 text-center leading-tight text-white">
          Our approach is different. Measurably.
        </h2>
        <div className="max-w-3xl mx-auto mb-12">
          <p className="mb-5 text-gray-300 leading-relaxed">
            Most AI consultants configure tools. We change how your team relates to the
            technology — and the results speak for themselves.
          </p>
          <p className="mb-5 text-gray-300 leading-relaxed">
            Our methodology is built on a simple insight that most of the industry has missed:{" "}
            <strong className="text-white">
              AI produces fundamentally better output when the interaction is right.
            </strong>{" "}
            Not marginally better. Measurably, demonstrably better.
          </p>
          <p className="text-gray-300 leading-relaxed">
            We&apos;ve spent thousands of hours studying how frontier models actually process
            information — what makes them perform at their best, where they break down, and why
            most people never get past surface-level results. That depth translates directly
            into better outcomes for your organization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PRINCIPLES.map((principle) => (
            <div
              key={principle.number}
              className="p-6 bg-gray-800 dark:bg-gray-900 rounded-lg border border-gray-700"
            >
              <div className="w-10 h-10 rounded-full bg-[#5B90B0]/20 flex items-center justify-center mb-4 text-[#7ECEC1] font-bold text-lg">
                {principle.number}
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                {principle.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {principle.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
