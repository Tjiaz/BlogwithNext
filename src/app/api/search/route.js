import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL;
if (!uri) {
  throw new Error("Please define DATABASE_URL in your .env.local file");
}

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  // Cache the client in dev mode to avoid creating many connections
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Always create a new client in production
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    const client = await clientPromise;
    const db = client.db("ARTICLES");
    const collection = db.collection("Topic");

    let results = [];
    if (query.trim().length > 0) {
      results = await collection
        .find(
          { $text: { $search: query } },
          {
            projection: {
              score: { $meta: "textScore" },
              _id: 1,
              title: 1,
              description: 1,
              date: 1,
              author: 1,
              topic: 1,
            },
          }
        )
        .sort({ score: { $meta: "textScore" } }) // rank by relevance
        .limit(30)
        .toArray();
    }

    return new Response(JSON.stringify(results), { status: 200 });
  } catch (error) {
    console.error("Search error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch search results" }),
      { status: 500 }
    );
  }
}
