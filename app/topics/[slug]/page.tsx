import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import EzoicAd from "@/components/ads/EzoicAd";
import { supabase } from "@/lib/supabase";
import { getPostSlug, getBestImage } from "@/lib/utils";

async function getTopicPosts(slug: string) {
  try {
    // Decode URL encoding and normalize
    const decodedSlug = decodeURIComponent(slug)
      .replace(/_/g, " ")
      .replace(/%20/g, " ")
      .trim();

    const cleanSlug = decodedSlug.toLowerCase().trim();
    
    // Build Supabase query based on topic slug
    let query = supabase
      .from("final_articles")
      .select("id, title, slug, description, excerpt, topic, category, date, published_at, created_at, author, author_name, img, featured_image, image, image_url, hero_image, filtered_images, content")
      .eq("is_published", true);

    // Handle special cases and variations - use proper Supabase query syntax
    // Supabase ilike uses % for wildcards, and or() syntax is: "field1.ilike.value1,field2.ilike.value2"
    if (cleanSlug === "career advice" || cleanSlug === "career_advice") {
      query = query.or("topic.ilike.%Career Advice%,topic.ilike.%career_advice%,category.ilike.%Career Advice%,category.ilike.%career_advice%");
    } else if (cleanSlug === "machine learning") {
      // Match "Machine Learning" but NOT "Machine Learning Ops"
      query = query.ilike("topic", "%Machine Learning%").not("topic", "ilike", "%Machine Learning Ops%");
    } else if (cleanSlug === "machine learning ops" || cleanSlug === "mlops") {
      query = query.or("topic.ilike.%Machine Learning Ops%,topic.ilike.%machine_learning_ops%,topic.ilike.%MLOps%,category.ilike.%Machine Learning Ops%");
    } else if (cleanSlug === "data engineering") {
      query = query.or("topic.ilike.%Data Engineering%,topic.ilike.%data_engineer%,category.ilike.%Data Engineering%");
    } else if (cleanSlug === "data science") {
      query = query.or("topic.ilike.%Data Science%,category.ilike.%Data Science%");
    } else if (cleanSlug === "language models" || cleanSlug === "language_models") {
      query = query.or("topic.ilike.%Language Models%,topic.ilike.%language_models%,category.ilike.%Language Models%");
    } else if (cleanSlug === "sql") {
      query = query.or("topic.ilike.%SQL%,category.ilike.%SQL%");
    } else {
      // For other topics, use case-insensitive match with wildcards
      // Escape special regex chars but keep % for Supabase wildcards
      const searchTerm = decodedSlug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query = query.or(`topic.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
    }

    // Order by date and fetch
    const { data: articles, error } = await query
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false, nullsFirst: false });

    if (error) {
      console.error(`❌ [getTopicPosts] Error fetching topic "${slug}":`, error);
      return {
        success: false,
        error: error.message,
        topic: slug,
        count: 0,
        articles: [],
      };
    }

    if (!articles || articles.length === 0) {
      return {
        success: true,
        topic: slug,
        count: 0,
        articles: [],
      };
    }

    // Transform articles to match expected format
    const transformedArticles = articles.map((article: any) => ({
      _id: article.id,
      id: article.id,
      title: article.title || "",
      slug: article.slug || article.id,
      description: article.description || article.excerpt || "",
      excerpt: article.excerpt || article.description || "",
      topic: article.topic || article.category || "",
      category: article.category || article.topic || "",
      date: article.date || article.published_at || article.created_at || "",
      publishedAt: article.published_at || article.date || article.created_at || "",
      createdAt: article.created_at || article.published_at || article.date || "",
      author: article.author || article.author_name || "Unknown",
      authorName: article.author_name || article.author || "Unknown",
      img: article.img || article.featured_image || article.image || article.image_url || article.hero_image || null,
      featuredImage: article.featured_image || article.img || article.image || article.image_url || article.hero_image || null,
      image: article.image || article.img || article.featured_image || article.image_url || article.hero_image || null,
      imageUrl: article.image_url || article.img || article.featured_image || article.image || article.hero_image || null,
      hero_image: article.hero_image || article.img || article.featured_image || article.image || article.image_url || null,
      filtered_images: article.filtered_images || [],
      content: article.content || "",
    }));

    return {
      success: true,
      topic: slug,
      count: transformedArticles.length,
      articles: transformedArticles,
    };
  } catch (e: any) {
    console.error(`❌ [getTopicPosts] Exception for topic "${slug}":`, e);
    return {
      success: false,
      error: e.message || "Unknown error",
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
              {/* Ad Space - Top of Topic Sidebar */}
              <EzoicAd 
                placeholderId="ezoic-pub-ad-placeholder-110" 
                position="topic-sidebar-top"
                minHeight="250px"
                className="mb-6"
              />

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


              {/* Ad Space - Middle of Topic Sidebar */}
              <EzoicAd 
                placeholderId="ezoic-pub-ad-placeholder-111" 
                position="topic-sidebar-middle"
                minHeight="300px"
                className="mb-6"
              />

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
