import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL;

if (!uri) {
  throw new Error("Please add your MongoDB connection string to the DATABASE_URL environment variable");
}

// Global connection cache
let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  // Check if we have a cached connection and if it's still connected
  if (cachedClient && cachedDb) {
    try {
      // Ping the database to check if connection is still alive
      await cachedDb.admin().ping();
      return { client: cachedClient, db: cachedDb };
    } catch (error) {
      // Connection is dead, clear cache and reconnect
      console.warn("Cached MongoDB connection is dead, reconnecting...", error);
      cachedClient = null;
      cachedDb = null;
    }
  }

  try {
    const client = new MongoClient(uri, {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 2, // Maintain at least 2 socket connections
      serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 10000, // Give initial connection 10 seconds
      retryWrites: true,
      retryReads: true,
    });

    await client.connect();
    const db = client.db("ARTICLES");

    // Verify connection by pinging
    await db.admin().ping();

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    // Clear cache on error
    cachedClient = null;
    cachedDb = null;
    throw error;
  }
}

