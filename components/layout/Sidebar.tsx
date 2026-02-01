"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "../ui/Button";
import { getPostSlug } from "@/lib/utils";
import toast from "react-hot-toast";
// import AdSenseSidebar from "../ads/AdSenseSidebar";

const Sidebar = () => {
  const [email, setEmail] = useState("");
  const [topPosts, setTopPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchTopPosts() {
      try {
        const response = await fetch(`/api/topArticles?page=1`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setTopPosts(data.slice(0, 9));
        }
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
    <aside className="hidden lg:block">
      <div className="space-y-6">
        {/* Newsletter Subscription Section */}
        <div className="w-72 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            Get the FREE ebook 'Az bytegems Artificial Intelligence Pocket
            Dictionary' along with the leading newsletter to your inbox.
          </p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
            <a
              href="#"
              className="text-blue-600 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                // Link to privacy policy page when available
              }}
            >
              Azbytegems Privacy Policy
            </a>
          </p>
        </div>


        {/* Top Posts Section */}
        <div className="w-72 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Top Posts
          </h3>
          {loading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : (
            <ul className="space-y-3">
              {topPosts && topPosts.length > 0 ? (
                topPosts.map((post) => {
                  const postSlug = getPostSlug(post);
                  return (
                    <li key={post.id || post._id}>
                      <Link
                        href={`/${postSlug}`}
                        className="text-sm text-[#0a73b0] dark:text-[#2a9bd0] hover:underline line-clamp-2 transition-colors"
                      >
                        {post.title}
                      </Link>
                    </li>
                  );
                })
              ) : (
                <li className="text-sm text-gray-500">No posts available</li>
              )}
            </ul>
          )}
        </div>

      </div>
    </aside>
  );
};

export default Sidebar;
