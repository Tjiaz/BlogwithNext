import { connectToDatabase } from "@/utils/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("final_articles");

    // Get all articles with their topics and sources
    const articles = await collection.find({}).limit(100).toArray();

    // Count by topic
    const topicCount = {};
    const sourceCount = {};
    const rssMatches = [];

    articles.forEach((article) => {
      const topic = (article.topic || "").toLowerCase().trim();
      const source = (article.source || "").toLowerCase().trim();

      topicCount[topic] = (topicCount[topic] || 0) + 1;
      sourceCount[source] = (sourceCount[source] || 0) + 1;

      // Check if this would be filtered as RSS
      const isRss =
        topic === "rss feed" || topic === "rss" || source === "rss_source";

      if (isRss) {
        rssMatches.push({
          title: article.title?.substring(0, 50),
          topic: article.topic,
          source: article.source,
        });
      }
    });

    return new Response(
      JSON.stringify({
        totalArticles: articles.length,
        topicDistribution: topicCount,
        sourceDistribution: sourceCount,
        rssMatchesCount: rssMatches.length,
        rssMatchesSample: rssMatches.slice(0, 10),
        nonRssCount: articles.length - rssMatches.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
