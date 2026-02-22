import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import {
  isValidSlug,
  extractFirstImageFromContent,
  removeFirstImageFromContent,
} from "@/lib/utils";
import { getArticle } from "@/lib/supabase-queries";
import CommentSection from "@/components/comments/CommentSection";
import RelatedArticles from "@/components/blog/RelatedArticles";
import SocialShare from "@/components/blog/SocialShare";
import ArticleSidebar from "@/components/blog/ArticleSidebar";
import ViewTracker from "@/components/blog/ViewTracker";
import LikeButton from "@/components/blog/LikeButton";
import EzoicAd from "@/components/ads/EzoicAd";

// Cache 5 min to reduce Supabase egress; new/updated articles appear after revalidate
export const revalidate = 300;

async function getPost(slug: string): Promise<any | null> {
  try {
    console.log("🔍 [getPost] Fetching post with slug:", slug);
    
    // Use Supabase to fetch article
    const article = await getArticle(slug);
    
    if (!article) {
      console.log("❌ [getPost] Post not found for slug:", slug);
      return null;
    }

    console.log("✅ [getPost] Found post:", article.title);
    return article;
  } catch (error: any) {
    console.error("❌ [getPost] Error fetching post:", error);
    return null;
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  try {
    const resolvedParams = await params;
    const rawSlug = resolvedParams?.slug;

    let slug: string;
    if (typeof rawSlug === "string") {
      slug = decodeURIComponent(rawSlug);
    } else {
      notFound();
      return;
    }

    if (!isValidSlug(slug)) {
      notFound();
      return;
    }

    // Exclude reserved routes
    const reservedRoutes = [
      "api",
      "blog",
      "topics",
      "favicon.ico",
      "images",
      "globals.css",
      "tailwind.css",
    ];
    if (reservedRoutes.includes(slug.toLowerCase())) {
      notFound();
    }

    const post = await getPost(slug);

    if (!post) {
      console.log("❌ Post not found for slug:", slug);
      console.log("❌ This could be due to:");
      console.log("   1. Article doesn't exist");
      console.log("   2. Article is not published (is_published = false)");
      console.log("   3. Slug mismatch");
      notFound();
    }

    console.log("✅ Post found:", post.title);

    const postDate = post.date || post.publishedAt || post.createdAt;
    const rawContent = post.content || post.description || "";

    // Extract first image from content if no img field exists
    const extractedImage = extractFirstImageFromContent(rawContent);

    // Get first image from filtered_images array if it exists
    const filteredImage =
      post.filtered_images &&
      Array.isArray(post.filtered_images) &&
      post.filtered_images.length > 0
        ? post.filtered_images[0]
        : null;

    // Determine the cover image - prioritize hero_image, then filtered_images, then existing img fields, then extracted image
    const postImage =
      post.hero_image ||
      filteredImage ||
      post.img ||
      post.featuredImage ||
      post.image ||
      post.imageUrl ||
      extractedImage ||
      null; // Don't set default here, we'll handle it in the render

    // Remove the first image from content to prevent duplicate display
    // If we have a cover image (either from img field or extracted), remove first image from content
    const postContent = postImage
      ? removeFirstImageFromContent(rawContent)
      : rawContent;

    const postTopic = post.topic || post.category || "";

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <ViewTracker slug={slug} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Article Content */}
            <article className="lg:col-span-3">
              {/* Back Button */}
              <Link
                href="/"
                className="inline-flex items-center text-[#0a73b0] dark:text-blue-400 hover:text-[#2a9bd0] dark:hover:text-blue-300 mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>

              {/* Header */}
              <header className="mb-8">
                {postTopic && (
                  <span className="inline-block px-3 py-1 mb-4 text-sm font-medium text-[#0a73b0] dark:text-blue-400 bg-[#0a73b0]/10 dark:bg-blue-400/20 rounded-full">
                    {postTopic}
                  </span>
                )}

                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {post.title}
                </h1>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
                  {post.author && (
                    <div className="flex items-center">
                      <span className="font-medium">{post.author}</span>
                    </div>
                  )}
                  {postDate && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {format(new Date(postDate), "MMMM dd, yyyy")}
                    </div>
                  )}
                  {post.readingTime && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {post.readingTime}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    <span data-view-count>{post.views || 0} views</span>
                  </div>
                  <LikeButton
                    slug={slug}
                    initialLikes={post.likes || 0}
                  />
                </div>
              </header>

              {/* Featured Image - Only show if we have an image, otherwise skip */}
              {postImage && postImage !== "/images/azbyte.jpeg" && (
                <div className="relative w-full h-64 md:h-96 mb-8 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <img
                    src={postImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-[#0a73b0] dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-strong:font-bold prose-em:italic prose-ul:list-disc prose-ol:list-decimal">
                {postContent ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: postContent }}
                    className="text-gray-700 dark:text-gray-300 leading-relaxed"
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    {post.description || post.excerpt}
                  </p>
                )}
              </div>

              {/* In-Content Ad 1 - After Content */}
              <EzoicAd 
                placeholderId="ezoic-pub-ad-placeholder-108" 
                position="in-content-1"
                minHeight="250px"
                className="my-8"
              />

              {/* In-Content Ad 2 - Before Tags/Social Share */}
              <EzoicAd 
                placeholderId="ezoic-pub-ad-placeholder-109" 
                position="in-content-2"
                minHeight="250px"
                className="my-8"
              />

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Share */}
              <SocialShare
                title={post.title}
                url={`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/${slug}`}
                description={post.description}
              />

              {/* Related Articles */}
              {postTopic && (
                <RelatedArticles topic={postTopic} currentPostId={post._id} />
              )}

              {/* Comments Section */}
              <CommentSection postSlug={slug} />
            </article>

            {/* Sidebar */}
            <ArticleSidebar currentPostId={post._id} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("❌ Error in BlogPostPage:", error);
    notFound();
  }
}
