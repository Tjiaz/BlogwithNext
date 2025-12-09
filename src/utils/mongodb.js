import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL;

// Global connection cache
let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 10, // Maintain up to 10 socket connections
    minPoolSize: 2, // Maintain at least 2 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  });

  await client.connect();
  const db = client.db("ARTICLES");

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

