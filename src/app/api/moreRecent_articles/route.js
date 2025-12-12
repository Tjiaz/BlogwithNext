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
    // This ensures correct date sorting while being reasonably fast
    const pipeline = [
      {
        // Add a sortable date field
        $addFields: {
          sortDate: {
            $cond: {
              if: { $eq: [{ $type: "$date" }, "date"] },
              then: "$date",
              else: {
                $cond: {
                  if: { $eq: [{ $type: "$date" }, "string"] },
                  then: {
                    $dateFromString: {
                      dateString: "$date",
                      onError: new Date(0), // Default to epoch for invalid dates
                    },
                  },
                  else: new Date(0), // Default for other types
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
