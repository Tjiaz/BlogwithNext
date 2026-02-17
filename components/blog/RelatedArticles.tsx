"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPostSlug } from "@/lib/utils";

interface RelatedArticlesProps {
  topic: string;
  currentPostId?: string;
  limit?: number;
}

interface Article {
  _id: string;
  id?: string;
  title: string;
  description?: string;
  date?: string;
  author?: string;
  topic?: string;
}

export default function RelatedArticles({
  topic,
  currentPostId,
  limit = 6,
}: RelatedArticlesProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!topic) {
      setLoading(false);
      return;
    }

    const fetchRelatedArticles = async () => {
      try {
        setLoading(true);
        // Fetch articles with the same topic, excluding current post
        const response = await fetch(
          `/api/posts?topic=${encodeURIComponent(topic)}&limit=${limit + 1}`
        );
        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          // Filter out current post and limit results
          const filtered = data.data
            .filter(
              (article: Article) =>
                article._id !== currentPostId &&
                article.id !== currentPostId
            )
            .slice(0, limit);
          setArticles(filtered);
        }
      } catch (error) {
        console.error("Failed to fetch related articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedArticles();
  }, [topic, currentPostId, limit]);

  if (loading) {
    return (
      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0a73b0] dark:border-blue-400 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          More On This Topic
        </h3>
      </div>

      <div className="space-y-4">
        {articles.map((article) => {
          const postSlug = getPostSlug(article);
          if (postSlug === "invalid-slug") return null;
          return (
            <Link
              key={article._id || article.id}
              href={`/${postSlug}`}
              className="block group"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-[#0a73b0] dark:hover:border-blue-400 hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-[#0a73b0] dark:group-hover:text-blue-400 transition-colors mb-2 line-clamp-2">
                      {article.title}
                    </h4>
                    {article.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                        {article.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      {article.author && <span>By {article.author}</span>}
                      {article.date && (
                        <span>
                          {new Date(article.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-[#0a73b0] dark:group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
