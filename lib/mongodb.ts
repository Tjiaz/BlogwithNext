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
const mongoOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 3000, // Fail faster if server is unreachable
  socketTimeoutMS: 10000, // Reduce socket timeout from 45s to 10s
  connectTimeoutMS: 5000, // Connection timeout
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
