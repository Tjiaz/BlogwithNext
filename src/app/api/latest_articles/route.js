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
      return new Response(
        JSON.stringify({
          articles: [],
          totalCount: 0,
          page: 1,
          totalPages: 0,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { db } = await connectToDatabase();

    // Try final_articles first, fallback to Articles if no results
    let collection = db.collection("final_articles");
    let articles = [];

    try {
      console.log(
        `[latest_articles] Starting query at ${new Date().toISOString()}`
      );

      // Get articles with absolute minimal query
      // Fetch more articles to account for RSS filtering (fetch 3x the limit to ensure we have enough after filtering)
      const queryStart = Date.now();
      articles = await collection.find({}).limit(150).toArray();
      const queryTime = Date.now() - queryStart;

      console.log(
        `[latest_articles] Query took ${queryTime}ms, fetched ${articles.length} articles from final_articles`
      );

      // If query returned 0, check if collection exists and has data
      if (articles.length === 0) {
        const totalCount = await collection.countDocuments({});
        console.log(
          `[latest_articles] Collection has ${totalCount} total documents, but query returned 0`
        );
      }

      if (articles.length > 0) {
        console.log(`[latest_articles] First article sample:`, {
          _id: articles[0]._id?.toString(),
          title: articles[0].title?.substring(0, 50),
          topic: articles[0].topic,
          source: articles[0].source,
        });
      }

      // If no articles from final_articles, try Articles collection
      if (articles.length === 0) {
        console.log(
          `[latest_articles] No articles in final_articles, trying Articles collection`
        );
        collection = db.collection("Articles");
        articles = await collection.find({}).limit(50).toArray();
        console.log(
          `[latest_articles] Fetched ${articles.length} articles from Articles collection`
        );
      }

      // Filter out RSS feeds in JavaScript (only once)
      const beforeFilter = articles.length;
      console.log(
        `[latest_articles] Before RSS filter: ${articles.length} articles`
      );

      // Debug: Show sample before filtering
      const sampleBefore = articles.slice(0, 10).map((a) => ({
        title: a.title?.substring(0, 40),
        topic: a.topic,
        source: a.source,
      }));
      console.log(`[latest_articles] Sample before filter:`, sampleBefore);

      // Debug: Count by topic and source
      const topicCount = {};
      const sourceCount = {};
      articles.forEach((a) => {
        topicCount[a.topic] = (topicCount[a.topic] || 0) + 1;
        sourceCount[a.source] = (sourceCount[a.source] || 0) + 1;
      });
      console.log(`[latest_articles] Topic distribution:`, topicCount);
      console.log(`[latest_articles] Source distribution:`, sourceCount);

      const filteredOut = [];
      articles = articles.filter((article) => {
        const topic = (article.topic || "").toLowerCase().trim();
        const source = (article.source || "").toLowerCase().trim();

        // Filter out:
        // 1. Articles where source is explicitly "rss_source" (actual RSS feeds)
        // 2. Articles with topic "RSS Feed" (these should only appear in RSS section, not latest articles)
        // This ensures we show articles from ALL other topics (Data Engineering, SQL, NLP, etc.)
        const isRss = source === "rss_source" || topic === "rss feed";

        if (isRss) {
          filteredOut.push({
            title: article.title?.substring(0, 50),
            topic,
            source,
          });
        }
        return !isRss; // Return true to keep article, false to filter out
      });

      if (filteredOut.length > 0) {
        console.log(
          `[latest_articles] Filtered out ${filteredOut.length} RSS articles:`,
          filteredOut.slice(0, 5)
        );
      }

      // Debug: Show sample of remaining articles
      if (articles.length > 0) {
        console.log(
          `[latest_articles] Sample remaining articles:`,
          articles.slice(0, 5).map((a) => ({
            title: a.title?.substring(0, 40),
            topic: a.topic,
            source: a.source,
          }))
        );
      }

      console.log(
        `[latest_articles] After RSS filter: ${
          articles.length
        } articles (filtered out ${
          beforeFilter - articles.length
        } RSS articles)`
      );

      // Sort in JavaScript (more reliable than MongoDB sort on mixed types)
      articles.sort((a, b) => {
        // Handle both new format (published_at) and old format (date)
        const dateA = a.published_at || a.date || a.created_at || new Date(0);
        const dateB = b.published_at || b.date || b.created_at || new Date(0);
        return new Date(dateB) - new Date(dateA); // Descending (newest first)
      });

      // Debug: Show topic distribution after sorting
      const topicsAfterSort = {};
      articles.forEach((a) => {
        const topic = a.topic || "No topic";
        topicsAfterSort[topic] = (topicsAfterSort[topic] || 0) + 1;
      });
      console.log(`[latest_articles] Topics after sorting:`, topicsAfterSort);
    } catch (error) {
      console.error(
        "[latest_articles] Query error:",
        error.message,
        error.stack
      );
      articles = [];
    }

    // Apply pagination after filtering and sorting
    console.log(
      `[latest_articles] Before pagination: ${articles.length} articles (page ${page}, skip ${skip}, limit ${limit})`
    );

    // Debug: Show topic distribution of articles before pagination
    const topicsBeforePagination = {};
    articles.forEach((a) => {
      const topic = a.topic || "No topic";
      topicsBeforePagination[topic] = (topicsBeforePagination[topic] || 0) + 1;
    });
    console.log(
      `[latest_articles] Topics before pagination:`,
      topicsBeforePagination
    );

    articles = articles.slice(skip, skip + limit);

    // Debug: Show what topics are being returned after pagination
    const topicsAfterPagination = {};
    articles.forEach((a) => {
      const topic = a.topic || "No topic";
      topicsAfterPagination[topic] = (topicsAfterPagination[topic] || 0) + 1;
    });
    console.log(
      `[latest_articles] Topics after pagination (what's being returned):`,
      topicsAfterPagination
    );

    console.log(
      `[latest_articles] After pagination: ${articles.length} articles`
    );

    // Process results
    const processedResults = articles.map((article) => ({
      id: article._id.toString(),
      _id: article._id.toString(), // Include _id for backward compatibility
      title: article.title,
      description: article.description,
      author: article.author || "",
      date: article.published_at?.toString() || article.date || "",
      topic: article.topic || "",
      filtered_images: article.filtered_images || [],
      hero_image: article.hero_image || null,
    }));

    console.log(
      `[latest_articles] Returning ${processedResults.length} processed articles`
    );
    if (processedResults.length > 0) {
      console.log(
        `[latest_articles] First article:`,
        JSON.stringify(
          {
            id: processedResults[0].id,
            title: processedResults[0].title,
            topic: processedResults[0].topic,
          },
          null,
          2
        )
      );
    }

    return new Response(
      JSON.stringify({
        articles: processedResults,
        totalCount: processedResults.length, // Approximate count
        page,
        totalPages: Math.ceil(processedResults.length / limit),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(
      "Error fetching latest articles:",
      error.message,
      error.stack
    );
    // Return empty array instead of error to prevent frontend issues
    return new Response(
      JSON.stringify({
        articles: [],
        totalCount: 0,
        page: 1,
        totalPages: 0,
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
