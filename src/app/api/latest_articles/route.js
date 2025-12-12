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

    // Use Articles collection (flattened, faster) with aggregation pipeline
    const collection = db.collection("Articles");

    // Aggregation pipeline to:
    // 1. Handle different date formats and create sortable date
    // 2. Sort by date (newest first)
    // 3. Skip and limit for pagination
    // 4. Project only needed fields (exclude large content field)
    const pipeline = [
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          author: 1,
          date: 1,
          topic: 1,
          filtered_images: 1,
          sortDate: {
            $cond: {
              if: { $eq: [{ $type: "$date" }, "date"] },
              then: "$date",
              else: {
                $dateFromString: {
                  dateString: "$date",
                  onError: new Date(0), // Default to epoch if parsing fails
                },
              },
            },
          },
        },
      },
      {
        $sort: { sortDate: -1 }, // Sort by sortable date descending
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $project: {
          sortDate: 0, // Remove the temporary sortDate field
        },
      },
    ];

    // Execute query with timeout
    const articles = await Promise.race([
      collection.aggregate(pipeline).toArray(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 10000)
      )
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
    console.error("Error fetching articles:", error);
    // Return empty array instead of error to prevent frontend issues
    return new Response(
      JSON.stringify({
        articles: [],
        totalCount: 0,
        page: 1,
        totalPages: 0,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
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
