import { connectToDatabase } from "@/utils/mongodb";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  // Get current year and include recent years
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2]; // e.g., [2025, 2024, 2023]
  const limit = 5;

  try {
    const { db } = await connectToDatabase();
    // Try final_articles first, fallback to Articles
    let collection = db.collection("final_articles");
    let collectionName = "final_articles";
    
    // Check if final_articles has data
    const count = await collection.countDocuments({});
    if (count === 0) {
      collection = db.collection("Articles");
      collectionName = "Articles";
      console.log("[top_post_years] Using Articles collection (final_articles is empty)");
    } else {
      console.log(`[top_post_years] Using final_articles collection (${count} documents)`);
    }

    const results = {};

    // Process each year using aggregation
    for (const year of years) {
      const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
      const startOfNextYear = new Date(`${year + 1}-01-01T00:00:00.000Z`);
      
      const pipeline = [
        {
          $match: {
            // Exclude RSS feeds
            $and: [
              {
                $or: [
                  { source: { $ne: "rss_source" } },
                  { source: { $exists: false } },
                  { source: null },
                ],
              },
              // Filter by year - prioritize published_at (Date object), fallback to date
              {
                $or: [
                  // Match on published_at (should be Date object)
                  {
                    published_at: {
                      $gte: startOfYear,
                      $lt: startOfNextYear,
                    },
                  },
                  // Fallback: match on date field if published_at doesn't exist
                  // This handles both Date objects and string dates
                  {
                    $and: [
                      { published_at: { $exists: false } },
                      {
                        $or: [
                          {
                            date: {
                              $gte: startOfYear,
                              $lt: startOfNextYear,
                            },
                          },
                          // Also try matching year in date string (for old format like "Mar 22, 2024")
                          {
                            date: {
                              $regex: year.toString(),
                            },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
        {
          $addFields: {
            // Use published_at if available, otherwise date
            sortDate: {
              $ifNull: ["$published_at", "$date"],
            },
          },
        },
        {
          $sort: { sortDate: -1 }, // Newest first
        },
        {
          $limit: limit,
        },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            author: 1,
            date: 1,
            published_at: 1,
            topic: 1,
            filtered_images: 1,
            hero_image: 1,
          },
        },
      ];

      try {
        const articles = await collection.aggregate(pipeline).toArray();
        console.log(`[top_post_years] Found ${articles.length} articles for year ${year}`);

        results[year] = articles.map((article) => ({
          id: article._id.toString(),
          title: article.title,
          description: article.description,
          author: article.author || "",
          date: article.published_at?.toString() || article.date || "",
          topic: article.topic || "",
          filtered_images: article.filtered_images || [],
          hero_image: article.hero_image || null,
        }));
      } catch (error) {
        console.error(`[top_post_years] Error fetching articles for year ${year}:`, error);
        results[year] = [];
      }
    }

    const processedResults = years.map((year) => ({
      year,
      articles: results[year] || [],
    }));

    return new Response(JSON.stringify(processedResults), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching articles by year:", error);
    return new Response(
      JSON.stringify({
        message: "Error fetching articles",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
