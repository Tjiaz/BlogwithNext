import { connectToDatabase } from "@/utils/mongodb";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page"), 10) || 1;
  const limit = 8;
  const skip = (page - 1) * limit;

  try {
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

    const articles = await collection.aggregate(pipeline).toArray();

    // Get total count for pagination info (optional, can be removed if not needed)
    const totalCount = await collection.countDocuments();

    // Process results
    const processedResults = articles.map((article) => ({
      id: article._id.toString(),
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
        totalCount,
        page,
        totalPages: Math.ceil(totalCount / limit),
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
    return new Response(
      JSON.stringify({ message: "Error fetching articles", error: error.message }),
      { status: 500 }
    );
  }
}
