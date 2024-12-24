import { MongoClient } from "mongodb";


// Ensure the DATABASE_URL environment variable is set
if (!process.env.DATABASE_URL) {
  throw new Error("Please add your MongoDB connection string to .env file");
}

const client = new MongoClient(process.env.DATABASE_URL);

async function connectToDatabase() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db("ARTICLES");
}

export async function POST(req) {
  try {
    const body = await req.json(); // Parse the request body
    const { email } = body;

    // Validate email
    if (!email || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Connect to the database
    const db = await connectToDatabase();

    // Insert email into the subscriptions collection
    await db.collection("subscriptions").insertOne({ email });

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

export async function GET(req) {
  return new Response(
    JSON.stringify({ message: "This route only supports POST requests" }),
    {
      status: 405,
      headers: { "Content-Type": "application/json" },
    }
  );
}
