import Parser from "rss-parser";
// import { TOPIC_RSS_FEEDS } from "@/config/rssFeeds";

const parser = new Parser();

// RSS feed URLs for each topic
const TOPIC_RSS_FEEDS = {
  AI: "https://example.com/rss/ai",
  "Career Advice": "https://example.com/rss/career-advice",
  "Computer Vision": "https://learnopencv.com/feed/",
  "Data Engineering": "https://www.kdnuggets.com/feed",
  "Data Science": "https://towardsdatascience.com/feed/",
  "Language Models": "https://example.com/rss/language-models",
  "Machine Learning": "https://clear.ml/feed",
  MLOps: "https://www.akira.ai/blog/rss.xml",
  NLP: "https://www.analyticsvidhya.com/blog/category/nlp/feed/",
  Programming: "https://stackoverflow.blog/feed/",
  Python: "https://www.blog.pythonlibrary.org/feed/",
  SQL: "https://www.sqlservercentral.com/blogs/feed",
};

export async function GET(req, { params }) {
  const { topic } = params;

  try {
    const feedUrl = TOPIC_RSS_FEEDS[topic];
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
