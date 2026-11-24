import { supabase } from "@/lib/supabase";

export function topicPath(topic: string) {
  return `/topics/${encodeURIComponent(topic.trim().replace(/\s+/g, "_"))}`;
}

export async function getPublishedTopics(): Promise<string[]> {
  const topics = new Map<string, string>();
  const pageSize = 500;
  for (let start = 0; ; start += pageSize) {
    const { data, error } = await supabase
      .from("final_articles")
      .select("topic, category")
      .eq("is_published", true)
      .range(start, start + pageSize - 1);
    if (error) {
      console.error("Failed to load published topics:", error.message);
      break;
    }
    if (!data?.length) break;
    for (const row of data) {
      const value = (row.topic || row.category || "").trim();
      if (value && !topics.has(value.toLocaleLowerCase())) {
        topics.set(value.toLocaleLowerCase(), value);
      }
    }
    if (data.length < pageSize) break;
  }
  return [...topics.values()].sort((a, b) => a.localeCompare(b));
}
