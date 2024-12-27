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
  const collectionName = `${slug}_articles`;

  console.log("Received slug:", slug);

  try {
    const client = await connectToDatabase();
    console.log("Connected to MongoDB successfully.");

    const db = client.db(databaseName);
    console.log(`Using database: ${databaseName}`);

    const collection = db.collection(collectionName);
    console.log(`Fetching from collection: ${collectionName}`);

    const articles = await collection.find().toArray();
    console.log("Fetched articles:", articles);

    // Convert _id to string explicitly
    const articlesWithStringId = articles.map((article) => ({
      ...article,
      _id: article._id.toString(),
    }));

    console.log("Articles with string _id:", articlesWithStringId);

    if (!articlesWithStringId || articlesWithStringId.length === 0) {
      console.error("No articles found.");
      return new Response(JSON.stringify({ error: "Articles Not Found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(JSON.stringify(articlesWithStringId), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
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
