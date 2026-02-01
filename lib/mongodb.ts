import { MongoClient } from "mongodb";

if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is not set in .env");
}

// Global is used to preserve the client across hot reloads in dev
declare global {
  var _mongoClient: MongoClient | undefined;
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Optimized connection settings for Vercel (10s timeout limit on free tier)
// Aggressive timeouts to prevent Vercel function timeouts
const mongoOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: process.env.NODE_ENV === "development" ? 10000 : 3000, // Fast fail: 10s dev, 3s prod
  socketTimeoutMS: process.env.NODE_ENV === "development" ? 15000 : 8000, // Socket timeout: 15s dev, 8s prod
  connectTimeoutMS: process.env.NODE_ENV === "development" ? 10000 : 3000, // Connection timeout: 10s dev, 3s prod
  heartbeatFrequencyMS: 10000,
  retryWrites: true,
  retryReads: true,
};

if (process.env.NODE_ENV === "development") {
  // In development, reuse the client across hot reloads
  // Force recreation if client exists but connection failed (to pick up new timeout settings)
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(process.env.DATABASE_URL, mongoOptions);
    global._mongoClientPromise = global._mongoClient.connect();
  }
  client = global._mongoClient;
  clientPromise = global._mongoClientPromise!;
} else {
  // In production, reuse the client across function invocations
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(process.env.DATABASE_URL, mongoOptions);
    global._mongoClientPromise = global._mongoClient.connect();
  }
  client = global._mongoClient;
  clientPromise = global._mongoClientPromise!;
}

export default clientPromise;
