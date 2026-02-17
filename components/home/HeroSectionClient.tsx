"use client";

import dynamic from "next/dynamic";

const HeroSection = dynamic(
  () => import("./HeroSection"),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-3 sm:p-6 lg:p-8 w-full min-h-[300px] flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading articles...</div>
      </div>
    ),
  }
);

export default function HeroSectionClient({ initialPosts }: { initialPosts: any[] }) {
  return <HeroSection initialPosts={initialPosts} />;
}
