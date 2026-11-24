import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const siteUrl = "https://www.azbytegems.com";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    "",
    "/blog",
    "/topics",
    "/resources",
    "/resources/cheatsheets",
    "/resources/techbriefs",
    "/resources/recommendations",
    "/datasets",
    "/blog/about",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const articlePages: MetadataRoute.Sitemap = [];
  const seenTopics = new Set<string>();
  const pageSize = 500;

  for (let start = 0; ; start += pageSize) {
    const { data, error } = await supabase
      .from("final_articles")
      .select("id, slug, published_at, updated_at, topic, category")
      .eq("is_published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .range(start, start + pageSize - 1);

    if (error) {
      console.error("Failed to generate sitemap articles:", error.message);
      break;
    }
    if (!data?.length) break;

    for (const article of data) {
      const articleSlug = article.slug || article.id;
      if (articleSlug) {
        articlePages.push({
          url: `${siteUrl}/${encodeURIComponent(articleSlug)}`,
          lastModified: article.updated_at || article.published_at || undefined,
          changeFrequency: "monthly",
          priority: 0.8,
        });
      }
      const topic = article.topic || article.category;
      if (topic) seenTopics.add(topic);
    }
    if (data.length < pageSize) break;
  }

  const topicPages: MetadataRoute.Sitemap = [...seenTopics].map((topic) => ({
    url: `${siteUrl}/topics/${encodeURIComponent(topic.trim().replace(/\s+/g, "_"))}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...topicPages, ...articlePages];
}
