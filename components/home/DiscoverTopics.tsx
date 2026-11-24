import Link from "next/link";
import { getPublishedTopics, topicPath } from "@/lib/content-discovery";
import { getTopicBadgeStyle } from "@/lib/topic-colors";

export default async function DiscoverTopics() {
  const topics = (await getPublishedTopics()).slice(0, 12);
  if (!topics.length) return null;

  return (
    <section aria-labelledby="discover-topics-heading" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="discover-topics-heading" className="text-2xl font-bold text-gray-900 dark:text-gray-100 md:text-3xl">Explore practical guides by topic</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Find tutorials, explainers, and resources in your area of interest.</p>
        </div>
        <Link href="/topics" className="font-semibold text-[#0a73b0] hover:underline dark:text-sky-300">Browse all topics →</Link>
      </div>
      <div className="flex flex-wrap gap-3">
        {topics.map((topic) => (
          <Link key={topic} href={topicPath(topic)} className="rounded-lg px-5 py-2.5 font-medium shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a73b0]" style={getTopicBadgeStyle(topic)}>
            {topic}
          </Link>
        ))}
      </div>
    </section>
  );
}
