"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "../ui/Button";
import { getPostSlug } from "@/lib/utils";
import toast from "react-hot-toast";
import EzoicAd from "../ads/EzoicAd";

const Sidebar = () => {
  const [email, setEmail] = useState("");
  const [topPosts, setTopPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Successfully subscribed to newsletter!");
        setEmail("");
      } else {
        toast.error(data.error || "Failed to subscribe");
      }
    } catch (error) {
      console.error("Failed to subscribe:", error);
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside className="hidden lg:block w-full min-w-0">
      <div className="sticky top-24 space-y-5">
        {/* Newsletter — top-aligned with featured column */}
        <div className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Stay Updated
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
            Get the FREE ebook &apos;Az bytegems Artificial Intelligence Pocket
            Dictionary&apos; along with the newsletter.
          </p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0a73b0] focus:border-transparent text-sm"
            />
            <Button
              type="submit"
              fullWidth
              disabled={submitting}
              className="bg-gradient-to-r from-[#0a73b0] to-[#2a9bd0] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Subscribing..." : "Sign Up"}
            </Button>
          </form>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
            By subscribing you accept{" "}
            <Link href="/privacy" className="text-[#0a73b0] dark:text-blue-400 hover:underline">
              Azbytegems Privacy Policy
            </Link>
          </p>
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
