import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedTopics, topicPath } from "@/lib/content-discovery";
import { getTopicBadgeStyle } from "@/lib/topic-colors";

export const metadata: Metadata = {
  title: "Browse Python, Data Science & AI Topics",
  description: "Explore AzByteGems tutorials and practical resources by topic, including Python, AI, machine learning, and data science.",
  alternates: { canonical: "/topics" },
};

export default async function TopicsIndexPage() {
  const topics = await getPublishedTopics();
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-10 max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#0a73b0] dark:text-sky-300">Explore AzByteGems</p>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Browse tutorials by topic</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Choose a subject to find practical guides, explainers, and resources for your next project.</p>
        </header>
        {topics.length ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic) => (
              <li key={topic}>
                <Link href={topicPath(topic)} className="group flex h-full items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-sky-700">
                  <span className="font-semibold text-gray-900 group-hover:text-[#0a73b0] dark:text-gray-100 dark:group-hover:text-sky-300">{topic}</span>
                  <span className="rounded-full px-3 py-1 text-sm font-medium" style={getTopicBadgeStyle(topic)}>Explore</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-gray-200 bg-white p-6 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">Topics are temporarily unavailable. Please check back soon.</p>
        )}
      </div>
    </main>
  );
}
