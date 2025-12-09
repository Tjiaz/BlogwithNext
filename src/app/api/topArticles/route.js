import { connectToDatabase } from "@/utils/mongodb";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page"), 10) || 1;
  const limit = 5;
  const skip = (page - 1) * limit;

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("Articles");

    // Use aggregation to get top article from each topic
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
        $sort: { sortDate: -1 }, // Sort by date descending
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
          sortDate: 0, // Remove the temporary sortDate field
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ];

    const articles = await collection.aggregate(pipeline).toArray();

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

    return new Response(JSON.stringify(processedResults), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching top articles:", error);
    return new Response(
      JSON.stringify({ message: "Error fetching articles", error: error.message }),
      { status: 500 }
    );
  }
}
