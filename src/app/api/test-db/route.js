import { connectToDatabase } from "@/utils/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Test final_articles
    const finalArticles = db.collection("final_articles");
    const finalCount = await finalArticles.countDocuments({});
    const finalSample = await finalArticles.findOne({});
    
    // Test Articles
    const articles = db.collection("Articles");
    const articlesCount = await articles.countDocuments({});
    const articlesSample = await articles.findOne({});
    
    return new Response(
      JSON.stringify({
        final_articles: {
          count: finalCount,
          sample: finalSample
            ? {
                _id: finalSample._id?.toString(),
                title: finalSample.title,
                topic: finalSample.topic,
                hasDate: !!finalSample.date,
                hasPublishedAt: !!finalSample.published_at,
              }
            : null,
        },
        Articles: {
          count: articlesCount,
          sample: articlesSample
            ? {
                _id: articlesSample._id?.toString(),
                title: articlesSample.title,
                topic: articlesSample.topic,
                hasDate: !!articlesSample.date,
              }
            : null,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

