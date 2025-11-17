import Parser from "rss-parser";
import { PrismaClient } from "@prisma/client";

// Force dynamic rendering
export const dynamic = "force-dynamic";
// Disable caching
export const fetchCache = "force-no-store";
// Set revalidation time (e.g., every 30 minutes)
export const revalidate = 1800;

const parser = new Parser();
const prisma = new PrismaClient();

const RSS_FEEDS = [
  "https://analyticsindiamag.com/feed/",
  "http://www.kdnuggets.com/feed",
  "https://datamites.com/blog/feed/",
  "https://feeds.feedburner.com/FeaturedBlogPosts-DataScienceCentral",
  "https://datafloq.com/feed/",
  "https://www.9to5sas.com/feed/",
  "https://insidebigdata.com/feed/",
  "https://www.datarobot.com/blog/feed/",
  "https://www.smartdatacollective.com/feed/",
  "https://medium.com/feed/kaggle-blog",
];

export async function GET() {
  try {
    // First fetch latest from RSS feeds
    const freshArticles = [];
    for (const feedUrl of RSS_FEEDS) {
      try {
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

        freshArticles.push(...articles);
      } catch (error) {
        console.error(`Error fetching feed ${feedUrl}:`, error);
      }
    }

    // Then, get recent articles from database
    const dbArticles = await prisma.article.findMany({
      where: { isRssPost: true },
      orderBy: { date: "desc" },
      take: 50, // Limit to recent articles
    });

    // Transform database articles to match fresh articles format
    const transformedDbArticles = dbArticles.map((article) => ({
      ...article,
      date: article.date.toISOString(),
      pubDate: article.date.toISOString(),
      isoDate: article.date.toISOString(),
    }));

    // Combine articles, preferring fresh ones over database ones
    const guidMap = new Map();

    // Add fresh articles first
    freshArticles.forEach((article) => {
      guidMap.set(article.guid, article);
    });

    // Add database articles only if not already present
    transformedDbArticles.forEach((article) => {
      if (!guidMap.has(article.guid)) {
        guidMap.set(article.guid, article);
      }
    });

    // Convert to array and sort
    const sortedArticles = Array.from(guidMap.values()).sort((a, b) => {
      const dateA = new Date(a.date || a.pubDate || a.isoDate);
      const dateB = new Date(b.date || b.pubDate || b.isoDate);
      return dateB - dateA;
    });

    // Return with strict no-cache headers
    return new Response(JSON.stringify(sortedArticles), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
        "Surrogate-Control": "no-store",
        "Edge-Control": "no-store",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error in RSS route:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch RSS feeds",
        details: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
