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

    // Use Articles collection (flattened, faster) with optimized aggregation
    const collection = db.collection("Articles");

    // Use aggregation but optimize it - only convert dates for sorting, not all fields
    // This handles multiple date formats (Date objects, ISO strings, various string formats)
    const pipeline = [
      {
        // Add a sortable date field that handles multiple date formats
        // Date format in DB: "Mar 22, 2024" (human-readable)
        $addFields: {
          sortDate: {
            $cond: {
              // If it's already a Date object, use it directly
              if: { $eq: [{ $type: "$date" }, "date"] },
              then: "$date",
              // If it's a string, try to parse it
              else: {
                $cond: {
                  if: { $eq: [{ $type: "$date" }, "string"] },
                  then: {
                    // Try parsing date - handle both ISO format and human-readable format
                    $cond: {
                      // Check if it looks like ISO format (contains 'T' or starts with YYYY-MM-DD)
                      if: {
                        $or: [
                          { $gt: [{ $indexOfCP: ["$date", "T"] }, -1] }, // Contains 'T'
                          { $eq: [{ $substr: ["$date", 4, 1] }, "-"] }, // Has '-' at position 4 (YYYY-MM-DD)
                        ],
                      },
                      then: {
                        // Parse ISO format (auto-detect)
                        $dateFromString: {
                          dateString: "$date",
                          onError: new Date("1970-01-01"),
                        },
                      },
                      else: {
                        // Parse human-readable format "Mar 22, 2024" or "Nov 15, 2025"
                        $dateFromString: {
                          dateString: "$date",
                          format: "%b %d, %Y",
                          onError: new Date("1970-01-01"),
                        },
                      },
                    },
                  },
                  // For null, missing, or other types, use a very old date (so they appear last)
                  else: new Date("1970-01-01"),
                },
              },
            },
          },
        },
      },
      {
        $sort: { sortDate: -1 }, // Sort by converted date
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        // Remove the temporary sortDate field and project only needed fields
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          author: 1,
          date: 1,
          topic: 1,
          filtered_images: 1,
        },
      },
    ];

    // Execute query with timeout
    const articles = await Promise.race([
      collection.aggregate(pipeline).toArray(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Query timeout")), 8000)
      ),
    ]);

    // Skip totalCount to save time - can be calculated client-side if needed
    // const totalCount = await collection.countDocuments();

    // Process results
    const processedResults = articles.map((article) => ({
      id: article._id.toString(),
      _id: article._id.toString(), // Include _id for backward compatibility
      title: article.title,
      description: article.description,
      author: article.author,
      date: article.date,
      topic: article.topic,
      filtered_images: article.filtered_images || [],
    }));

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
