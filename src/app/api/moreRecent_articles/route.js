import { connectToDatabase } from "@/utils/mongodb";

export const dynamic = 'force-dynamic';

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

    // Use aggregation pipeline for efficient sorting and pagination
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
                  onError: new Date(0),
                },
              },
            },
          },
        },
      },
      {
        $sort: { sortDate: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $project: {
          sortDate: 0,
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
    console.error("Error fetching articles:", error);
    // Return empty array instead of error to prevent frontend issues
    return new Response(
      JSON.stringify([]),
      { 
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
