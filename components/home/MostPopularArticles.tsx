"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getPostSlug, getBestImage } from "@/lib/utils";

interface Article {
  _id: string;
  id: string;
  title: string;
  author: string;
  date: string;
  topic: string;
  img?: string;
  description?: string;
}

// Color mapping for topics - reuse from DiscoverTopics
const getTopicColor = (topicName: string): string => {
  const lower = topicName.toLowerCase();

  const colorMap: Record<string, string> = {
    "data science": "bg-green-600",
    data_science: "bg-green-600",
    nlp: "bg-teal-500",
    sql: "bg-orange-500",
    python: "bg-purple-600",
    programming: "bg-emerald-600",
    ai: "bg-gray-800",
    ml: "bg-blue-500",
    "machine learning": "bg-blue-500",
    "machine learning ops": "bg-gray-800",
    machine_learning_ops: "bg-gray-800",
    "data engineering": "bg-purple-600",
    "career advice": "bg-amber-600",
    career_advice: "bg-amber-600",
    "language models": "bg-violet-600",
    language_models: "bg-violet-600",
  };

  if (colorMap[lower]) {
    return colorMap[lower];
  }

  for (const [key, color] of Object.entries(colorMap)) {
    if (lower.includes(key) || key.includes(lower)) {
      return color;
    }
  }

  const defaultColors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-orange-500",
    "bg-teal-500",
    "bg-indigo-500",
    "bg-cyan-500",
  ];

  let hash = 0;
  for (let i = 0; i < topicName.length; i++) {
    hash = topicName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return defaultColors[Math.abs(hash) % defaultColors.length];
};

// Generate avatar from author name or use default
const getAvatarUrl = (author: string, topic: string): string => {
  // For now, return a default avatar path
  // You can enhance this to generate avatars based on author/topic
  return "/images/azbyte.jpeg";
};

// Format date nicely
const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

interface MostPopularArticlesProps {
  initialArticles?: Article[];
}

export default function MostPopularArticles({
  initialArticles = [],
}: MostPopularArticlesProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Only fetch if no initial articles provided
    if (initialArticles.length > 0) {
      // Ensure articles state matches initialArticles
      setArticles(initialArticles);
      return;
    }

    const fetchPopularArticles = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/topArticles?page=1", {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to fetch popular articles");

        const data = await res.json();
        const fetched: Article[] = Array.isArray(data) ? data : [];

        // Sort by date (most recent first) if not already sorted
        fetched.sort((a, b) => {
          const dateA = new Date(a.date || 0).getTime();
          const dateB = new Date(b.date || 0).getTime();
          return dateB - dateA;
        });

        // Take only the first 4-5 articles
        setArticles(fetched.slice(0, 4));
      } catch (error) {
        console.error("Failed to load popular articles:", error);
        setArticles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularArticles();
  }, [initialArticles]);

  // Always render the same structure when initialArticles are provided
  // This ensures server and client render match
  const displayArticles = articles.length > 0 ? articles : [];

  if (displayArticles.length === 0 && isLoading) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Most Popular Articles
        </h2>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (displayArticles.length === 0) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Most Popular Articles
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          No popular articles found.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Most Popular Articles
      </h2>
      <div className="space-y-4">
        {displayArticles.map((article) => {
          const postSlug = getPostSlug(article);
          const topicColor = getTopicColor(article.topic || "");
          const avatarUrl = getAvatarUrl(article.author, article.topic || "");
          const formattedDate = formatDate(article.date);
          // Get best image for avatar display
          const articleImage = getBestImage(article);

          return (
            <Link
              key={article._id || article.id}
              href={`/${postSlug}`}
              className="block bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-[#0a73b0] dark:hover:border-blue-500 transition-all duration-200 group"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center ring-2 ring-gray-100 dark:ring-gray-700">
                    <img
                      src={articleImage}
                      alt={article.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to default avatar if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/azbyte.jpeg";
                      }}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Category Tag */}
                  {article.topic && (
                    <div className="mb-2">
                      <span
                        className={`${topicColor} text-white text-xs font-medium px-2.5 py-1 rounded-md inline-block`}
                      >
                        {article.topic}
                      </span>
                    </div>
                  )}

                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:text-[#0a73b0] dark:group-hover:text-blue-400 transition-colors mb-1.5 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {article.author || "Anonymous"}
                  </p>
                  {formattedDate && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {formattedDate}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
