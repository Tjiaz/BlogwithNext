"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { TrendingUp, Clock, ArrowRight } from "lucide-react";
import { getPostSlug, getBestImage } from "@/lib/utils";
import toast from "react-hot-toast";
import EzoicAd from "../ads/EzoicAd";

interface Article {
  _id: string;
  id?: string;
  title: string;
  description?: string;
  date?: string;
  author?: string;
  topic?: string;
  img?: string;
}

interface ArticleSidebarProps {
  currentPostId?: string;
}

export default function ArticleSidebar({ currentPostId }: ArticleSidebarProps) {
  const [latestPosts, setLatestPosts] = useState<Article[]>([]);
  const [topPosts, setTopPosts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        setLoading(true);

        // Fetch latest articles
        const latestResponse = await fetch("/api/latest_articles?limit=5");
        const latestData = await latestResponse.json();
        if (latestData.articles && Array.isArray(latestData.articles)) {
          setLatestPosts(
            latestData.articles.filter(
              (post: Article) =>
                post._id !== currentPostId && post.id !== currentPostId,
            ),
          );
        }

        // Fetch top articles
        const topResponse = await fetch("/api/topArticles?limit=5");
        const topData = await topResponse.json();
        if (Array.isArray(topData)) {
          setTopPosts(
            topData.filter(
              (post: Article) =>
                post._id !== currentPostId && post.id !== currentPostId,
            ),
          );
        }
      } catch (error) {
        console.error("Failed to fetch sidebar data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSidebarData();
  }, [currentPostId]);

  return (
    <aside className="lg:col-span-1">
      <div className="space-y-6 sticky top-24">
        {/* Ad Space - Top of Sidebar */}
        <EzoicAd 
          placeholderId="ezoic-pub-ad-placeholder-101" 
          position="sidebar-top"
          minHeight="250px"
          className="mb-6"
        />

        {/* Top Posts */}
        {!loading && topPosts.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-[#0a73b0] dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Top Posts
              </h3>
            </div>
            <div className="flex w-full mb-4">
              <div className="flex-[0_0_25%] border-b-[3px] border-[#0B73B1]"></div>
              <div className="flex-1 border-b-[2px] border-[#0B73B1]"></div>
            </div>
            <div className="space-y-3">
              {topPosts.slice(0, 5).map((post) => {
                const postSlug = getPostSlug(post);
                const bestImage = getBestImage(post);
                return (
                  <Link
                    key={post._id || post.id}
                    href={`/${postSlug}`}
                    className="block group"
                  >
                    <div className="flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors">
                      {bestImage && (
                        <div className="flex-shrink-0 w-16 h-16 rounded overflow-hidden bg-gray-200 dark:bg-gray-700">
                          <Image
                            src={bestImage}
                            alt={post.title}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-[#0a73b0] dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-1">
                          {post.title}
                        </h4>
                        {post.date && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="w-3 h-3" />
                            {new Date(post.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Ad Space - Middle of Sidebar */}
        <EzoicAd 
          placeholderId="ezoic-pub-ad-placeholder-102" 
          position="sidebar-middle"
          minHeight="300px"
          className="mb-6"
        />

        {/* Latest Posts */}
        {!loading && latestPosts.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-[#0a73b0] dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Latest Posts
              </h3>
            </div>
            <div className="flex w-full mb-4">
              <div className="flex-[0_0_25%] border-b-[3px] border-[#0B73B1]"></div>
              <div className="flex-1 border-b-[2px] border-[#0B73B1]"></div>
            </div>
            <ol className="space-y-2">
              {latestPosts.slice(0, 5).map((post, index) => {
                const postSlug = getPostSlug(post);
                return (
                  <li key={post._id || post.id}>
                    <Link
                      href={`/${postSlug}`}
                      className="flex items-start gap-2 group hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0a73b0] dark:bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-[#0a73b0] dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {post.title}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        )}


        {/* Ad Space - Bottom of Sidebar */}
        <EzoicAd 
          placeholderId="ezoic-pub-ad-placeholder-103" 
          position="sidebar-bottom"
          minHeight="250px"
          className="mb-6"
        />

        {/* Newsletter Signup */}
        <div className="bg-gradient-to-r from-[#0a73b0] to-[#2a9bd0] dark:from-blue-600 dark:to-blue-700 rounded-lg shadow p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
          <p className="text-sm text-blue-100 mb-4">
            Get the latest articles delivered to your inbox
          </p>
          <form
            onSubmit={async (e) => {
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
            }}
            className="space-y-2"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              required
              disabled={submitting}
              className="w-full px-4 py-2 rounded-lg bg-white/90 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white focus:outline-none text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-white text-[#0a73b0] dark:text-blue-600 py-2 rounded-lg font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2"
            >
              {submitting ? "Subscribing..." : "Subscribe"}
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
