"use client";

/**
 * ProcessSection Component
 *
 * The four-step engagement arc: Assess -> Design -> Build -> Operate.
 * Card styling mirrors the Solutions section so the two read as one system.
 */

const STEPS = [
  {
    number: "1",
    title: "Assess",
    description:
      "We map your workflows and find where AI genuinely earns its place.",
  },
  {
    number: "2",
    title: "Design",
    description:
      "We architect the solution and agree on scope, cost, and success criteria before any code.",
  },
  {
    number: "3",
    title: "Build",
    description:
      "We develop it in short cycles with working software you can react to.",
  },
  {
    number: "4",
    title: "Operate",
    description:
      "We deploy, measure, and hand over something your team can run.",
  },
] as const;

export const ProcessSection = () => {
  return (
    <section id="process" className="w-full py-20 px-6 bg-white dark:bg-gray-900">
      <div className="w-full max-w-[1280px] mx-auto px-6">
        <h2 className="text-2xl font-bold mb-6 text-center leading-tight text-gray-900 dark:text-gray-100">
          How We Work
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-[400px] md:max-w-none mx-auto md:mx-0 px-4 md:px-0">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4 text-blue-500 dark:text-blue-400 font-bold text-lg">
                {step.number}
              </div>
              <h3 className="text-xl font-bold mb-3 leading-tight text-gray-900 dark:text-gray-100">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
