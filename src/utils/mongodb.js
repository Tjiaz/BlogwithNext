import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL;

if (!uri) {
  throw new Error(
    "Please add your MongoDB connection string to the DATABASE_URL environment variable"
  );
}

// Global connection cache
let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  // Check if we have a cached connection and verify it's still alive
  if (cachedClient && cachedDb) {
    try {
      // Quick health check - ping the server
      await cachedClient.db("admin").command({ ping: 1 });
      return { client: cachedClient, db: cachedDb };
    } catch (error) {
      // Connection is dead, clear cache and reconnect
      console.log("[mongodb] Cached connection is dead, reconnecting...");
      cachedClient = null;
      cachedDb = null;
    }
  }

  try {
    const client = new MongoClient(uri, {
      maxPoolSize: 10, // Increased pool size
      minPoolSize: 1, // Maintain at least 1 connection
      serverSelectionTimeoutMS: 30000, // Increased to 30 seconds for slow networks
      socketTimeoutMS: 45000, // Increased socket timeout to 45 seconds
      connectTimeoutMS: 30000, // Increased connection timeout to 30 seconds
      retryWrites: true,
      retryReads: true,
      // Add these for better performance
      directConnection: false,
      maxIdleTimeMS: 30000,
      heartbeatFrequencyMS: 10000, // Check connection health every 10 seconds
    });

    // Connect with longer timeout
    await Promise.race([
      client.connect(),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Connection timeout after 30 seconds")),
          30000
        )
      ),
    ]);

    const db = client.db("ARTICLES");

    // Verify connection works by pinging
    await client.db("admin").command({ ping: 1 });
    console.log("[mongodb] Successfully connected to MongoDB");

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error("[mongodb] Failed to connect to MongoDB:", error.message);
    // Clear cache on error
    cachedClient = null;
    cachedDb = null;
    throw error;
  }
}
