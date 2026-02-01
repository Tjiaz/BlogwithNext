import HeroSection from "../components/home/HeroSection";
import Sidebar from "../components/layout/Sidebar";
import MoreRecentPosts from "../components/blog/MoreRecentPosts";
import MostPopularArticles from "../components/home/MostPopularArticles";
import DiscoverTopics from "../components/home/DiscoverTopics";
// AdSense removed - Ezoic handles ad placement automatically
// import AdSenseBanner from "../components/ads/AdSenseBanner";
import clientPromise from "@/lib/mongodb";
import { extractFirstImageFromContent, getBestImage } from "@/lib/utils";

// Make homepage fully dynamic to skip build-time generation
// This prevents timeouts during Vercel build process
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Helper function to add timeout to promises
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

// Fetch recent posts server-side with timeout
async function getRecentPosts() {
  try {
    const queryPromise = (async () => {
      const client = await clientPromise;
      const db = client.db("ARTICLES");
      const collection = db.collection("final_articles");

      // Optimize: Only fetch needed fields, exclude large content field
      const posts = await collection
        .find({}, {
          projection: {
            _id: 1,
            title: 1,
            slug: 1,
            description: 1,
            excerpt: 1,
            topic: 1,
            category: 1,
            date: 1,
            publishedAt: 1,
            createdAt: 1,
            author: 1,
            img: 1,
            featuredImage: 1,
            image: 1,
            imageUrl: 1,
            hero_image: 1,
            filtered_images: 1,
            // Exclude content to speed up query
          }
        })
        .sort({ date: -1, publishedAt: -1, createdAt: -1 })
        .limit(8)
        .toArray();
      
      return posts;
    })();

    // Add 8 second timeout to prevent Vercel timeout (under 10s limit)
    const posts = await withTimeout(queryPromise, 8000);

    // Sort by date in descending order
    posts.sort((a: any, b: any) => {
      const dateA = new Date(
        a.date || a.publishedAt || a.createdAt || 0,
      ).getTime();
      const dateB = new Date(
        b.date || b.publishedAt || b.createdAt || 0,
      ).getTime();
      return dateB - dateA;
    });

    return posts.map((post: any) => ({
      _id: post._id.toString(),
      title: post.title,
      slug: post.slug || post._id.toString(),
      description: post.description,
      excerpt: post.excerpt,
      topic: post.topic,
      category: post.category,
      date: post.date || post.publishedAt,
      publishedAt: post.publishedAt,
      author: post.author,
      img: getBestImage(post, null), // Don't process content, use existing image fields
      featuredImage: post.featuredImage,
      image: post.image,
    }));
  } catch (error) {
    console.error("Failed to fetch recent posts:", error);
    // Return empty array on timeout or error so page can still render
    return [];
  }
}

// Fetch popular articles server-side with timeout
async function getPopularArticles() {
  try {
    const queryPromise = (async () => {
      const client = await clientPromise;
      const db = client.db("ARTICLES");
      const collection = db.collection("final_articles");

      // Optimize: Only fetch needed fields, exclude large content field
      const articles = await collection
        .find({}, {
          projection: {
            _id: 1,
            title: 1,
            description: 1,
            topic: 1,
            date: 1,
            publishedAt: 1,
            createdAt: 1,
            author: 1,
            img: 1,
            featuredImage: 1,
            image: 1,
            imageUrl: 1,
            hero_image: 1,
            filtered_images: 1,
            // Exclude content to speed up query
          }
        })
        .sort({ date: -1, publishedAt: -1, createdAt: -1 })
        .limit(4)
        .toArray();
      
      return articles;
    })();

    // Add 5 second timeout to prevent Vercel timeout
    const articles = await withTimeout(queryPromise, 5000);

    // Sort by date in descending order
    articles.sort((a: any, b: any) => {
      const dateA = new Date(
        a.date || a.publishedAt || a.createdAt || 0,
      ).getTime();
      const dateB = new Date(
        b.date || b.publishedAt || b.createdAt || 0,
      ).getTime();
      return dateB - dateA;
    });

    return articles.map((article: any) => ({
      id: article._id.toString(),
      _id: article._id.toString(),
      title: article.title,
      description: article.description,
      author: article.author || "",
      date: article.date || article.publishedAt || "",
      topic: article.topic || "",
      img: getBestImage(article, null), // Don't process content, use existing image fields
    }));
  } catch (error) {
    console.error("Failed to fetch popular articles:", error);
    // Return empty array on timeout or error so page can still render
    return [];
  }
}

// Fetch hero posts server-side with timeout
async function getHeroPosts() {
  try {
    const queryPromise = (async () => {
      const client = await clientPromise;
      const db = client.db("ARTICLES");
      const collection = db.collection("final_articles");

      // Optimize: Only fetch needed fields, exclude large content field
      const posts = await collection
        .find({}, {
          projection: {
            _id: 1,
            id: 1,
            slug: 1,
            title: 1,
            description: 1,
            excerpt: 1,
            summary: 1,
            topic: 1,
            category: 1,
            date: 1,
            publishedAt: 1,
            createdAt: 1,
            author: 1,
            authorName: 1,
            img: 1,
            featuredImage: 1,
            image: 1,
            imageUrl: 1,
            hero_image: 1,
            filtered_images: 1,
            // Exclude content to speed up query
          }
        })
        .sort({ date: -1, publishedAt: -1, createdAt: -1 })
        .limit(10)
        .toArray();
      
      return posts;
    })();

    // Add 8 second timeout to prevent Vercel timeout (under 10s limit)
    const posts = await withTimeout(queryPromise, 8000);

    // Sort by date in descending order
    posts.sort((a: any, b: any) => {
      const dateA = new Date(
        a.date || a.publishedAt || a.createdAt || 0,
      ).getTime();
      const dateB = new Date(
        b.date || b.publishedAt || b.createdAt || 0,
      ).getTime();
      return dateB - dateA;
    });

    return posts.map((p: any) => ({
      id: p._id?.toString() ?? p.id ?? p.slug,
      title: p.title ?? "",
      author: p.author ?? p.authorName ?? "Unknown",
      date: p.publishedAt ?? p.date ?? p.createdAt ?? null,
      excerpt: p.excerpt ?? p.description ?? p.summary ?? "",
      topic: p.topic ?? p.category ?? "",
      image: getBestImage(p, null), // Don't process content, use existing image fields
    }));
  } catch (error) {
    console.error("Failed to fetch hero posts:", error);
    // Return empty array on timeout or error so page can still render
    return [];
  }
}

export default async function Home() {
  // Fetch data server-side for immediate rendering with timeout protection
  try {
    const [recentPosts, popularArticles, heroPosts] = await Promise.all([
      getRecentPosts(),
      getPopularArticles(),
      getHeroPosts(),
    ]);

    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Ad placement handled automatically by Ezoic */}
        {/* Top Ad Banner - Ezoic will place ads here automatically */}

        {/* Hero with sidebar - both start at same level */}
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="lg:col-span-3">
              <HeroSection initialPosts={heroPosts} />
            </div>
            <Sidebar />
          </div>
        </div>

        {/* Two-Column Section: More Recent Posts | Most Popular Articles */}
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
            {/* Left Column: More Recent Posts */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-6 shadow-sm">
              <MoreRecentPosts initialPosts={recentPosts} />
            </div>

            {/* Right Column: Most Popular Articles */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-6 shadow-sm">
              <MostPopularArticles initialArticles={popularArticles} />
            </div>
          </div>
        </div>

        {/* Discover by Topics Section */}
        <div className="bg-white dark:bg-gray-800">
          <DiscoverTopics />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading homepage:", error);
    // Return a fallback UI if data fails to load
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h1 className="text-2xl font-bold mb-4">Welcome to BlogNext</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Loading content... Please refresh the page if this persists.
            </p>
          </div>
        </div>
      </div>
    );
  }
}
