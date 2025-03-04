// utils/rssWorker.js
import Parser from "rss-parser";
import { PrismaClient } from "@prisma/client";
import { cacheData } from "./cache";

const RSS_CACHE_KEY = "rss_feeds";
const RSS_CACHE_TTL = 1800000; // 30 minutes

export async function fetchAndCacheRSSFeeds() {
  const parser = new Parser();
  const prisma = new PrismaClient();

  try {
    const feeds = await Promise.all(
      RSS_FEEDS.map((url) => parser.parseURL(url))
    );

    const articles = feeds.flatMap((feed) =>
      feed.items.map((item) => ({
        title: item.title?.trim(),
        description: item.contentSnippet,
        link: item.link,
        pubDate: item.isoDate || item.pubDate,
        author: item.creator?.trim() || "Unknown",
        guid: item.guid || item.link,
        content: item.content,
        image: item.enclosure?.url,
      }))
    );

    // Cache the results
    cacheData(RSS_CACHE_KEY, articles, RSS_CACHE_TTL);

    // Store in database
    await prisma.rssArticle.createMany({
      data: articles,
      skipDuplicates: true,
    });

    return articles;
  } catch (error) {
    console.error("RSS Worker Error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
