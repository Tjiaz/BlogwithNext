import Sidebar from "../components/layout/Sidebar";
import HeroSection from "../components/home/HeroSection";
import MoreRecentPosts from "../components/blog/MoreRecentPosts";
import MostPopularArticles from "../components/home/MostPopularArticles";
import DiscoverTopics from "../components/home/DiscoverTopics";
import EzoicAd from "../components/ads/EzoicAd";
import { getBestImage } from "@/lib/utils";
import { getHomepageData } from "@/lib/supabase-queries";

// Cache 10 min so most visitors get cached response → much less Supabase egress
export const revalidate = 600;

export default async function Home() {
  // Fetch all homepage data from Supabase
  try {
    const data = await getHomepageData();
    const { heroPosts, recentPosts, popularArticles, quotaExceeded } = data;

    if (quotaExceeded) {
      return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Content temporarily unavailable
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Our database provider has reached its bandwidth limit for this period. Content will be back automatically when the quota resets (typically by the end of the billing cycle).
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Please try again later or check back in a few days.
            </p>
          </div>
        </div>
      );
    }

    // Transform heroPosts to include image
    const heroPostsWithImages = heroPosts.map((post: any) => ({
      ...post,
      image: getBestImage(post, null),
    }));

    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Hero with sidebar - both start at same level */}
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="lg:col-span-3">
              <HeroSection initialPosts={heroPostsWithImages} />
            </div>
            <Sidebar />
          </div>
        </div>

        {/* Ad Banner - Between Hero and Content Sections */}
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4">
          <EzoicAd 
            placeholderId="ezoic-pub-ad-placeholder-104" 
            position="homepage-banner"
            minHeight="100px"
            className="w-full"
          />
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

        {/* Ad Banner - Before Topics Section */}
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4">
          <EzoicAd 
            placeholderId="ezoic-pub-ad-placeholder-105" 
            position="homepage-before-topics"
            minHeight="100px"
            className="w-full"
          />
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
