"use client";

/**
 * ProblemSection Component (formerly LevelingSection)
 *
 * Displays the "The Challenges You're Facing" problem statement section.
 */

const PROBLEMS = [
  {
    title: "We’ve run pilots. Nothing made it to production.",
    description:
      "Demos are easy. Production is hard — integration, error handling, access control, cost, and the organizational work of getting people to change how they work. We take projects the last mile.",
  },
  {
    title: "We know AI could help here. We don’t know what to build.",
    description:
      "The hardest part is picking the right first problem. We assess your workflows, score the opportunities on value and feasibility, and tell you honestly which ones aren’t worth doing.",
  },
  {
    title:
      "Our team doesn’t have the bandwidth or the AI experience to build it.",
    description:
      "Your engineers are already busy, and AI systems fail in unfamiliar ways. We build alongside your team and hand over something they can actually maintain.",
  },
  {
    title: "We can’t ship anything our security team will approve.",
    description:
      "Sensitive data, regulated workflows, and audit requirements kill most off-the-shelf AI tools. We design for those constraints from the first architecture conversation, not after the review.",
  },
] as const;

export const LevelingSection = () => {
  return (
    <section id="leveling" className="w-full py-20 px-6 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-[1280px] mx-auto px-6">
        <h2 className="text-2xl font-bold mb-6 text-center leading-tight text-gray-900 dark:text-gray-100">
          The Challenges You&apos;re Facing
        </h2>
        <p className="max-w-3xl mx-auto mb-12 text-center text-gray-600 dark:text-gray-400 leading-relaxed">
          Most organizations don&apos;t have an AI idea problem. They have a delivery
          problem — the gap between a promising demo and a system people actually use
          every day. These are the problems we solve.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-[400px] md:max-w-none mx-auto md:mx-0 px-4 md:px-0">
          {PROBLEMS.map((problem) => (
            <div
              key={problem.title}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700"
            >
              <h3 className="text-xl font-bold mb-4 leading-tight text-gray-900 dark:text-gray-100">
                {problem.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
