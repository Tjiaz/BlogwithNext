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

    // Use simple find with sort - much faster than aggregation
    // MongoDB will use index if available on date field
    const articles = await Promise.race([
      collection
        .find({}, {
          projection: {
            _id: 1,
            title: 1,
            description: 1,
            author: 1,
            date: 1,
            topic: 1,
            filtered_images: 1,
          }
        })
        .sort({ date: -1 }) // Sort by date descending (MongoDB handles mixed types)
        .skip(skip)
        .limit(limit)
        .toArray(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 8000)
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
    console.error("Error fetching more recent articles:", error.message, error.stack);
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
