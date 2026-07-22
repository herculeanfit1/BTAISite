"use client";

/**
 * AudienceSection Component
 *
 * Qualifies who the engagement model fits — deliberately exclusionary, so
 * that "an AI mandate looking for a use case" self-selects out.
 */
export const AudienceSection = () => {
  return (
    <section id="who-we-help" className="w-full py-20 px-6 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-[1280px] mx-auto px-6">
        <h2 className="text-2xl font-bold mb-6 text-center leading-tight text-gray-900 dark:text-gray-100">
          Who We Help
        </h2>
        <div className="max-w-3xl mx-auto text-gray-600 dark:text-gray-400 leading-relaxed">
          <p>
            We work best with mid-market and growth-stage organizations that have a
            specific workflow problem worth solving — not an AI mandate looking for a
            use case. Most of our clients run on Microsoft 365 and Azure, operate under
            real security or regulatory constraints, and have already discovered that
            off-the-shelf AI tools don&apos;t quite fit how they work.
          </p>
        </div>
      </div>
    </section>
  );
};
