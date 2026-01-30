import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Code,
  Database,
  TrendingUp,
  Users,
  Target,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              About AzByteGems
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Your premier destination for cutting-edge insights in artificial
              intelligence, machine learning, data science, and programming.
            </p>
          </div>

          {/* Mission Section */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Target className="w-6 h-6 text-[#0a73b0] dark:text-blue-400 mr-2" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Our Mission
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              At AzByteGems, we are dedicated to providing high-quality,
              accessible content that helps developers, data scientists, and
              tech enthusiasts stay at the forefront of technological
              innovation. We believe in making complex concepts understandable
              and practical, empowering our community to build the future of
              technology.
            </p>
          </div>

          {/* What We Offer */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <BookOpen className="w-6 h-6 text-[#0a73b0] dark:text-blue-400 mr-2" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                What We Offer
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <Code className="w-5 h-5 text-[#0a73b0] dark:text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    In-Depth Articles
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Comprehensive articles on AI, ML, data science, and
                    programming with practical examples and code snippets.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Database className="w-5 h-5 text-[#0a73b0] dark:text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Curated Datasets
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Access to carefully selected datasets for your machine
                    learning and data science projects.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <BookOpen className="w-5 h-5 text-[#0a73b0] dark:text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Technical Resources
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Cheat sheets, tech briefs, and quick reference guides to
                    help you work faster and more efficiently.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <TrendingUp className="w-5 h-5 text-[#0a73b0] dark:text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Industry Insights
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Stay updated with the latest trends, best practices, and
                    career advice in the tech industry.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Our Values */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-[#0a73b0] dark:text-blue-400 mr-2" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Our Values
              </h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="text-[#0a73b0] dark:text-blue-400 mr-3 font-bold">
                  •
                </span>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Quality First:</strong> We prioritize accuracy, depth,
                  and practical value in every piece of content we publish.
                </p>
              </div>
              <div className="flex items-start">
                <span className="text-[#0a73b0] dark:text-blue-400 mr-3 font-bold">
                  •
                </span>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Community Driven:</strong> We listen to our readers
                  and continuously improve based on your feedback and needs.
                </p>
              </div>
              <div className="flex items-start">
                <span className="text-[#0a73b0] dark:text-blue-400 mr-3 font-bold">
                  •
                </span>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Accessibility:</strong> We believe knowledge should be
                  accessible to everyone, regardless of their experience level.
                </p>
              </div>
              <div className="flex items-start">
                <span className="text-[#0a73b0] dark:text-blue-400 mr-3 font-bold">
                  •
                </span>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Innovation:</strong> We stay ahead of the curve,
                  covering emerging technologies and methodologies as they
                  develop.
                </p>
              </div>
            </div>
          </div>

          {/* Get in Touch */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Get in Touch
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Have questions, suggestions, or want to contribute? We'd love to
              hear from you! Connect with us on social media or reach out
              through our platforms.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://www.facebook.com/profile.php?id=61572544476793"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Facebook
              </a>
              <a
                href="https://x.com/azbytegems"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-black dark:bg-gray-800 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
              >
                X (Twitter)
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Explore Our Resources
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/resources/cheatsheets"
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Cheat Sheets
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Quick reference guides
                </p>
              </Link>
              <Link
                href="/resources/techbriefs"
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Tech Briefs
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Technical summaries
                </p>
              </Link>
              <Link
                href="/resources/recommendations"
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Recommendations
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Curated tools & resources
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
