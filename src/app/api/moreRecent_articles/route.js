import { connectToDatabase } from "@/utils/mongodb";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page"), 10) || 1;
  const limit = 8;
  const skip = (page - 1) * limit;

  try {
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL environment variable is not set");
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const { db } = await connectToDatabase();

    // Try final_articles first, fallback to Articles if no results
    let collection = db.collection("final_articles");
    let articles = [];

    try {
      // Get articles with proper sorting and filtering
      // Filter for 2025 articles and sort by published_at descending (newest first)
      const startOf2025 = new Date("2025-01-01T00:00:00.000Z");
      const startOf2026 = new Date("2026-01-01T00:00:00.000Z");
      
      articles = await collection
        .find({
          published_at: {
            $gte: startOf2025,
            $lt: startOf2026,
          },
          topic: { $nin: ["Rss Feed", "RSS Feed", "rss feed", "rss"] },
        })
        .sort({ published_at: -1 }) // Sort by published_at descending (newest first)
        .limit(150)
        .toArray();

      console.log(
        `[moreRecent_articles] Fetched ${articles.length} articles from final_articles`
      );

      // If no articles from final_articles, try Articles collection
      if (articles.length === 0) {
        console.log(
          `[moreRecent_articles] No articles in final_articles, trying Articles collection`
        );
        collection = db.collection("Articles");
        articles = await collection
          .find({
            published_at: {
              $gte: startOf2025,
              $lt: startOf2026,
            },
            topic: { $nin: ["Rss Feed", "RSS Feed", "rss feed", "rss"] },
          })
          .sort({ published_at: -1 })
          .limit(150)
          .toArray();
        console.log(
          `[moreRecent_articles] Fetched ${articles.length} articles from Articles collection`
        );
      }

      // Filter out RSS feeds in JavaScript (only once)
      const beforeFilter = articles.length;
      console.log(
        `[moreRecent_articles] Before RSS filter: ${articles.length} articles`
      );

      articles = articles.filter((article) => {
        const topic = (article.topic || "").toLowerCase().trim();
        const source = (article.source || "").toLowerCase().trim();
        // Filter out:
        // 1. Articles where source is explicitly "rss_source" (actual RSS feeds)
        // 2. Articles with topic "RSS Feed" (these should only appear in RSS section)
        // This ensures we show articles from ALL other topics
        const isRss = source === "rss_source" || topic === "rss feed";
        return !isRss;
      });

      console.log(
        `[moreRecent_articles] After RSS filter: ${
          articles.length
        } articles (filtered out ${
          beforeFilter - articles.length
        } RSS articles)`
      );

      console.log(
        `[moreRecent_articles] After RSS filter: ${articles.length} articles`
      );

      // Sort in JavaScript (more reliable)
      articles.sort((a, b) => {
        // Handle both new format (published_at) and old format (date)
        const dateA = a.published_at || a.date || a.created_at || new Date(0);
        const dateB = b.published_at || b.date || b.created_at || new Date(0);
        return new Date(dateB) - new Date(dateA); // Descending (newest first)
      });
    } catch (error) {
      console.error(
        "[moreRecent_articles] Query error:",
        error.message,
        error.stack
      );
      articles = [];
    }

    // Apply pagination after filtering and sorting
    articles = articles.slice(skip, skip + limit);

    console.log(
      `[moreRecent_articles] After filtering: ${articles.length} articles`
    );

    const processedResults = articles.map((article) => ({
      id: article._id.toString(),
      title: article.title,
      description: article.description,
      author: article.author || "",
      date: article.published_at?.toString() || article.date || "",
      topic: article.topic || "",
      filtered_images: article.filtered_images || [],
      hero_image: article.hero_image || null,
    }));

    return new Response(JSON.stringify(processedResults), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(
      "Error fetching more recent articles:",
      error.message,
      error.stack
    );
    // Return empty array instead of error to prevent frontend issues
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
