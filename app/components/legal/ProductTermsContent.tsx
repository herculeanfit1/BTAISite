import React from "react";
import Link from "next/link";

/**
 * ProductTermsContent — single source for the product license terms prose.
 *
 * Rendered by both the locale and non-locale routes so the two can never
 * drift. Edit the legal text here and nowhere else.
 *
 * SCOPE: licence grant plus commitments Bridging Trust AI makes about
 * identities it operates inside a customer environment. Liability,
 * indemnification, warranty, acceptance, termination and governing law are
 * deliberately absent and live in the signed agreement. Do not add them here.
 *
 * The identity section is written CONDITIONALLY ("Where Bridging Trust AI
 * operates an application identity...") because the identity architecture is
 * per-product and is specified in each product's deployment documentation.
 * Do not replace it with a blanket assertion about who owns the app
 * registration.
 */

export const ProductTermsContent = () => {
  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-900 pb-16 leading-normal">
      {/* Header Section */}
      <div className="w-full pt-24 pb-12 px-6 text-center bg-[#3A5F77] dark:bg-[#2A4A5C]">
        <div className="w-full max-w-[1280px] mx-auto px-6">
          <h1 className="text-4xl font-bold mb-4 leading-tight text-white">
            Product License Terms
          </h1>
          <p className="text-lg max-w-3xl mx-auto mb-6 text-white/90">
            For Bridging Trust AI solutions deployed into your environment, and
            the commitments we make about the access they require.
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
                These terms apply to <span className="font-semibold text-gray-900 dark:text-gray-100">productized solutions</span> that Bridging Trust AI licenses and deploys into a customer environment. They do not apply to bespoke development work, which is covered by our{" "}
                <Link href="/engagement-terms" className="text-blue-500 dark:text-[#7BA8C4] hover:underline">Engagement Terms</Link>.
              </p>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                This document is <span className="font-semibold text-gray-900 dark:text-gray-100">supplemental</span> and is not a complete agreement. Commercial terms &mdash; fees, term, acceptance, warranty, liability, indemnification and termination &mdash; are set out in the signed agreement covering the solution.
              </p>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                Publishing this page is not an offer, and viewing it does not grant a licence. A licence arises only on execution or express acceptance of the agreement covering the solution.
              </p>
            </div>

            {/* Licence Grant */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">Licence Grant and Ownership</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                Productized solutions are <span className="font-semibold text-gray-900 dark:text-gray-100">licensed, not sold</span>. Bridging Trust AI LLC retains all right, title and interest in the solution, including its source code, configuration, data models and documentation, together with any improvements to it.
              </p>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                Subject to the agreement covering the solution, you receive a limited, non-exclusive, non-transferable, non-sublicensable licence to use the solution within the environment identified in that agreement, for your own internal business purposes, for its term.
              </p>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                The licence does not extend to redistributing, reselling, sublicensing or hosting the solution for a third party; to creating derivative works from it; or to reverse engineering it except to the extent that restriction is unenforceable under applicable law.
              </p>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                Your own data, and the configuration values you supply, remain yours. Nothing in this licence gives us ownership of them.
              </p>
            </div>

            {/* Identity and Credential Custody */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">Identity and Credential Custody</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                Some solutions require an application identity operating inside your environment in order to function. Where that is the case, the identity architecture and the specific permission scopes are set out in that product&rsquo;s deployment documentation, so that your security team can review them before deployment.
              </p>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                Where Bridging Trust AI operates an application identity within your environment, we commit to the following:
              </p>
              <ul className="list-disc pl-6 mb-8 leading-relaxed text-lg text-gray-600 dark:text-gray-400">
                <li className="mb-4">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Scoped access.</span> The identity is granted only the permissions documented for that product, and no more. We do not grant ourselves standing access beyond what the solution requires to operate.
                </li>
                <li className="mb-4">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Credential rotation.</span> Credentials for the identity are rotated at least annually, using a 60-day overlap window so rotation does not interrupt the running solution.
                </li>
                <li className="mb-4">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Incident notification.</span> We will notify you promptly upon confirming a security incident affecting that identity or its credentials.
                </li>
                <li className="mb-4">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Decommission at termination.</span> When the licence ends, we follow a defined decommission process covering the application identity, its credentials, and the solution artifacts deployed into your environment. The specific steps and sequence are set out in that product&rsquo;s deployment documentation.
                </li>
              </ul>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                These are commitments we make about our own conduct. They do not create obligations for you, and they do not limit your ability to revoke access to your own environment at any time.
              </p>
            </div>

            {/* AI Systems */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">What You Should Know About AI Systems</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                Where a solution uses AI, the same limitations described in our{" "}
                <Link href="/engagement-terms" className="text-blue-500 dark:text-[#7BA8C4] hover:underline">Engagement Terms</Link>{" "}
                apply: AI output is not deterministic, can be confidently wrong, and depends on third-party model providers who may change or deprecate models on their own schedule. Where output informs a consequential decision, the solution is designed to keep a person in the loop.
              </p>
            </div>

            {/* Third-party components */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">Third-Party and Open-Source Components</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                Solutions include third-party and open-source components subject to their own licences, and may depend on third-party platform and model services governed by their own terms. Those dependencies are identified in the product&rsquo;s deployment documentation.
              </p>
            </div>

            {/* Related Documents */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">Related Documents</h2>
              <ul className="list-disc pl-6 mb-8 leading-relaxed text-lg text-gray-600 dark:text-gray-400">
                <li className="mb-4">
                  <Link href="/engagement-terms" className="text-blue-500 dark:text-[#7BA8C4] hover:underline">Engagement Terms</Link> &mdash; custom development work
                </li>
                <li className="mb-4">
                  <Link href="/terms" className="text-blue-500 dark:text-[#7BA8C4] hover:underline">Website Terms of Use</Link> &mdash; your use of this website
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
                Security review questions about a solution are welcome before deployment. Reach us through the{" "}
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
