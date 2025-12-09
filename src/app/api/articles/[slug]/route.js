import { connectToDatabase } from "@/utils/mongodb";

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  const { slug } = params;
  const databaseName = "ARTICLES";

  try {
    const { db } = await connectToDatabase();

    // Try Articles collection first (faster, flattened structure)
    let articles = [];
    let topicTitle = "";

    // Try to find articles by topic in Articles collection
    const articlesCollection = db.collection("Articles");
    articles = await articlesCollection
      .find({
        topic: { $regex: slug, $options: "i" },
      })
      .project({
        _id: 1,
        title: 1,
        description: 1,
        author: 1,
        date: 1,
        topic: 1,
        filtered_images: 1,
        content: 1,
      })
      .sort({ date: -1 })
      .toArray();

    if (articles.length > 0) {
      topicTitle = articles[0].topic || slug;
    } else {
      // Fallback to Topic collection for backward compatibility
      const topicCollection = db.collection("Topic");
      const topic = await topicCollection.findOne({
        $or: [{ name: `${slug}_articles` }, { title: `${slug}_articles` }],
      });

      if (topic && topic.articles && topic.articles.length > 0) {
        articles = topic.articles.map((article) => ({
          ...article,
          _id: article._id ? article._id.toString() : null,
        }));

        // Sort articles by date (newest first)
        articles.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB - dateA;
        });

        topicTitle = topic.title || topic.name;
      }
    }

    if (!articles || articles.length === 0) {
      return new Response(JSON.stringify({ error: "Articles Not Found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(
      JSON.stringify({
        articles: articles.map((article) => ({
          ...article,
          id: article._id?.toString() || article._id,
        })),
        articleCount: articles.length,
        topicTitle: topicTitle,
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
      JSON.stringify({ error: "Failed to fetch articles", message: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
