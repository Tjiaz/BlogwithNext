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
    const collection = db.collection("Articles");

    // Use aggregation but optimize it - only convert dates for sorting
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
                    // Try parsing different date formats
                    // Format 1: ISO format (from write_articles): "2025-11-15T10:30:00.000Z"
                    // Format 2: Human-readable: "Mar 22, 2024" or "Nov 15, 2025" or "Dec 01, 2025"
                    $cond: {
                      // Check if it's ISO format (contains 'T' or starts with 4 digits)
                      if: {
                        $or: [
                          { $regexMatch: { input: "$date", regex: "^\\d{4}-\\d{2}-\\d{2}" } }, // ISO date format
                          { $regexMatch: { input: "$date", regex: "T" } }, // Contains 'T' (ISO datetime)
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
                        // MongoDB format: %b = abbreviated month (Jan-Dec), %d = day, %Y = 4-digit year
                        $dateFromString: {
                          dateString: "$date",
                          format: "%b %d, %Y", // Format: "Mar 22, 2024" or "Nov 15, 2025" or "Dec 01, 2025"
                          onError: new Date("1970-01-01"), // Use old date for invalid formats (appears last)
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

    const processedResults = articles.map((article) => ({
      id: article._id.toString(),
      title: article.title,
      description: article.description,
      author: article.author,
      date: article.date,
      topic: article.topic,
      filtered_images: article.filtered_images || [],
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
