"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTopicColor } from "@/components/home/DiscoverTopics";

export default function TopicsIndexPage() {
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/topics");
        const data = await res.json();
        if (cancelled) return;
        if (data.success && Array.isArray(data.topics)) {
          const sorted = [...data.topics].sort((a: string, b: string) =>
            a.localeCompare(b, undefined, { sensitivity: "base" }),
          );
          setTopics(sorted);
        } else {
          setError("Could not load topics.");
        }
      } catch {
        if (!cancelled) setError("Could not load topics.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Topics
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
            Browse articles by topic. Choose a topic below to see related posts.
          </p>
        </div>

        {loading && (
          <div className="animate-pulse flex flex-wrap gap-3">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="h-11 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg"
              />
            ))}
          </div>
        )}

        {error && !loading && (
          <p className="text-red-600 dark:text-red-400">{error}</p>
        )}

        {!loading && !error && topics.length === 0 && (
          <p className="text-gray-600 dark:text-gray-400">No topics yet.</p>
        )}

        {!loading && topics.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {topics.map((topic) => {
              const topicSlug = topic.replace(/\s+/g, "_");
              const colorClass = getTopicColor(topic);
              return (
                <Link
                  key={topic}
                  href={`/topics/${encodeURIComponent(topicSlug)}`}
                  className={`${colorClass} text-white px-5 py-2.5 rounded-lg font-medium hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-md hover:shadow-lg`}
                >
                  {topic}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
