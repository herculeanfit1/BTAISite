import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ManageCookiesButton } from "../components/ManageCookiesButton";

export const metadata: Metadata = {
  title: "Privacy Policy | Bridging Trust AI",
  description:
    "Learn about how Bridging Trust AI handles your data and protects your privacy.",
};

const PrivacyPage = () => {
  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-900 pb-16 leading-normal">
      {/* Header Section */}
      <div className="w-full pt-24 pb-12 px-6 text-center bg-[#3A5F77] dark:bg-[#2A4A5C]">
        <div className="w-full max-w-[1280px] mx-auto px-6">
          <h1 className="text-4xl font-bold mb-4 leading-tight text-white">
            Privacy Policy
          </h1>
          <p className="text-lg max-w-3xl mx-auto mb-6 text-white/90">
            At Bridging Trust AI, we take your privacy seriously. This policy explains how we collect, use, and protect your information.
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
                <span className="font-semibold text-gray-900 dark:text-gray-100">Last Updated:</span> March 6, 2026
              </p>
            </div>

            {/* Introduction */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">Introduction</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                Bridging Trust AI LLC (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting your privacy and ensuring your experience on our website is secure and transparent.
              </p>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                This Privacy Policy explains how we collect, use, disclose, and safeguard the personal information you provide through our website and services.
              </p>
            </div>

            {/* Information We Collect */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">Information We Collect</h2>
              <h3 className="text-2xl font-bold mb-4 leading-tight text-gray-900 dark:text-gray-100">Information you provide directly</h3>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                We collect the following personal information when you submit our contact form: first name, last name, company name, email address, and any notes or description you provide to help us respond to your inquiry.
              </p>
              <h3 className="text-2xl font-bold mb-4 leading-tight text-gray-900 dark:text-gray-100">Information collected automatically</h3>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                When you visit our website, we may automatically collect certain technical information including your IP address (for rate limiting and security purposes), browser type, referring URL, and pages visited. We use Google Analytics to understand how visitors use our site. Google Analytics uses cookies and collects anonymized usage data in accordance with Google&#39;s privacy policy.
              </p>
              <h3 className="text-2xl font-bold mb-4 leading-tight text-gray-900 dark:text-gray-100">Information from service engagements</h3>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                During consulting engagements, clients may provide us with access to organizational data, configurations, documentation, or other materials necessary to deliver our services. The handling of such data is governed by the specific engagement agreement in place.
              </p>
            </div>

            {/* Use of Information */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">Use of Information</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 mb-8 leading-relaxed text-gray-600 dark:text-gray-400">
                <li className="mb-4">Respond to your inquiries and provide support</li>
                <li className="mb-4">Deliver our consulting and advisory services</li>
                <li className="mb-4">Share relevant information about our AI governance, data governance, and Microsoft AI enablement services</li>
                <li className="mb-4">Improve our website functionality and user experience</li>
                <li className="mb-4">Maintain security and prevent abuse (including rate limiting)</li>
                <li className="mb-4">Comply with legal obligations</li>
              </ul>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                We do not sell your personal information to third parties.
              </p>
            </div>

            {/* Disclosure of Information */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">Disclosure of Information</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 mb-8 leading-relaxed text-gray-600 dark:text-gray-400">
                <li className="mb-4">With service providers who perform services on our behalf (including our email delivery provider, Resend, for processing contact form submissions)</li>
                <li className="mb-4">To comply with legal obligations, court orders, or government requests</li>
                <li className="mb-4">To protect our rights, property, or safety, and the rights of others</li>
                <li className="mb-4">In connection with a business transaction, such as a merger, acquisition, or sale of assets, in which case you would be notified of any change in ownership or control of your personal information</li>
              </ul>
            </div>

            {/* Data Security */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">Data Security</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                We implement reasonable administrative, technical, and physical safeguards to protect your information from unauthorized access, disclosure, alteration, or destruction. These measures include encrypted transmission (HTTPS/TLS), server-side input validation, rate limiting on form submissions, and bot protection mechanisms.
              </p>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                No method of electronic transmission or storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
              </p>
            </div>

            {/* Data Retention */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">Data Retention</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                We retain contact form submissions and inquiry data for as long as necessary to respond to your inquiry and maintain our business relationship. Engagement-related data is retained in accordance with the terms of the applicable engagement agreement and our record retention practices. You may request deletion of your data at any time.
              </p>
            </div>

            {/* Your Rights */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">Your Rights</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                Depending on your jurisdiction, you may have the following rights regarding your personal data:
              </p>
              <ul className="list-disc pl-6 mb-8 leading-relaxed text-gray-600 dark:text-gray-400">
                <li className="mb-4"><span className="font-semibold text-gray-800 dark:text-gray-200">Access</span>: Request a copy of the personal data we hold about you</li>
                <li className="mb-4"><span className="font-semibold text-gray-800 dark:text-gray-200">Correction</span>: Request correction of inaccurate or incomplete data</li>
                <li className="mb-4"><span className="font-semibold text-gray-800 dark:text-gray-200">Deletion</span>: Request deletion of your personal data</li>
                <li className="mb-4"><span className="font-semibold text-gray-800 dark:text-gray-200">Portability</span>: Request a copy of your data in a portable format</li>
                <li className="mb-4"><span className="font-semibold text-gray-800 dark:text-gray-200">Objection</span>: Object to certain processing of your personal data</li>
              </ul>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                To exercise any of these rights, contact us using the information below. We will respond to your request within 30 days.
              </p>
            </div>

            {/* Children's Privacy */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">Children&#39;s Privacy</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                Our website and services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children through our website.
              </p>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                Bridging Trust AI LLC also develops software products that may be used in educational contexts. Any such products that collect, process, or interact with data belonging to minors will maintain separate, product-specific privacy policies that comply with applicable children&#39;s privacy laws, including COPPA (Children&#39;s Online Privacy Protection Act) and relevant state regulations. Those product-specific privacy policies will be made available within the applicable product.
              </p>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                If you believe we have inadvertently collected personal information from a child through this website, please contact us immediately so we can promptly remove the information.
              </p>
            </div>

            {/* Third-Party Services */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">Third-Party Services</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                Our website may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to review the privacy policies of any third-party services you access through our website.
              </p>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                We use the following third-party services:
              </p>
              <ul className="list-disc pl-6 mb-8 leading-relaxed text-gray-600 dark:text-gray-400">
                <li className="mb-4"><span className="font-semibold text-gray-800 dark:text-gray-200">Google Analytics</span>: Website traffic analysis (anonymized data)</li>
                <li className="mb-4"><span className="font-semibold text-gray-800 dark:text-gray-200">Resend</span>: Email delivery for contact form submissions</li>
                <li className="mb-4"><span className="font-semibold text-gray-800 dark:text-gray-200">Azure Static Web Apps</span>: Website hosting (Microsoft)</li>
              </ul>
            </div>

            {/* Cookie Preferences */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">Cookie Preferences</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                You can change your cookie preferences at any time. Click the button below to reset your consent and choose again.
              </p>
              <ManageCookiesButton />
            </div>

            {/* International Data Transfers */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">International Data Transfers</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                Our website is hosted in the United States. If you access our website from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States where our servers are located. By using our website, you consent to the transfer of your information to the United States.
              </p>
            </div>

            {/* Changes to This Privacy Policy */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">Changes to This Privacy Policy</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                We may update this Privacy Policy from time to time, and we will post the revised version with the updated effective date on this page. We encourage you to review this Privacy Policy periodically for any changes.
              </p>
            </div>

            {/* Contact Us */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-gray-100">Contact Us</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                If you have any questions or concerns about this Privacy Policy, please contact us at privacy@bridgingtrust.ai.
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

export default PrivacyPage;
