import { connectToDatabase } from "@/utils/mongodb";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page"), 10) || 1;
  const limit = 5;
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
    const collection = db.collection("final_articles");

    // Use aggregation to get top article from each topic (excluding RSS feeds)
    // Only filter by source, not by topic - articles with topic "RSS Feed" but source "html_source" are legitimate
    const pipeline = [
      {
        $match: {
          // Only exclude articles where source is explicitly "rss_source"
          $or: [
            { source: { $ne: "rss_source" } },
            { source: { $exists: false } }, // Include documents where source doesn't exist
            { source: null }, // Include documents where source is null
          ],
        },
      },
      {
        $addFields: {
          sortDate: {
            $ifNull: ["$published_at", "$created_at"], // Use published_at, fallback to created_at
          },
        },
      },
      {
        $sort: { sortDate: -1 }, // Sort by sortDate descending (newest first)
      },
      {
        $group: {
          _id: "$topic",
          topArticle: { $first: "$$ROOT" }, // Get the first (newest) article from each topic
        },
      },
      {
        $replaceRoot: { newRoot: "$topArticle" }, // Replace root with the article
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          author: 1,
          date: 1, // Human-readable format for display
          topic: 1,
          filtered_images: 1,
          hero_image: 1,
          // Don't include sortDate in projection (it's automatically excluded)
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ];

    // Execute query - removed timeout to let MongoDB handle it
    const articles = await collection.aggregate(pipeline).toArray();

    console.log(
      `[topArticles] Found ${articles.length} articles from aggregation`
    );

    // Process results
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
    console.error("Error fetching top articles:", error);
    // Return empty array instead of error to prevent frontend issues
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
