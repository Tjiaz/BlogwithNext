import { MongoClient } from "mongodb";

// Create a global variable to cache the MongoDB client
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const uri = process.env.DATABASE_URL;

  if (!uri) {
    throw new Error("Please define DATABASE_URL environment variable");
  }

  // Validate connection string format
  if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
    throw new Error("Invalid MongoDB connection string format");
  }

  try {
    const client = new MongoClient(uri);
    await client.connect();
    cachedClient = client;
    return client;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export async function GET(req, { params }) {
  const { slug } = params;
  const databaseName = "ARTICLES";
  const collectionName = "Topic";
  // const collectionName = `${slug}_articles`;

  try {
    const client = await connectToDatabase();

    const db = client.db(databaseName);

    const collection = db.collection(collectionName);

    const topic = await collection.findOne({
      $or: [{ name: `${slug}_articles` }, { title: `${slug}_articles` }],
    });

    if (!topic || !topic.articles || topic.articles.length === 0) {
      console.error("No articles found.");
      return new Response(JSON.stringify({ error: "Articles Not Found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Ensure articles exist
    const articles = topic.articles || [];

    // Convert _id to string explicitly
    const articlesWithStringId = topic.articles.map((article) => ({
      ...article,
      _id: article._id ? article._id.toString() : null,
    }));

    console.log("Articles with string _id:", articlesWithStringId);

    // Sort articles by date (newest first)
    const sortedArticles = articlesWithStringId.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });

    console.log("Articles with string _id:", sortedArticles);

    return new Response(
      JSON.stringify({
        articles: sortedArticles,
        articleCount: articles.length,
        topicTitle: topic.title || topic.name,
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
    return new Response(JSON.stringify({ error: "Failed to fetch articles" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  // Remove the client.close() call since we're reusing the connection
}
