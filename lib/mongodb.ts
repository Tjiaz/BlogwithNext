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

// Optimized connection settings for faster timeouts and better performance
// Use longer timeouts in development, shorter in production
const mongoOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: process.env.NODE_ENV === "development" ? 15000 : 5000, // Longer timeout in dev (15s), shorter in prod (5s)
  socketTimeoutMS: 10000, // Reduce socket timeout from 45s to 10s
  connectTimeoutMS: process.env.NODE_ENV === "development" ? 10000 : 5000, // Longer timeout in dev
  heartbeatFrequencyMS: 10000,
  retryWrites: true,
  retryReads: true,
};

if (process.env.NODE_ENV === "development") {
  // In development, reuse the client across hot reloads
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
