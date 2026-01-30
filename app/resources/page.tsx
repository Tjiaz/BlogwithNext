import React from "react";
import Link from "next/link";
import { BookOpen, FileText, Briefcase } from "lucide-react";

const resources = [
  {
    id: 1,
    title: "Tech Briefs",
    description: "Quick technical summaries and insights on the latest technologies",
    icon: FileText,
    href: "/resources/techbriefs",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: 2,
    title: "Cheat Sheets",
    description: "Quick reference guides for programming languages and tools",
    icon: BookOpen,
    href: "/resources/cheatsheets",
    color: "from-green-500 to-green-600",
  },
  {
    id: 3,
    title: "Recommendations",
    description: "Curated lists of tools, books, and resources we recommend",
    icon: Briefcase,
    href: "/resources/recommendations",
    color: "from-purple-500 to-purple-600",
  },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Resources</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Access our collection of helpful resources, cheat sheets, and recommendations
            to accelerate your learning and development.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resources.map((resource) => {
            const Icon = resource.icon;
            return (
              <Link
                key={resource.id}
                href={resource.href}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 hover:shadow-lg transition-all transform hover:-translate-y-1"
              >
                <div className={`w-16 h-16 rounded-lg bg-gradient-to-r ${resource.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  {resource.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">{resource.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
