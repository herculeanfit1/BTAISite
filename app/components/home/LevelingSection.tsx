"use client";

/**
 * ProblemSection Component (formerly LevelingSection)
 *
 * Displays the "AI is here. Trust isn't." problem statement section.
 */
export const LevelingSection = () => {
  return (
    <section id="leveling" className="w-full py-20 px-6 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-[1280px] mx-auto px-6">
        <h2 className="text-2xl font-bold mb-6 text-center leading-tight text-gray-900 dark:text-gray-100">
          AI is here. Trust isn&apos;t.
        </h2>
        <div className="max-w-3xl mx-auto text-gray-600 dark:text-gray-400 leading-relaxed">
          <p className="mb-5">
            Every organization is racing to deploy AI. Most are doing it wrong — not because
            the technology isn&apos;t ready, but because the relationship isn&apos;t.
          </p>
          <p className="mb-5">
            Your team treats AI like a search engine with extra steps. Your data governance
            wasn&apos;t built for systems that can read everything. Your executives ask
            &ldquo;how do we control AI?&rdquo; when the real question is &ldquo;how do we
            work with it?&rdquo;
          </p>
          <p className="mb-5">
            The result: wasted subscriptions, shadow AI usage, security exposure, and a
            workforce that&apos;s either afraid of AI or using it recklessly.
          </p>
          <p className="font-semibold text-gray-800 dark:text-gray-200 text-lg">
            The problem isn&apos;t the technology. It&apos;s the trust.
          </p>
        </div>
      </div>
    </section>
  );
};
