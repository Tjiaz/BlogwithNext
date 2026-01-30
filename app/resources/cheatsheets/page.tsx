import React from "react";
import Link from "next/link";
import { BookOpen, Download, Eye } from "lucide-react";

const cheatsheets = [
  {
    id: 1,
    title: "Python Cheat Sheet",
    description:
      "Quick reference for Python syntax, data structures, and common operations",
    category: "Programming",
    file: "/cheatsheets/python-cheatsheet.pdf",
  },
  {
    id: 2,
    title: "SQL Cheat Sheet",
    description: "Essential SQL commands and queries for database operations",
    category: "Database",
    file: "/cheatsheets/SQL-cheatsheet.pdf",
  },
  {
    id: 3,
    title: "Git Commands Cheat Sheet",
    description: "Common Git commands for version control workflows",
    category: "Tools",
    file: "/cheatsheets/git.pdf",
  },
  {
    id: 4,
    title: "Docker Cheat Sheet",
    description: "Docker commands and best practices for containerization",
    category: "DevOps",
    file: "/cheatsheets/docker_cheatsheet.pdf",
  },
];

export default function CheatSheetsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="w-10 h-10 text-[#0a73b0] dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Cheat Sheets
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Quick reference guides to help you work faster and more efficiently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cheatsheets.map((sheet) => (
            <div
              key={sheet.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {sheet.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {sheet.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                  {sheet.category}
                </span>
                <div className="flex items-center gap-3">
                  <a
                    href={sheet.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-[#0a73b0] dark:text-blue-400 hover:text-[#2a9bd0] dark:hover:text-blue-300 transition-colors"
                    title="View PDF"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">View</span>
                  </a>
                  <a
                    href={sheet.file}
                    download
                    className="flex items-center text-[#0a73b0] dark:text-blue-400 hover:text-[#2a9bd0] dark:hover:text-blue-300 transition-colors"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Download</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
