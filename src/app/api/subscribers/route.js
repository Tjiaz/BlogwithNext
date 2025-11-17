// app/api/subscribers/route.js
import { MongoClient } from "mongodb";

if (!process.env.DATABASE_URL) {
  throw new Error("Please add your MongoDB connection string to .env file");
}

const client = new MongoClient(process.env.DATABASE_URL);

async function connectToDatabase() {
  try {
    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
      console.log("Connected to database successfully");
    }
    return client.db("ARTICLES");
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
}

export async function GET() {
  try {
    console.log("Starting to fetch subscribers...");
    const db = await connectToDatabase();

    const subscribers = await db.collection("subscriptions").find().toArray();
    console.log("Found subscribers:", subscribers);

    // Log the response being sent
    const response = JSON.stringify(subscribers);
    console.log("Sending response:", response);

    return new Response(response, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch subscribers" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
