"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getPostSlug } from "@/lib/utils";

interface Post {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  excerpt?: string;
  topic?: string;
  category?: string;
  date?: string;
  publishedAt?: string;
  author?: string;
  img?: string;
  featuredImage?: string;
  image?: string;
}

interface MoreRecentPostsProps {
  initialPosts?: Post[];
}

export default function MoreRecentPosts({
  initialPosts = [],
}: MoreRecentPostsProps) {
  // Use initialPosts directly - no state needed if provided from server
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only fetch if no initial posts provided
    if (initialPosts.length > 0) {
      // Ensure posts state matches initialPosts
      setPosts(initialPosts);
      return;
    }

    const fetchRecentPosts = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/posts?limit=8", { cache: "no-store" });

        if (!res.ok) throw new Error("Failed to fetch posts");

        const json = await res.json();

        let fetched: Post[] = [];
        if (json?.success && Array.isArray(json.data)) {
          fetched = json.data;
        } else if (Array.isArray(json.posts)) {
          fetched = json.posts;
        } else if (Array.isArray(json)) {
          fetched = json;
        }

        // Sort by date (most recent first) if not already sorted
        fetched.sort((a, b) => {
          const dateA = new Date(a.date || a.publishedAt || 0).getTime();
          const dateB = new Date(b.date || b.publishedAt || 0).getTime();
          return dateB - dateA;
        });

        // Take only the 8 most recent
        setPosts(fetched.slice(0, 8));
      } catch (error) {
        console.error("Failed to load recent posts:", error);
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentPosts();
  }, [initialPosts]);

  // Always render the same structure when initialPosts are provided
  // This ensures server and client render match
  const displayPosts = posts.length > 0 ? posts : [];

  // Only show loading if we have no initial posts and are actually loading
  if (displayPosts.length === 0 && isLoading && initialPosts.length === 0) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          More Recent Posts
        </h2>
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse h-6 bg-gray-200 dark:bg-gray-700 rounded"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (displayPosts.length === 0) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          More Recent Posts
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          No recent posts found.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        More Recent Posts
      </h2>
      <div className="space-y-2">
        {displayPosts.map((post) => {
          const postSlug = getPostSlug(post);

          return (
            <Link
              key={post._id}
              href={`/${postSlug}`}
              className="block py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 group"
            >
              <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 group-hover:text-[#0a73b0] dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                {post.title}
              </h3>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
