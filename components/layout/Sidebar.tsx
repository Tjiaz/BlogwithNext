"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getPostSlug } from "@/lib/utils";
import EzoicAd from "../ads/EzoicAd";
import NewsletterSignup from "@/components/home/NewsletterSignup";

const Sidebar = () => {
  const [topPosts, setTopPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopPosts() {
      try {
        const response = await fetch(`/api/posts?page=1&limit=9`);
        const json = await response.json();
        const posts =
          (json?.success && Array.isArray(json?.data) ? json.data : null) ??
          (Array.isArray(json) ? json : []);
        setTopPosts(posts.slice(0, 9));
      } catch (error) {
        console.error("Failed to fetch top posts", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTopPosts();
  }, []);

  return (
    <aside className="hidden lg:block w-full min-w-0">
      <div className="sticky top-24 space-y-5">
        {/* Newsletter — top-aligned with featured column */}
        <div className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Stay Updated
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
            Get practical Python, data science, and AI tutorials and resources in your inbox.
          </p>
          <NewsletterSignup source="homepage-sidebar" buttonLabel="Sign up" />
        </div>

        {/* Top Posts */}
        <div className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Top Posts
          </h3>
          {loading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : (
            <ol className="space-y-3 list-none">
              {topPosts && topPosts.length > 0 ? (
                topPosts.map((post, index) => {
                  const postSlug = getPostSlug(post);
                  if (postSlug === "invalid-slug") return null;
                  return (
                    <li key={post.id || post._id} className="flex gap-2.5">
                      <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 w-5 shrink-0 pt-0.5">
                        {index + 1}.
                      </span>
                      <Link
                        href={`/${postSlug}`}
                        className="text-sm text-[#0a73b0] dark:text-[#2a9bd0] hover:underline line-clamp-2 transition-colors leading-snug"
                      >
                        {post.title}
                      </Link>
                    </li>
                  );
                })
              ) : (
                <li className="text-sm text-gray-500">No posts available</li>
              )}
            </ol>
          )}
        </div>

        {/* Ads below content so tops align with featured */}
        <EzoicAd
          placeholderId="ezoic-pub-ad-placeholder-106"
          position="homepage-sidebar-top"
          minHeight="250px"
          className="w-full"
        />
        <EzoicAd
          placeholderId="ezoic-pub-ad-placeholder-107"
          position="homepage-sidebar-middle"
          minHeight="300px"
          className="w-full"
        />
      </div>
    </aside>
  );
};

export default Sidebar;
