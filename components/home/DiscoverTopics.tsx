"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getTopicBadgeStyle } from "@/lib/topic-colors";

interface Topic {
  name: string;
  color: string;
}

// Re-export so existing imports from DiscoverTopics keep working
export { getTopicColor, getTopicHex, getTopicBadgeStyle } from "@/lib/topic-colors";

// Deterministic shuffle using a seed based on array content
// This ensures the same topics always produce the same shuffle order (no hydration mismatch)
const deterministicShuffle = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  // Create a seed from the array content
  let seed = 0;
  for (let i = 0; i < array.length; i++) {
    const str = String(array[i]);
    for (let j = 0; j < str.length; j++) {
      seed = ((seed << 5) - seed) + str.charCodeAt(j);
      seed = seed & seed; // Convert to 32-bit integer
    }
  }
  
  // Simple pseudo-random generator using seed
  let random = seed;
  const nextRandom = () => {
    random = (random * 9301 + 49297) % 233280;
    return random / 233280;
  };
  
  // Fisher-Yates shuffle with deterministic random
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(nextRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Get first 6 topics from deterministically shuffled array
const getRandomTopics = (allTopics: string[], count: number = 6): string[] => {
  if (allTopics.length <= count) {
    return allTopics;
  }
  const shuffled = deterministicShuffle(allTopics);
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

          return (
            <Link
              key={topic}
              href={`/topics/${encodeURIComponent(topicSlug)}`}
              className="text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
              style={getTopicBadgeStyle(topic)}
            >
              {topic}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
