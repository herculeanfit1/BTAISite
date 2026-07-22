"use client";

/**
 * MethodologySection Component — the "How We Build" trust band.
 *
 * Carries the security, data-boundary, auditability and handover commitments
 * that used to sit at the service-pillar level. Uses a darker background to
 * set it apart visually.
 */

const PRINCIPLES = [
  {
    number: "1",
    title: "Secure by default",
    description:
      "Least-privilege access, scoped credentials, and no standing permissions. Security decisions get made in the architecture, not bolted on before launch.",
  },
  {
    number: "2",
    title: "Your data stays where it should",
    description:
      "We design around your data boundaries — including fully self-hosted models when nothing can leave your environment. You decide what the system sees.",
  },
  {
    number: "3",
    title: "Auditable by design",
    description:
      "Every AI decision path is logged and explainable. When someone asks why the system did what it did, there’s an answer.",
  },
  {
    number: "4",
    title: "Built to be handed over",
    description:
      "Documented, tested, and owned by your team at the end. No black boxes and no dependency on us to keep it running.",
  },
] as const;

export const MethodologySection = () => {
  return (
    <section id="methodology" className="w-full py-20 px-6 bg-gray-900 dark:bg-gray-950">
      <div className="w-full max-w-[1280px] mx-auto px-6">
        <h2 className="text-2xl font-bold mb-6 text-center leading-tight text-white">
          How We Build
        </h2>
        <div className="max-w-3xl mx-auto mb-12">
          <p className="text-gray-300 leading-relaxed text-center">
            The parts most AI shops skip &mdash; and the reason our work survives a
            security review.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
