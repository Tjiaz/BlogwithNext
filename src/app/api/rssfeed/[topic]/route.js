import Parser from "rss-parser";
import { topicFeeds } from "@/config/topicFeeds";

const parser = new Parser();

export async function GET(req, { params }) {
  // Decode the topic parameter to handle URL-encoded spaces and special characters
  const topic = decodeURIComponent(params.topic);

  try {
    const feedUrl = topicFeeds[topic];
    if (!feedUrl) {
      return new Response(JSON.stringify({ error: "Topic not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const feed = await parser.parseURL(feedUrl);

    const articles = feed.items.map((item) => ({
      title: item.title?.trim(),
      description: item.contentSnippet || item.description,
      link: item.link?.trim(),
      pubDate: item.isoDate || item.pubDate,
      author: item.creator?.trim().replace(/\n/g, "") || "Unknown",
      guid: item.guid || item.link,
      content: item.content,
      image: item.enclosure?.url || null,
      isRssPost: true,
    }));

    return new Response(JSON.stringify(articles), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`Error fetching RSS feed for topic ${topic}:`, error);
    return new Response(JSON.stringify({ error: "Failed to fetch RSS feed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
