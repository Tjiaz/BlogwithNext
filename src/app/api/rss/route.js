// import Parser from "rss-parser";

// const parser = new Parser();

// export async function GET() {
//   try {
//     // Replace with your Feedspot RSS feed URL
//     const feedUrl =
//       "https://rss.feedspot.com/folder/5hrJs2cf5Q==/rss/rsscombiner";
//     const feed = await parser.parseURL(feedUrl);

//     console.log("Fetched feed:", feed);

//     const articles = feed.items.map((item) => ({
//       title: item.title,
//       description: item.contentSnippet || item.content,
//       link: item.link?.trim(),
//       pubDate: item.pubDate, // Include pubDate
//       isoDate: item.isoDate, // Include isoDate
//       author: item.creator?.trim().replace(/\n/g, "") || "Unknown",
//       guid: item.guid,
//       content: item.content,
//       // Handle enclosure (image) properly
//       image: item.enclosure?.url || null,
//       isRssPost: true,
//     }));

//     return new Response(JSON.stringify(articles), {
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching RSS feed:", error);
//     return new Response(JSON.stringify({ error: "Failed to fetch RSS feed" }), {
//       status: 500,
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });
//   }
// }

import Parser from "rss-parser";
import { PrismaClient } from "@prisma/client";

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
    // First, get recent articles from database
    const dbArticles = await prisma.article.findMany({
      where: { isRssPost: true },
      orderBy: { date: "desc" },
      take: 50, // Limit to recent articles
    });

    // Then fetch latest from RSS feeds
    const freshArticles = [];
    for (const feedUrl of RSS_FEEDS) {
      try {
        const feed = await parser.parseURL(feedUrl);
        console.log(feed);
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

    // Combine and deduplicate articles
    const allArticles = [...freshArticles, ...dbArticles];
    const uniqueArticles = Array.from(
      new Map(allArticles.map((article) => [article.guid, article])).values()
    );

    // Sort by date
    uniqueArticles.sort((a, b) => {
      const dateA = new Date(a.pubDate || a.date);
      const dateB = new Date(b.pubDate || b.date);
      return dateB - dateA;
    });

    return new Response(JSON.stringify(uniqueArticles), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Error in RSS route:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch RSS feeds" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
