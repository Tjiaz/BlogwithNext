import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">Privacy Policy</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-lg max-w-none dark:prose-invert">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">Introduction</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Welcome to AzByteGems. We respect your privacy and are committed to protecting your
                personal data. This privacy policy explains how we collect, use, and safeguard your
                information when you visit our blog and use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
                Information We Collect
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">We may collect the following types of information:</p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                <li>
                  <strong>Account Information:</strong> When you create an account, we collect your
                  email address, name, and any profile information you provide.
                </li>
                <li>
                  <strong>Usage Data:</strong> We collect information about how you interact with our
                  website, including pages visited, articles read, and time spent on the site.
                </li>
                <li>
                  <strong>Cookies:</strong> We use cookies and similar tracking technologies to
                  enhance your experience and analyze site traffic.
                </li>
                <li>
                  <strong>Newsletter Subscriptions:</strong> If you subscribe to our newsletter, we
                  collect your email address.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
                How We Use Your Information
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">We use the collected information for:</p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                <li>Providing and maintaining our blog services</li>
                <li>Personalizing your experience and content recommendations</li>
                <li>Sending newsletters and updates (with your consent)</li>
                <li>Analyzing website usage to improve our content and user experience</li>
                <li>Preventing fraud and ensuring security</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
                Data Security
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We implement appropriate technical and organizational measures to protect your
                personal data against unauthorized access, alteration, disclosure, or destruction.
                However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">Your Rights</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                <li>Access and receive a copy of your personal data</li>
                <li>Rectify inaccurate or incomplete data</li>
                <li>Request deletion of your personal data</li>
                <li>Object to processing of your personal data</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">Third-Party Services</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Our website may contain links to third-party websites or services. We are not
                responsible for the privacy practices of these external sites. We encourage you to
                review their privacy policies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
                Changes to This Privacy Policy
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We may update this privacy policy from time to time. We will notify you of any
                changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">Contact Us</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you have any questions about this Privacy Policy, please contact us through our
                website or social media channels.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
