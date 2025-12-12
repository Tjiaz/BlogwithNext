import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL;

if (!uri) {
  throw new Error("Please add your MongoDB connection string to the DATABASE_URL environment variable");
}

// Global connection cache
let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  // Check if we have a cached connection (skip ping to save time)
  if (cachedClient && cachedDb) {
    // Return cached connection immediately without ping check
    // The connection will fail naturally if it's dead, and we'll reconnect then
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = new MongoClient(uri, {
      maxPoolSize: 5, // Reduced pool size for faster connection
      minPoolSize: 0, // Don't maintain minimum connections (saves time)
      serverSelectionTimeoutMS: 5000, // Reduced to 5 seconds
      socketTimeoutMS: 10000, // Reduced socket timeout
      connectTimeoutMS: 5000, // Reduced connection timeout to 5 seconds
      retryWrites: true,
      retryReads: true,
      // Add these for better performance
      directConnection: false,
      maxIdleTimeMS: 30000,
    });

    // Connect with timeout
    await Promise.race([
      client.connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      )
    ]);

    const db = client.db("ARTICLES");

    // Skip ping check to save time - connection will fail naturally if needed
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

