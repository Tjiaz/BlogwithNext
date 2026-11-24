"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { TrendingUp, Clock } from "lucide-react";
import { getPostSlug, getBestImage } from "@/lib/utils";
import EzoicAd from "../ads/EzoicAd";
import NewsletterSignup from "@/components/home/NewsletterSignup";

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
  /** Rail sits beside the article. Below spans the page under the table of contents. */
  placement?: "rail" | "below" | "under-toc";
}

export default function ArticleSidebar({
  currentPostId,
  placement = "rail",
}: ArticleSidebarProps) {
  const [latestPosts, setLatestPosts] = useState<Article[]>([]);
  const [topPosts, setTopPosts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

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

  const below = placement === "below";
  const underToc = placement === "under-toc";

  return (
    <div className={below ? "mt-12 border-t border-gray-200 pt-12 dark:border-gray-700" : underToc ? "space-y-6" : "lg:col-span-1"}>
      <div className={below ? "grid grid-cols-1 items-start gap-6 md:grid-cols-2" : underToc ? "space-y-6" : "sticky top-24 space-y-6"}>
        {/* Ad Space - Top of Sidebar */}
        {!underToc && <EzoicAd
          placeholderId="ezoic-pub-ad-placeholder-101" 
          position="sidebar-top"
          minHeight="250px"
          className="mb-6"
        />}

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
                if (postSlug === "invalid-slug") return null;
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
        {!underToc && <EzoicAd
          placeholderId="ezoic-pub-ad-placeholder-102" 
          position="sidebar-middle"
          minHeight="300px"
          className="mb-6"
        />}

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
                if (postSlug === "invalid-slug") return null;
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
        {!underToc && <EzoicAd
          placeholderId="ezoic-pub-ad-placeholder-103" 
          position="sidebar-bottom"
          minHeight="250px"
          className="mb-6"
        />}

        {/* Newsletter Signup */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">Stay Updated</h3>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            Get the latest articles delivered to your inbox
          </p>
          <NewsletterSignup source="article-sidebar" />
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
    </div>
  );
}
