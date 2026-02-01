"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getPostSlug } from "@/lib/utils";
import toast from "react-hot-toast";

interface Post {
  id: string;
  _id: string;
  title: string;
  description?: string;
  author?: string;
  date?: string;
  topic?: string;
  img?: string;
}

export default function BlogPage() {
  const [loading, setLoading] = useState(true);
  const [topPosts, setTopPosts] = useState<Post[]>([]);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [yearPosts, setYearPosts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [submittingNewsletter, setSubmittingNewsletter] = useState(false);

  useEffect(() => {
    async function fetchTopPosts() {
      try {
        const response = await fetch(`/api/topArticles?page=1`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setTopPosts(data.slice(0, 7));
        }
      } catch (error) {
        console.error("Failed to fetch top posts", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTopPosts();
  }, []);

  useEffect(() => {
    async function fetchLatestPosts() {
      try {
        const response = await fetch(`/api/latest_articles`);
        const data = await response.json();
        if (data.articles && Array.isArray(data.articles)) {
          setLatestPosts(data.articles);
        }
      } catch (error) {
        console.error("Failed to fetch latest posts", error);
      }
    }
    fetchLatestPosts();
  }, []);

  useEffect(() => {
    async function fetchYearlyPosts() {
      try {
        setLoading(true);
        const response = await fetch(`/api/top_post_years`);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setYearPosts(data);
        }
      } catch (error) {
        console.error("Failed to fetch yearly articles", error);
        setYearPosts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchYearlyPosts();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a73b0] dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Top Posts
                </h1>
                <div className="flex space-x-2">
                  <a
                    href="https://www.facebook.com/profile.php?id=61572544476793"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    <span className="text-sm font-bold">f</span>
                  </a>
                  <a
                    href="https://x.com/azbytegems"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-sm font-bold">X</span>
                  </a>
                </div>
              </div>

              <div className="flex w-full mb-6">
                <div className="flex-[0_0_25%] border-b-[2.5px] border-[#0B73B1]"></div>
                <div className="flex-1 border-b-[2px] border-[#0B73B1]"></div>
              </div>

              <h2
                id="top-posts"
                className="text-2xl font-semibold text-center mb-6 scroll-mt-20"
              >
                Current Top Posts
              </h2>

              <div className="space-y-6">
                {topPosts && topPosts.length > 0 ? (
                  topPosts.map((post) => {
                    const postSlug = getPostSlug(post);
                    return (
                      <div
                        key={post.id || post._id}
                        className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0"
                      >
                        <Link
                          href={`/${postSlug}`}
                          className="text-xl font-semibold text-gray-900 dark:text-gray-100 hover:text-[#0a73b0] dark:hover:text-blue-400 transition-colors block mb-2"
                        >
                          {post.title}
                        </Link>
                        {post.description && (
                          <p className="text-gray-600 dark:text-gray-400 mb-3">
                            {post.description}
                          </p>
                        )}
                        <div className="flex items-center text-sm text-gray-500">
                          {post.author && (
                            <span className="mr-3">By {post.author}</span>
                          )}
                          {post.date && (
                            <span className="mr-3">
                              {new Date(post.date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          )}
                          {post.topic && (
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                              {post.topic}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-gray-500">No articles found.</div>
                )}
              </div>

              {/* Top Posts By Year */}
              {yearPosts && yearPosts.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-2xl font-semibold text-center mb-2 text-gray-900 dark:text-gray-100">
                    Top Posts By Year
                  </h2>
                  <div className="flex w-full mb-6">
                    <div className="flex-[0_0_25%] border-b-[2.5px] border-[#0B73B1]"></div>
                    <div className="flex-1 border-b-[2px] border-[#0B73B1]"></div>
                  </div>

                  {yearPosts
                    .filter(
                      (yearData) =>
                        yearData.articles && yearData.articles.length > 0,
                    )
                    .map((yearData) => (
                      <div key={yearData.year} className="mb-8">
                        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                          Top Posts of {yearData.year}
                        </h3>
                        <ul className="space-y-4">
                          {yearData.articles.map((article: Post) => {
                            const articleSlug = getPostSlug(article);
                            return (
                              <li
                                key={article.id || article._id}
                                className="border-l-4 border-[#0a73b0] dark:border-blue-400 pl-4"
                              >
                                <Link
                                  href={`/${articleSlug}`}
                                  className="text-lg font-medium text-gray-900 dark:text-gray-100 hover:text-[#0a73b0] dark:hover:text-blue-400 transition-colors block mb-1"
                                >
                                  {article.title}
                                </Link>
                                {article.description && (
                                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                    {article.description}
                                  </p>
                                )}
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                  {article.author && (
                                    <span className="mr-3">
                                      By {article.author}
                                    </span>
                                  )}
                                  {article.date && (
                                    <span>
                                      {new Date(
                                        article.date,
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })}
                                    </span>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Search */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search AzByteGems..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#0a73b0] dark:focus:ring-blue-400 focus:border-transparent outline-none"
                  />
                  <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400 dark:text-gray-500" />
                </form>
              </div>

              {/* Latest Posts */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Latest Posts
                </h3>
                <div className="flex w-full mb-4">
                  <div className="flex-[0_0_25%] border-b-[3px] border-[#0B73B1]"></div>
                  <div className="flex-1 border-b-[2px] border-[#0B73B1]"></div>
                </div>
                <ol className="space-y-3">
                  {latestPosts && latestPosts.length > 0 ? (
                    latestPosts.map((post) => {
                      const postSlug = getPostSlug(post);
                      return (
                        <li key={post.id || post._id}>
                          <Link
                            href={`/${postSlug}`}
                            className="text-sm text-[#0a73b0] hover:text-[#2a9bd0] hover:underline transition-colors line-clamp-2"
                          >
                            {post.title}
                          </Link>
                        </li>
                      );
                    })
                  ) : (
                    <li className="text-gray-500 dark:text-gray-400">
                      No posts found.
                    </li>
                  )}
                </ol>
              </div>

              {/* Newsletter Signup */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();

                    if (
                      !newsletterEmail.trim() ||
                      !newsletterEmail.includes("@")
                    ) {
                      toast.error("Please enter a valid email address");
                      return;
                    }

                    setSubmittingNewsletter(true);
                    try {
                      const response = await fetch(
                        "/api/newsletter/subscribe",
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            email: newsletterEmail.trim(),
                          }),
                        },
                      );

                      const data = await response.json();

                      if (data.success) {
                        toast.success("Successfully subscribed to newsletter!");
                        setNewsletterEmail("");
                      } else {
                        toast.error(data.error || "Failed to subscribe");
                      }
                    } catch (error) {
                      console.error("Failed to subscribe:", error);
                      toast.error("Failed to subscribe. Please try again.");
                    } finally {
                      setSubmittingNewsletter(false);
                    }
                  }}
                >
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Your Email"
                    required
                    disabled={submittingNewsletter}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#0a73b0] dark:focus:ring-blue-400 focus:border-transparent outline-none mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <Button
                    type="submit"
                    disabled={submittingNewsletter}
                    className="w-full bg-gradient-to-r from-[#0a73b0] to-[#2a9bd0] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingNewsletter ? "Subscribing..." : "Sign Up"}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
