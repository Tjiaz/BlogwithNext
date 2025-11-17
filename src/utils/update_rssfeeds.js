const { PrismaClient } = require("@prisma/client");
const Parser = require("rss-parser");
const cron = require("node-cron");

const prisma = new PrismaClient();
const parser = new Parser();

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

async function updateRssFeeds() {
  try {
    console.log("Starting RSS feed update:", new Date().toISOString());

    // Get default user or create one
    const defaultUser = await prisma.user.upsert({
      where: { email: "rss-bot@example.com" },
      update: {},
      create: {
        email: "tunjiazeez24@gmail.com",
        name: "RSS Bot",
        password: "Ollatunji24$$", // Use environment variable in production
      },
    });

    for (const feedUrl of RSS_FEEDS) {
      try {
        console.log(`Fetching feed: ${feedUrl}`);
        const feed = await parser.parseURL(feedUrl);

        for (const item of feed.items) {
          const articleData = {
            title: item.title?.trim(),
            description: item.contentSnippet || item.description,
            content: item.content,
            date: new Date(item.isoDate || item.pubDate),
            author: item.creator?.trim().replace(/\n/g, "") || "Unknown",
            guid: item.guid || item.link,
            link: item.link?.trim(),
            img: item.enclosure?.url || null,
            isRssPost: true,
            topic: "RSS Feed",
            userId: defaultUser.id,
          };

          // Upsert article
          await prisma.article.upsert({
            where: { guid: articleData.guid },
            update: {
              ...articleData,
              updatedAt: new Date(),
            },
            create: articleData,
          });
        }
        console.log(`Processed feed: ${feedUrl}`);
      } catch (error) {
        console.error(`Error processing feed ${feedUrl}:`, error);
      }
    }

    console.log("RSS feed update completed:", new Date().toISOString());
  } catch (error) {
    console.error("RSS feed update failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run every 30 minutes
cron.schedule("*/120 * * * *", updateRssFeeds);

// Run immediately on startup
updateRssFeeds();
