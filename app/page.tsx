import HeroSection from "../components/home/HeroSection";
import Sidebar from "../components/layout/Sidebar";
import MoreRecentPosts from "../components/blog/MoreRecentPosts";
import MostPopularArticles from "../components/home/MostPopularArticles";
import DiscoverTopics from "../components/home/DiscoverTopics";
import clientPromise from "@/lib/mongodb";
import { extractFirstImageFromContent, getBestImage } from "@/lib/utils";

// Fetch recent posts server-side
async function getRecentPosts() {
  try {
    const client = await clientPromise;
    const db = client.db("ARTICLES");
    const collection = db.collection("final_articles");

    const posts = await collection
      .find({})
      .sort({ date: -1, publishedAt: -1, createdAt: -1 })
      .limit(8)
      .toArray();

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
      img: getBestImage(post, post.content),
      featuredImage: post.featuredImage,
      image: post.image,
    }));
  } catch (error) {
    console.error("Failed to fetch recent posts:", error);
    return [];
  }
}

// Fetch popular articles server-side
async function getPopularArticles() {
  try {
    const client = await clientPromise;
    const db = client.db("ARTICLES");
    const collection = db.collection("final_articles");

    const articles = await collection
      .find({})
      .sort({ date: -1, publishedAt: -1, createdAt: -1 })
      .limit(4)
      .toArray();

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
      img: getBestImage(article, article.content),
    }));
  } catch (error) {
    console.error("Failed to fetch popular articles:", error);
    return [];
  }
}

// Fetch hero posts server-side
async function getHeroPosts() {
  try {
    const client = await clientPromise;
    const db = client.db("ARTICLES");
    const collection = db.collection("final_articles");

    const posts = await collection
      .find({})
      .sort({ date: -1, publishedAt: -1, createdAt: -1 })
      .limit(10)
      .toArray();

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
      image: getBestImage(p, p.content),
    }));
  } catch (error) {
    console.error("Failed to fetch hero posts:", error);
    return [];
  }
}

export default async function Home() {
  // Fetch data server-side for immediate rendering
  const [recentPosts, popularArticles, heroPosts] = await Promise.all([
    getRecentPosts(),
    getPopularArticles(),
    getHeroPosts(),
  ]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Top Ad Banner - reduced width */}
      <div className="w-full flex justify-center py-4">
        <div className="w-full max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="w-full h-20 rounded-lg overflow-hidden">
            <img
              src="/images/Adverts/ads.gif"
              alt="Top Ad Banner"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Hero with sidebar - both start at same level */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <HeroSection initialPosts={heroPosts} />
          </div>
          <Sidebar />
        </div>
      </div>

      {/* Two-Column Section: More Recent Posts | Most Popular Articles */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: More Recent Posts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <MoreRecentPosts initialPosts={recentPosts} />
          </div>

          {/* Right Column: Most Popular Articles */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
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
}
