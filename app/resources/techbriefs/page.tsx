"use client";

import React, { useState } from "react";
import { FileText, Search, Tag, ExternalLink, Calendar } from "lucide-react";
import Link from "next/link";

interface TechBrief {
  id: string;
  title: string;
  category: string;
  description: string;
  keyFeatures: string[];
  useCases: string[];
  tags: string[];
  date: string;
  link?: string;
}

// Sample tech briefs data - Replace with actual data from your database/API
const techBriefs: TechBrief[] = [
  {
    id: "1",
    title: "Next.js 14",
    category: "Framework",
    description:
      "Next.js 14 introduces React Server Components, improved performance, and enhanced developer experience with the App Router.",
    keyFeatures: [
      "React Server Components",
      "App Router",
      "Improved Image Optimization",
      "Turbopack (faster bundler)",
    ],
    useCases: [
      "Full-stack web applications",
      "E-commerce platforms",
      "Content management systems",
      "Marketing websites",
    ],
    tags: ["React", "JavaScript", "Full-Stack", "SSR"],
    date: "2024-01-15",
    link: "https://nextjs.org",
  },
  {
    id: "2",
    title: "LangChain",
    category: "AI/ML",
    description:
      "LangChain is a framework for developing applications powered by language models, enabling easy integration with LLMs.",
    keyFeatures: [
      "Chain abstraction",
      "Vector store integration",
      "Agent framework",
      "Memory management",
    ],
    useCases: [
      "Chatbots and conversational AI",
      "Document Q&A systems",
      "Code generation tools",
      "Data analysis automation",
    ],
    tags: ["AI", "LLM", "Python", "NLP"],
    date: "2024-01-20",
    link: "https://langchain.com",
  },
  {
    id: "3",
    title: "Docker",
    category: "DevOps",
    description:
      "Docker is a platform for containerization that packages applications and their dependencies into portable containers.",
    keyFeatures: [
      "Containerization",
      "Image management",
      "Orchestration support",
      "Multi-platform support",
    ],
    useCases: [
      "Microservices architecture",
      "CI/CD pipelines",
      "Development environment standardization",
      "Cloud deployment",
    ],
    tags: ["DevOps", "Containers", "Deployment", "Infrastructure"],
    date: "2024-01-10",
    link: "https://docker.com",
  },
];

const categories = ["All", "Framework", "AI/ML", "DevOps", "Database", "Tool"];

export default function TechBriefsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredBriefs = techBriefs.filter((brief) => {
    const matchesSearch =
      brief.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brief.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brief.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesCategory =
      selectedCategory === "All" || brief.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <FileText className="w-10 h-10 text-[#0a73b0] dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Tech Briefs
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Quick technical summaries and insights on the latest technologies,
            frameworks, and tools in the tech industry.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tech briefs..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#0a73b0] dark:focus:ring-blue-400 focus:border-transparent outline-none"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-[#0a73b0] dark:bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Tech Briefs Grid */}
        {filteredBriefs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBriefs.map((brief) => (
              <div
                key={brief.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-200 dark:border-gray-700"
              >
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {brief.title}
                    </h2>
                    {brief.link && (
                      <a
                        href={brief.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0a73b0] dark:text-blue-400 hover:text-[#2a9bd0] dark:hover:text-blue-300 transition-colors"
                        aria-label={`Learn more about ${brief.title}`}
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                      {brief.category}
                    </span>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(brief.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {brief.description}
                </p>

                {/* Key Features */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Key Features:
                  </h3>
                  <ul className="space-y-1">
                    {brief.keyFeatures.slice(0, 3).map((feature, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-600 dark:text-gray-400 flex items-start"
                      >
                        <span className="text-[#0a73b0] dark:text-blue-400 mr-2">
                          •
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Use Cases */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Use Cases:
                  </h3>
                  <ul className="space-y-1">
                    {brief.useCases.slice(0, 2).map((useCase, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-600 dark:text-gray-400 flex items-start"
                      >
                        <span className="text-[#0a73b0] dark:text-blue-400 mr-2">
                          •
                        </span>
                        {useCase}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {brief.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs flex items-center"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No tech briefs found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
