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
import TableOfContents from "@/components/blog/TableOfContents";
import { processArticleContent } from "@/lib/article-toc";
import type { Metadata } from "next";
import { topicPath } from "@/lib/content-discovery";

const siteUrl = "https://www.azbytegems.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(decodeURIComponent(slug));
  if (!post) return { title: "Article not found", robots: { index: false, follow: false } };

  const description = (post.description || post.excerpt || post.summary || `${post.title} — a practical guide from AzByteGems.`)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
  const canonical = `/${encodeURIComponent(post.slug || slug)}`;
  const imageCandidate = post.hero_image || post.featuredImage || post.img || post.imageUrl;
  const image = typeof imageCandidate === "string" && !imageCandidate.startsWith("data:")
    ? imageCandidate
    : undefined;

  return {
    title: post.title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: canonical,
      publishedTime: post.publishedAt || post.date || undefined,
      modifiedTime: post.updatedAt || undefined,
      authors: post.author ? [post.author] : undefined,
      images: image ? [{ url: image, alt: post.title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: post.title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

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
    const { html: articleHtml, headings } = processArticleContent(postContent || "");
    const showToc = headings.length > 0;

    const postTopic = post.topic || post.category || "";
    const publishedAt = post.publishedAt || post.date || post.createdAt;
    const articleJsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description || post.excerpt || post.summary || undefined,
      image: postImage && !postImage.startsWith("data:")
        ? [postImage.startsWith("http") ? postImage : `${siteUrl}${postImage}`]
        : undefined,
      datePublished: publishedAt || undefined,
      dateModified: post.updatedAt || publishedAt || undefined,
      author: {
        "@type": "Person",
        name: post.author || post.authorName || "AzByteGems",
      },
      publisher: {
        "@type": "Organization",
        name: "AzByteGems",
        url: siteUrl,
        logo: { "@type": "ImageObject", url: `${siteUrl}/images/AZbytegems2.png` },
      },
      mainEntityOfPage: `${siteUrl}/${encodeURIComponent(post.slug || slug)}`,
    };
    const articleUrl = `${siteUrl}/${encodeURIComponent(post.slug || slug)}`;
    const breadcrumbItems = [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      ...(postTopic
        ? [{ "@type": "ListItem", position: 2, name: postTopic, item: `${siteUrl}${topicPath(postTopic)}` }]
        : []),
      { "@type": "ListItem", position: postTopic ? 3 : 2, name: post.title, item: articleUrl },
    ];
    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbItems,
    };

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <ViewTracker slug={slug} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div
            className={
              showToc
                ? "lg:grid lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:gap-12"
                : "grid grid-cols-1 lg:grid-cols-4 gap-8"
            }
          >
            {/* Main Article Content */}
            <article className={showToc ? "min-w-0" : "lg:col-span-3"}>
              {/* Back Button */}
              <Link
                href="/"
                className="inline-flex items-center text-[#0a73b0] dark:text-blue-400 hover:text-[#2a9bd0] dark:hover:text-blue-300 mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>

              {postTopic && (
                <nav aria-label="Breadcrumb" className="mb-5 text-sm text-gray-500 dark:text-gray-400">
                  <ol className="flex flex-wrap items-center gap-2">
                    <li><Link href="/" className="hover:text-[#0a73b0] hover:underline">Home</Link></li>
                    <li aria-hidden="true">/</li>
                    <li><Link href={topicPath(postTopic)} className="hover:text-[#0a73b0] hover:underline">{postTopic}</Link></li>
                    <li aria-hidden="true">/</li>
                    <li aria-current="page" className="max-w-full truncate text-gray-700 dark:text-gray-200">{post.title}</li>
                  </ol>
                </nav>
              )}

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

              {showToc && (
                <div className="mb-8 lg:hidden">
                  <TableOfContents headings={headings} variant="inline" />
                </div>
              )}

              {/* Content */}
              <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-[#0a73b0] dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-strong:font-bold prose-em:italic prose-ul:list-disc prose-ol:list-decimal">
                {articleHtml ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: articleHtml }}
                    className="article-body text-gray-700 dark:text-gray-300 leading-relaxed"
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

            {showToc ? (
              <aside className="hidden lg:block">
                <div className="sticky top-24">
                  <TableOfContents headings={headings} />
                  <ArticleSidebar currentPostId={post._id} placement="under-toc" />
                </div>
              </aside>
            ) : (
              <ArticleSidebar currentPostId={post._id} />
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("❌ Error in BlogPostPage:", error);
    notFound();
  }
}
