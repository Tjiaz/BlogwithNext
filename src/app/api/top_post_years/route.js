import { connectToDatabase } from "@/utils/mongodb";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const years = [2024, 2023];
  const limit = 5;

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("Articles");

    const results = {};

    // Process each year using aggregation
    for (const year of years) {
      const pipeline = [
        {
          $addFields: {
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
          $addFields: {
            yearFromDate: {
              $cond: {
                if: { $eq: [{ $type: "$date" }, "date"] },
                then: { $year: "$date" },
                else: {
                  $year: {
                    $dateFromString: {
                      dateString: "$date",
                      onError: new Date(0),
                    },
                  },
                },
              },
            },
          },
        },
        {
          $match: {
            $or: [
              { yearFromDate: year },
              { date: { $regex: year.toString() } },
            ],
          },
        },
        {
          $sort: { sortDate: -1 },
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
            topic: 1,
            filtered_images: 1,
            sortDate: 0,
            yearFromDate: 0,
          },
        },
      ];

      const articles = await collection.aggregate(pipeline).toArray();

      results[year] = articles.map((article) => ({
        id: article._id.toString(),
        title: article.title,
        description: article.description,
        author: article.author,
        date: article.date,
        topic: article.topic,
        filtered_images: article.filtered_images || [],
      }));
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
