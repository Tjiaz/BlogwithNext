import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
// import AdSenseSidebar from "@/components/ads/AdSenseSidebar";
import clientPromise from "@/lib/mongodb";
import { getPostSlug, getBestImage } from "@/lib/utils";

async function getTopicPosts(slug: string) {
  try {
    const client = await clientPromise;
    const db = client.db("ARTICLES");

    // Decode URL encoding and normalize
    const decodedSlug = decodeURIComponent(slug)
      .replace(/_/g, " ")
      .replace(/%20/g, " ")
      .trim();

    const cleanSlug = decodedSlug.toLowerCase().trim();
    let query: any;

    // Handle special cases and variations
    if (cleanSlug === "career advice" || cleanSlug === "career_advice") {
      // Match "Career Advice" or "career_advice" (case-insensitive, flexible spacing/underscores)
      query = {
        $or: [
          { topic: { $regex: /^Career\s+Advice$/i } },
          { topic: { $regex: /^career_advice$/i } },
        ],
      };
    } else if (cleanSlug === "machine learning") {
      // Match "Machine Learning" but NOT "Machine Learning Ops" or "machine_learning_ops"
      query = {
        $and: [
          { topic: { $regex: /^Machine\s+Learning$/i } },
          { topic: { $not: /Machine\s+Learning\s+Ops/i } },
          { topic: { $not: /machine_learning_ops/i } },
        ],
      };
    } else if (cleanSlug === "machine learning ops" || cleanSlug === "mlops") {
      // Match Machine Learning Ops or machine_learning_ops (case-insensitive, flexible spacing/underscores)
      query = {
        $or: [
          { topic: { $regex: /^Machine\s+Learning\s+Ops$/i } },
          { topic: { $regex: /^machine_learning_ops$/i } },
          { topic: { $regex: /^MLOps$/i } },
        ],
      };
    } else if (cleanSlug === "data engineering") {
      // Match "Data Engineering" or "data_engineer" (case-insensitive, flexible spacing/underscores)
      query = {
        $or: [
          { topic: { $regex: /^Data\s+Engineering$/i } },
          { topic: { $regex: /^data_engineer$/i } },
        ],
      };
    } else if (cleanSlug === "data science") {
      // Match "Data Science" exactly (case-insensitive, flexible spacing)
      query = {
        topic: { $regex: /^Data\s+Science$/i },
      };
    } else if (
      cleanSlug === "language models" ||
      cleanSlug === "language_models"
    ) {
      // Match "Language Models" or "language_models" (case-insensitive, flexible spacing/underscores)
      query = {
        $or: [
          { topic: { $regex: /^Language\s+Models$/i } },
          { topic: { $regex: /^language_models$/i } },
        ],
      };
    } else {
      // For other topics, use case-insensitive exact match
      // Replace spaces with flexible space matching
      const escapedSlug = cleanSlug
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        .replace(/\s+/g, "\\s+");
      query = {
        topic: { $regex: new RegExp(`^${escapedSlug}$`, "i") },
      };
    }

    // Fetch all matching documents
    const docs = await db.collection("final_articles").find(query).toArray();

    // Sort by date in descending order (newest first)
    // Handles multiple date field names and formats
    docs.sort((a: any, b: any) => {
      const dateA = new Date(
        a.date || a.publishedAt || a.createdAt || 0,
      ).getTime();
      const dateB = new Date(
        b.date || b.publishedAt || b.createdAt || 0,
      ).getTime();
      return dateB - dateA; // Descending order (newest first)
    });

    return {
      success: true,
      topic: slug,
      count: docs.length,
      articles: docs.map((d) => ({
        ...d,
        _id: d._id.toString(),
      })),
    };
  } catch (e: any) {
    return {
      success: false,
      error: e.message,
      topic: slug,
      count: 0,
      articles: [],
    };
  }
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getTopicPosts(slug);

  // Decode URL encoding and format properly
  let formattedTopic = decodeURIComponent(slug)
    .replace(/_/g, " ")
    .replace(/%20/g, " ")
    .trim();

  // If topic contains commas, take only the first one (in case DB has comma-separated values)
  if (formattedTopic.includes(",")) {
    formattedTopic = formattedTopic.split(",")[0].trim();
  }

  // Capitalize properly
  formattedTopic = formattedTopic
    .split(" ")
    .map((word) => {
      // Preserve acronyms
      const upper = word.toUpperCase();
      if (["AI", "ML", "NLP", "SQL", "RSS"].includes(upper)) {
        return upper;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");

  // Handle special case: Machine Learning Ops (not MLOps)
  if (
    formattedTopic.toLowerCase() === "machine learning ops" ||
    formattedTopic.toLowerCase() === "machine_learning_ops"
  ) {
    formattedTopic = "Machine Learning Ops";
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {formattedTopic}
                <span className="ml-3 text-lg font-normal text-[#0B73B1] dark:text-blue-400">
                  ({data.count} {data.count === 1 ? "Article" : "Articles"})
                </span>
              </h1>

              <div className="flex w-full mb-6">
                <div className="flex-[0_0_25%] border-b-[3px] border-[#0B73B1]"></div>
                <div className="flex-1 border-b-[2px] border-[#0B73B1]"></div>
              </div>

              <div className="space-y-6">
                {data.articles && data.articles.length > 0 ? (
                  data.articles.map((article: any) => (
                    <div
                      key={article._id}
                      className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0"
                    >
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        {(() => {
                          // Get best image using utility function (always returns default if none found)
                          const bestImage = getBestImage(
                            article,
                            article.content,
                          );

                          return (
                            <div className="flex-shrink-0 w-full sm:w-32 h-48 sm:h-32 rounded-lg overflow-hidden bg-gray-200">
                              <Image
                                src={bestImage}
                                alt={article.title}
                                width={128}
                                height={128}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          );
                        })()}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/${getPostSlug(article)}`}
                            className="text-xl font-semibold text-gray-900 dark:text-gray-100 hover:text-[#0a73b0] dark:hover:text-blue-400 transition-colors block mb-2"
                          >
                            {article.title}
                          </Link>
                          {article.description && (
                            <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                              {article.description}
                            </p>
                          )}
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            {article.author && (
                              <span className="mr-3">By {article.author}</span>
                            )}
                            {article.date && (
                              <span>
                                {new Date(article.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  },
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 text-center py-12">
                    No articles found for this topic.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Search */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <form className="relative">
                  <input
                    type="text"
                    placeholder="Search AzByteGems..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#0a73b0] dark:focus:ring-blue-400 focus:border-transparent outline-none"
                  />
                  <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400 dark:text-gray-500" />
                </form>
              </div>


              {/* Newsletter Signup */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <input
                  type="text"
                  placeholder="Your Email"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#0a73b0] dark:focus:ring-blue-400 focus:border-transparent outline-none mb-3"
                />
                <Button className="w-full bg-gradient-to-r from-[#0a73b0] to-[#2a9bd0] hover:opacity-90">
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
