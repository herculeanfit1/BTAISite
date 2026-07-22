import React from "react";
import Link from "next/link";

/**
 * TermsContent — single source for the terms page prose.
 *
 * Rendered by both the locale and non-locale routes so the two can never
 * drift. Edit the legal text here and nowhere else.
 */

export const TermsContent = () => {
  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-900 pb-16 leading-normal">
      {/* Header Section */}
      <div className="w-full pt-24 pb-12 px-6 text-center bg-[#3A5F77] dark:bg-[#2A4A5C]">
        <div className="w-full max-w-[1280px] mx-auto px-6">
          <h1 className="text-4xl font-bold mb-4 leading-tight text-white">
            Website Terms of Use
          </h1>
          <p className="text-lg max-w-3xl mx-auto mb-6 text-white/90">
            These terms govern your use of this website. Client engagements are
            governed by separate written agreements.
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

            {/* Introduction */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">Introduction</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                These Website Terms of Use (&ldquo;Terms&rdquo;) govern your access to and use of the Bridging Trust AI LLC website.
              </p>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                By accessing or using our website, you agree to be bound by these Terms.
              </p>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                These Terms do <span className="font-semibold text-gray-900 dark:text-gray-100">not</span> govern client engagements. Work performed for clients is governed by a separate written agreement. See our{" "}
                <Link href="/engagement-terms" className="text-blue-500 dark:text-[#7BA8C4] hover:underline">Engagement Terms</Link>{" "}
                for custom development work and our{" "}
                <Link href="/product-terms" className="text-blue-500 dark:text-[#7BA8C4] hover:underline">Product License Terms</Link>{" "}
                for solutions deployed into a customer environment.
              </p>
            </div>

            {/* Services */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">About Our Services</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                Bridging Trust AI LLC designs and builds custom AI systems and provides related strategy, implementation, and operational services. This website describes those services for informational purposes only.
              </p>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                Nothing on this website constitutes an offer, a quotation, or a commitment to provide services, and no engagement is created by using this website or submitting the contact form.
              </p>
            </div>

            {/* User Obligations */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">User Obligations</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                You agree to provide accurate information when using our contact form and not to misuse our services in any way. You agree not to use our website or services for any unlawful purpose or in violation of any applicable laws or regulations.
              </p>
            </div>

            {/* User Content */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">User Content</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                By providing information, data, or other content to Bridging Trust AI LLC, you grant us a non-exclusive, royalty-free, worldwide, perpetual, and irrevocable right to use, process, and store such content for the purpose of providing our services to you.
              </p>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                You represent and warrant that you own or have the necessary rights to all content you provide and that such content does not violate the rights of any third party, including intellectual property rights, privacy rights, or publicity rights.
              </p>
            </div>

            {/* Intellectual Property */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">Intellectual Property</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                All content and materials on the site, including text, graphics, logos, and software, are the property of Bridging Trust AI LLC or our licensors and are protected by applicable intellectual property laws.
              </p>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                You may not distribute, modify, transmit, reuse, download, repost, or copy the content of this website, whether in whole or in part, for commercial purposes without our express advance written permission.
              </p>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                This section applies to this website only. Ownership and licensing of work product created during a client engagement are governed by our{" "}
                <Link href="/engagement-terms" className="text-blue-500 dark:text-[#7BA8C4] hover:underline">Engagement Terms</Link>{" "}
                and{" "}
                <Link href="/product-terms" className="text-blue-500 dark:text-[#7BA8C4] hover:underline">Product License Terms</Link>, not by this section.
              </p>
            </div>

            {/* Confidentiality */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">Confidentiality</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                In the course of providing our services, both parties may share confidential information. Each party agrees to maintain the confidentiality of the other party&#39;s confidential information and to use it only for the purpose of fulfilling obligations under these Terms or a related engagement agreement. This obligation survives the termination of any engagement.
              </p>
            </div>

            {/* Limitation of Liability */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">Limitation of Liability</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                To the maximum extent permitted by applicable law, Bridging Trust AI LLC shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of our services.
              </p>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                Our liability shall be limited to the maximum extent permitted by law, and shall not exceed the amount you paid to us over the 12 months preceding the claim or $1,000, whichever is greater.
              </p>
            </div>

            {/* Disclaimer */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">Disclaimer</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                Your use of our services is at your sole risk. Our services are provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis. We expressly disclaim all warranties of any kind, whether express or implied, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
              </p>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                We make no warranty that our services will meet your requirements, be available on an uninterrupted, timely, secure, or error-free basis, or that the results that may be obtained from the use of our services will be accurate or reliable.
              </p>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                Our advisory services, including AI governance frameworks, risk assessments, and compliance guidance, represent professional recommendations based on current best practices and available information. They do not constitute legal advice and should not be relied upon as a substitute for qualified legal counsel.
              </p>
            </div>

            {/* Indemnification */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">Indemnification</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                You agree to indemnify and hold harmless Bridging Trust AI LLC, its officers, directors, employees, and agents from and against any claims, damages, losses, liabilities, and expenses (including reasonable attorneys&#39; fees) arising out of or relating to your use of our services or violation of these Terms.
              </p>
            </div>

            {/* Governing Law */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">Governing Law</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                These Terms shall be governed by and construed in accordance with the laws of the State of Minnesota, without regard to conflict of law principles. Any legal action or proceeding arising under these Terms shall be brought exclusively in the state or federal courts located in the State of Minnesota.
              </p>
            </div>

            {/* Severability */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">Severability</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law, and the remaining provisions will continue in full force and effect.
              </p>
            </div>

            {/* Changes to Terms */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">Changes to These Terms</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                We reserve the right to modify these Terms at any time, and we will post the updated version with the new effective date on our website. Your continued use of our website and services following the posting of revised Terms means that you accept and agree to the changes.
              </p>
            </div>

            {/* Contact */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">Contact Us</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                If you have any questions about these Terms, please contact us at legal@bridgingtrust.ai.
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
