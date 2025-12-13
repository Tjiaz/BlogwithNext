import { connectToDatabase } from "@/utils/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("final_articles");
    
    // Simple test query
    const count = await collection.countDocuments({});
    const articles = await collection.find({}).limit(5).toArray();
    
    return new Response(
      JSON.stringify({
        totalCount: count,
        sampleArticles: articles.map(a => ({
          _id: a._id?.toString(),
          title: a.title?.substring(0, 50),
          topic: a.topic,
          source: a.source,
          hasPublishedAt: !!a.published_at,
          hasDate: !!a.date,
        })),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
        stack: error.stack,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

