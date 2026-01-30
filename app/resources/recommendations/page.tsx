"use client";

import React, { useState } from "react";
import {
  Briefcase,
  Book,
  Wrench,
  GraduationCap,
  Globe,
  ExternalLink,
  Star,
} from "lucide-react";

interface Recommendation {
  id: string;
  title: string;
  category: string;
  description: string;
  link?: string;
  type: "book" | "tool" | "course" | "platform";
  rating?: number;
}

const recommendations: Recommendation[] = [
  // Books
  {
    id: "1",
    title: "Hands-On Machine Learning",
    category: "Machine Learning",
    description:
      "A practical guide to building intelligent systems using Scikit-Learn, Keras, and TensorFlow.",
    type: "book",
    link: "https://www.oreilly.com/library/view/hands-on-machine-learning/9781492032632/",
    rating: 5,
  },
  {
    id: "2",
    title: "Deep Learning",
    category: "AI/ML",
    description:
      "The MIT Press book covering the mathematical and conceptual foundations of deep learning.",
    type: "book",
    link: "https://www.deeplearningbook.org/",
    rating: 5,
  },
  {
    id: "3",
    title: "Python for Data Analysis",
    category: "Data Science",
    description:
      "Learn how to manipulate, process, clean, and crunch datasets in Python using pandas.",
    type: "book",
    link: "https://wesmckinney.com/book/",
    rating: 5,
  },
  {
    id: "4",
    title: "Clean Code",
    category: "Programming",
    description:
      "A handbook of agile software craftsmanship focusing on writing clean, maintainable code.",
    type: "book",
    link: "https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882",
    rating: 5,
  },
  {
    id: "5",
    title: "Designing Data-Intensive Applications",
    category: "Data Engineering",
    description:
      "The big ideas behind reliable, scalable, and maintainable systems for data processing.",
    type: "book",
    link: "https://www.amazon.com/Designing-Data-Intensive-Applications-Reliable-Maintainable/dp/1449373321",
    rating: 5,
  },

  // Tools
  {
    id: "6",
    title: "VS Code",
    category: "IDE",
    description:
      "A free, open-source code editor with excellent support for Python, JavaScript, and many other languages.",
    type: "tool",
    link: "https://code.visualstudio.com/",
    rating: 5,
  },
  {
    id: "7",
    title: "Jupyter Notebook",
    category: "Development",
    description:
      "An open-source web application for creating and sharing documents with live code, equations, and visualizations.",
    type: "tool",
    link: "https://jupyter.org/",
    rating: 5,
  },
  {
    id: "8",
    title: "Docker",
    category: "DevOps",
    description:
      "Containerization platform that enables developers to package applications with all dependencies.",
    type: "tool",
    link: "https://www.docker.com/",
    rating: 5,
  },
  {
    id: "9",
    title: "GitHub",
    category: "Version Control",
    description:
      "The world's leading software development platform for version control and collaboration.",
    type: "tool",
    link: "https://github.com/",
    rating: 5,
  },
  {
    id: "10",
    title: "PostgreSQL",
    category: "Database",
    description:
      "A powerful, open-source object-relational database system with advanced features.",
    type: "tool",
    link: "https://www.postgresql.org/",
    rating: 5,
  },
  {
    id: "11",
    title: "MongoDB",
    category: "Database",
    description:
      "A NoSQL database that provides high performance, high availability, and easy scalability.",
    type: "tool",
    link: "https://www.mongodb.com/",
    rating: 5,
  },

  // Courses
  {
    id: "12",
    title: "Machine Learning Course by Andrew Ng",
    category: "Machine Learning",
    description:
      "Stanford's foundational machine learning course on Coursera covering supervised and unsupervised learning.",
    type: "course",
    link: "https://www.coursera.org/learn/machine-learning",
    rating: 5,
  },
  {
    id: "13",
    title: "Deep Learning Specialization",
    category: "Deep Learning",
    description:
      "DeepLearning.AI's comprehensive specialization covering neural networks, CNNs, RNNs, and more.",
    type: "course",
    link: "https://www.coursera.org/specializations/deep-learning",
    rating: 5,
  },
  {
    id: "14",
    title: "Fast.ai Practical Deep Learning",
    category: "Deep Learning",
    description:
      "A free, practical deep learning course that teaches you to build and train models from scratch.",
    type: "course",
    link: "https://www.fast.ai/",
    rating: 5,
  },
  {
    id: "15",
    title: "Data Science with Python",
    category: "Data Science",
    description:
      "Comprehensive data science course covering pandas, numpy, matplotlib, and scikit-learn.",
    type: "course",
    link: "https://www.coursera.org/specializations/data-science-python",
    rating: 5,
  },

  // Platforms
  {
    id: "16",
    title: "Kaggle",
    category: "Data Science",
    description:
      "A platform for data science competitions, datasets, and learning resources with free GPU access.",
    type: "platform",
    link: "https://www.kaggle.com/",
    rating: 5,
  },
  {
    id: "17",
    title: "Hugging Face",
    category: "AI/ML",
    description:
      "The AI community building the future. Access thousands of pre-trained models and datasets.",
    type: "platform",
    link: "https://huggingface.co/",
    rating: 5,
  },
  {
    id: "18",
    title: "Google Colab",
    category: "Development",
    description:
      "Free Jupyter notebook environment with free GPU access for machine learning projects.",
    type: "platform",
    link: "https://colab.research.google.com/",
    rating: 5,
  },
  {
    id: "19",
    title: "Stack Overflow",
    category: "Learning",
    description:
      "The largest online community for programmers to learn, share knowledge, and build careers.",
    type: "platform",
    link: "https://stackoverflow.com/",
    rating: 5,
  },
  {
    id: "20",
    title: "GitHub Copilot",
    category: "AI Tools",
    description:
      "AI pair programmer that helps you write code faster by suggesting whole lines or functions.",
    type: "tool",
    link: "https://github.com/features/copilot",
    rating: 5,
  },
];

const categories = [
  "All",
  "Machine Learning",
  "Data Science",
  "Programming",
  "AI/ML",
  "DevOps",
  "Database",
  "IDE",
  "Development",
  "Version Control",
  "Deep Learning",
  "Learning",
  "AI Tools",
  "Data Engineering",
];

const types = ["All", "Book", "Tool", "Course", "Platform"];

export default function RecommendationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");

  const filteredRecommendations = recommendations.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;

    const matchesType =
      selectedType === "All" ||
      item.type.toLowerCase() === selectedType.toLowerCase();

    return matchesSearch && matchesCategory && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "book":
        return Book;
      case "tool":
        return Wrench;
      case "course":
        return GraduationCap;
      case "platform":
        return Globe;
      default:
        return Briefcase;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "book":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
      case "tool":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
      case "course":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300";
      case "platform":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Briefcase className="w-10 h-10 text-[#0a73b0] dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Recommendations
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Curated lists of tools, books, courses, and resources that we
            recommend for developers, data scientists, and tech enthusiasts.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recommendations..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#0a73b0] dark:focus:ring-blue-400 focus:border-transparent outline-none"
            />
            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            {/* Type Filter */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 self-center">
                Type:
              </span>
              {types.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedType === type
                      ? "bg-[#0a73b0] dark:bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 self-center">
                Category:
              </span>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
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
        </div>

        {/* Recommendations Grid */}
        {filteredRecommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecommendations.map((item) => {
              const TypeIcon = getTypeIcon(item.type);
              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-200 dark:border-gray-700"
                >
                  {/* Header */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-2 rounded-lg ${getTypeColor(item.type)}`}
                        >
                          <TypeIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {item.title}
                          </h2>
                          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {item.type}
                          </span>
                        </div>
                      </div>
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0a73b0] dark:text-blue-400 hover:text-[#2a9bd0] dark:hover:text-blue-300 transition-colors"
                          aria-label={`Visit ${item.title}`}
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>

                    {/* Category */}
                    <div className="mb-3">
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                        {item.category}
                      </span>
                    </div>

                    {/* Rating */}
                    {item.rating && (
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < item.rating!
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                    {item.description}
                  </p>

                  {/* Link Button */}
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm font-medium text-[#0a73b0] dark:text-blue-400 hover:text-[#2a9bd0] dark:hover:text-blue-300 transition-colors"
                    >
                      Learn More
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No recommendations found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
