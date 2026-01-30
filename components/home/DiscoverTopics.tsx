"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Topic {
  name: string;
  color: string;
}

// Color mapping for topics - matches the screenshot design
const getTopicColor = (topicName: string): string => {
  const lower = topicName.toLowerCase();

  // Map topics to colors based on the screenshot
  const colorMap: Record<string, string> = {
    "data science": "bg-green-600",
    data_science: "bg-green-600",
    nlp: "bg-teal-500",
    sql: "bg-orange-500",
    python: "bg-purple-600",
    programming: "bg-emerald-600",
    ai: "bg-pink-500",
    ml: "bg-blue-500",
    "machine learning": "bg-blue-500",
    "machine learning ops": "bg-indigo-600",
    machine_learning_ops: "bg-indigo-600",
    "data engineering": "bg-cyan-600",
    "career advice": "bg-amber-600",
    career_advice: "bg-amber-600",
    "language models": "bg-violet-600",
    language_models: "bg-violet-600",
  };

  // Check exact match first
  if (colorMap[lower]) {
    return colorMap[lower];
  }

  // Check partial matches
  for (const [key, color] of Object.entries(colorMap)) {
    if (lower.includes(key) || key.includes(lower)) {
      return color;
    }
  }

  // Default color for unmapped topics
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

  // Use topic name hash for consistent color assignment
  let hash = 0;
  for (let i = 0; i < topicName.length; i++) {
    hash = topicName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return defaultColors[Math.abs(hash) % defaultColors.length];
};

// Fisher-Yates shuffle algorithm to randomly shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Get random 6 topics from the array
const getRandomTopics = (allTopics: string[], count: number = 6): string[] => {
  if (allTopics.length <= count) {
    return allTopics;
  }
  const shuffled = shuffleArray(allTopics);
  return shuffled.slice(0, count);
};

export default function DiscoverTopics() {
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Ensure this only runs on client side
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    async function fetchTopics() {
      try {
        const res = await fetch("/api/topics");
        const data = await res.json();

        if (data.success && Array.isArray(data.topics)) {
          // Randomly select 6 topics from all available topics
          const randomTopics = getRandomTopics(data.topics, 6);
          setTopics(randomTopics);
        }
      } catch (error) {
        console.error("Failed to fetch topics:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTopics();
  }, [mounted]);

  // Don't render anything until mounted on client to avoid hydration mismatch
  if (!mounted || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6"></div>
          <div className="flex flex-wrap gap-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-24"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (topics.length === 0) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 relative inline-block">
          Discover by topics
          <span className="absolute bottom-0 left-0 w-20 h-0.5 bg-[#0a73b0] dark:bg-blue-400"></span>
        </h2>
      </div>

      <div className="flex flex-wrap gap-3">
        {topics.map((topic) => {
          const topicSlug = topic.replace(/\s+/g, "_");
          const colorClass = getTopicColor(topic);

          return (
            <Link
              key={topic}
              href={`/topics/${encodeURIComponent(topicSlug)}`}
              className={`${colorClass} text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg`}
            >
              {topic}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
