"use client";

/**
 * LevelingSection Component
 *
 * Displays the "The Challenges You're Facing" section with problem statements.
 */
export const LevelingSection = () => {
  return (
    <section id="leveling" className="w-full py-20 px-6 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-[1280px] mx-auto px-6">
        <h2 className="text-2xl font-bold mb-6 text-center leading-tight text-gray-900 dark:text-gray-100">
          The Challenges You&#39;re Facing
        </h2>
        <p className="mb-5 text-gray-600 dark:text-gray-400">
          Organizations across every industry are under pressure to adopt AI — but moving fast without the right foundation creates risk. These are the problems we solve.
        </p>
        <ul
          className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed max-w-4xl mx-auto list-disc pl-6"
        >
          <li className="mb-4">
            <span className="font-semibold text-gray-800 dark:text-gray-200">&ldquo;We want Copilot, but we don&#39;t know if our data is ready.&rdquo;</span>{" "}
            Most organizations have classification gaps, overshared content, and unclear retention policies that make broad AI deployment risky. We help you find and fix those gaps before they become incidents.
          </li>
          <li className="mb-4">
            <span className="font-semibold text-gray-800 dark:text-gray-200">&ldquo;We need AI governance before we can scale.&rdquo;</span>{" "}
            Leadership wants AI, but there&#39;s no framework for who approves what, how risk is assessed, or what acceptable use looks like. We build the governance structure so AI can move from pilot to production.
          </li>
          <li className="mb-4">
            <span className="font-semibold text-gray-800 dark:text-gray-200">&ldquo;We have too many environments and unclear controls.&rdquo;</span>{" "}
            Power Platform sprawl, ungoverned Copilot Studio agents, and inconsistent admin configurations create shadow AI risk. We help you inventory, rationalize, and govern.
          </li>
          <li className="mb-4">
            <span className="font-semibold text-gray-800 dark:text-gray-200">&ldquo;We need to enable AI without creating compliance exposure.&rdquo;</span>{" "}
            Regulated industries and security-conscious organizations can&#39;t afford to deploy AI and figure out compliance later. We align AI initiatives with your existing security, compliance, and risk posture from day one.
          </li>
        </ul>
      </div>
    </section>
  );
};
