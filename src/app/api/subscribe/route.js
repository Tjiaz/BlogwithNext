// app/api/subscribe/route.js
import { MongoClient } from "mongodb";

if (!process.env.DATABASE_URL) {
  throw new Error("Please add your MongoDB connection string to .env file");
}

const client = new MongoClient(process.env.DATABASE_URL);

async function connectToDatabase() {
  try {
    if (!client.topology || !client.topology.isConnected()) {
      console.log("Connecting to database...");
      await client.connect();
      console.log("Connected to database successfully");
    }
    return client.db("ARTICLES");
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
}

export async function POST(req) {
  try {
    console.log("Received subscription request");
    const body = await req.json();
    const { email } = body;

    console.log("Email received:", email);

    // Validate email
    if (!email || !email.includes("@")) {
      console.log("Invalid email:", email);
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Connect to the database
    const db = await connectToDatabase();

    // Check if email already exists
    const existingSubscriber = await db
      .collection("subscriptions")
      .findOne({ email });

    if (existingSubscriber) {
      console.log("Email already subscribed:", email);
      return new Response(
        JSON.stringify({ message: "You're already subscribed!" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Insert email into the subscriptions collection
    const result = await db.collection("subscriptions").insertOne({
      email,
      subscribedAt: new Date(),
      active: true,
    });

    console.log("Subscription saved:", result);

    // Return a success response
    return new Response(
      JSON.stringify({ message: "Subscription successful!" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error saving subscription:", error);
    return new Response(
      JSON.stringify({ error: "Failed to save subscription" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
