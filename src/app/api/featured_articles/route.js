import { connectToDatabase } from "@/utils/mongodb";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { db } = await connectToDatabase();
    
    const collection = db.collection("Articles");

    // Get the 3 most recent articles (regardless of date format)
    // Use aggregation to handle different date formats
    let featuredArticles = await collection
      .aggregate([
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            author: 1,
            date: 1,
            topic: 1,
            filtered_images: 1,
            // Create a sortable date field
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
          $sort: { sortDate: -1 },
        },
        {
          $limit: 3,
        },
        {
          $project: {
            sortDate: 0, // Remove the temporary sortDate field
          },
        },
      ])
      .toArray();

    // If no articles today, get the 3 most recent articles
    if (featuredArticles.length === 0) {
      featuredArticles = await collection
        .find({})
        .project({
          _id: 1,
          title: 1,
          description: 1,
          author: 1,
          date: 1,
          topic: 1,
          filtered_images: 1,
        })
        .sort({ date: -1 })
        .limit(3)
        .toArray();
    }

    // Process results
    const processedResults = featuredArticles.map((article) => ({
      _id: article._id.toString(),
      title: article.title,
      description: article.description,
      author: article.author,
      date: article.date,
      topic: article.topic,
      filtered_images: article.filtered_images || [],
      url: `${process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000"}/article_details/${article._id.toString()}`,
    }));

    return new Response(JSON.stringify(processedResults), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching featured articles:", error);
    return new Response(
      JSON.stringify({
        message: "Error fetching featured articles",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
