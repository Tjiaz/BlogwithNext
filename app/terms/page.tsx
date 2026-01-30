import React from "react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">Terms of Service</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-lg max-w-none dark:prose-invert">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">Agreement to Terms</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                By accessing and using AzByteGems, you accept and agree to be bound by the terms and
                provision of this agreement. If you do not agree to these terms, please do not use
                our website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">Use License</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Permission is granted to temporarily access and use AzByteGems for personal,
                non-commercial transitory viewing only. This is the grant of a license, not a
                transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">User Accounts</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                When you create an account with us, you must provide accurate and complete
                information. You are responsible for maintaining the security of your account and
                password. You agree to notify us immediately of any unauthorized use of your
                account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">Content Submission</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you submit content to our blog (articles, comments, etc.), you grant us a
                non-exclusive, royalty-free, perpetual license to use, modify, publish, and
                distribute your content. You represent that you own or have the right to submit
                such content and that it does not violate any third-party rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">Prohibited Uses</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">You agree not to use our website:</p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                <li>In any way that violates any applicable law or regulation</li>
                <li>To transmit any malicious code, viruses, or harmful materials</li>
                <li>To impersonate or attempt to impersonate another user or entity</li>
                <li>To engage in any automated use of the system (scraping, crawling, etc.) without permission</li>
                <li>To interfere with or disrupt the website or servers</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">Intellectual Property</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                All content on AzByteGems, including articles, images, logos, and design elements,
                is the property of AzByteGems or its content creators and is protected by
                copyright and other intellectual property laws. You may not reproduce, distribute, or
                create derivative works without explicit permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">Disclaimer</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                The information on this website is provided on an "as is" basis. AzByteGems makes
                no warranties, expressed or implied, and hereby disclaims all warranties including
                without limitation, implied warranties of merchantability, fitness for a particular
                purpose, or non-infringement of intellectual property.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">Limitation of Liability</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                In no event shall AzByteGems or its suppliers be liable for any damages (including,
                without limitation, damages for loss of data or profit, or due to business
                interruption) arising out of the use or inability to use the materials on
                AzByteGems.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
                Changes to Terms
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We reserve the right to modify these terms at any time. We will notify users of any
                material changes by posting the updated terms on this page. Your continued use of
                the website after such modifications constitutes acceptance of the updated terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">Contact Information</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you have any questions about these Terms of Service, please contact us through
                our website or social media channels.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
