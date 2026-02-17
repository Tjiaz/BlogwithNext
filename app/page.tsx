import Sidebar from "../components/layout/Sidebar";
import MoreRecentPosts from "../components/blog/MoreRecentPosts";
import MostPopularArticles from "../components/home/MostPopularArticles";
import DiscoverTopics from "../components/home/DiscoverTopics";
import EzoicAd from "../components/ads/EzoicAd";
import HeroSectionClient from "../components/home/HeroSectionClient";
import { getBestImage } from "@/lib/utils";
import { getHomepageData } from "@/lib/supabase-queries";

export const runtime = "edge";
export const revalidate = 60;

export default async function Home() {
  // Fetch all homepage data from Supabase
  try {
    const { heroPosts, recentPosts, popularArticles } = await getHomepageData();
    
    // Transform heroPosts to include image
    const heroPostsWithImages = heroPosts.map((post: any) => ({
      ...post,
      image: getBestImage(post, null),
    }));

    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen" suppressHydrationWarning>
        {/* Hero with sidebar - both start at same level */}
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="lg:col-span-3">
              <HeroSectionClient initialPosts={heroPostsWithImages} />
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
