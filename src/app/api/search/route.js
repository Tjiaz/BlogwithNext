// src/app/api/search/route.js
import { MongoClient } from "mongodb";

// ✅ Tell Next this is always dynamic (OK to use request/DB/etc.)
export const dynamic = "force-dynamic";

const uri = process.env.DATABASE_URL;
if (!uri) {
  // This will crash the API route at startup if not set,
  // so make sure DATABASE_URL exists in Vercel env vars.
  throw new Error("Please define DATABASE_URL in your environment");
}

// Reuse a single client between invocations (even in prod)
let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export async function GET(request) {
  try {
    // ✅ Use request.nextUrl instead of new URL(request.url)
    const { searchParams } = request.nextUrl;
    const rawQuery = searchParams.get("q") || "";
    const query = rawQuery.trim();

    const client = await clientPromise;
    const db = client.db("ARTICLES");
    const collection = db.collection("Topic");

    let results = [];
    if (query.length > 0) {
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

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Search error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch search results" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
