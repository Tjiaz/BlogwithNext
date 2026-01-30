import React from "react";
import Link from "next/link";
import { Database, Download, ExternalLink } from "lucide-react";

const datasets = [
  {
    id: 1,
    title: "Machine Learning Datasets",
    description: "Curated collection of ML datasets for training and testing models",
    category: "Machine Learning",
    size: "2.5 GB",
    downloads: 1250,
  },
  {
    id: 2,
    title: "Natural Language Processing Corpus",
    description: "Large text corpus for NLP tasks and language model training",
    category: "NLP",
    size: "5.2 GB",
    downloads: 890,
  },
  {
    id: 3,
    title: "Computer Vision Image Dataset",
    description: "High-quality image dataset for computer vision projects",
    category: "Computer Vision",
    size: "8.1 GB",
    downloads: 2100,
  },
  {
    id: 4,
    title: "Data Engineering Sample Data",
    description: "Sample datasets for data pipeline development and testing",
    category: "Data Engineering",
    size: "1.8 GB",
    downloads: 650,
  },
];

export default function DatasetsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Datasets</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore our curated collection of high-quality datasets for machine learning,
            data science, and AI projects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {datasets.map((dataset) => (
            <div
              key={dataset.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center mb-4">
                <Database className="w-8 h-8 text-[#0a73b0] dark:text-blue-400 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{dataset.title}</h2>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4">{dataset.description}</p>

              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-[#0a73b0]/10 dark:bg-blue-400/20 text-[#0a73b0] dark:text-blue-400 rounded-full text-sm font-medium">
                  {dataset.category}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{dataset.size}</span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center">
                  <Download className="w-4 h-4 mr-1" />
                  {dataset.downloads} downloads
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-[#0a73b0] to-[#2a9bd0] dark:from-blue-500 dark:to-blue-600 text-white py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center">
                <Download className="w-4 h-4 mr-2" />
                Download Dataset
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Looking for a specific dataset?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We're constantly adding new datasets. If you need something specific, let us know!
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center text-[#0a73b0] dark:text-blue-400 hover:text-[#2a9bd0] dark:hover:text-blue-300 transition-colors"
          >
            Contact Us
            <ExternalLink className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}
