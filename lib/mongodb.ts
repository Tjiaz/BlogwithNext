import { MongoClient } from "mongodb";

if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is not set in .env");
}

// Global is used to preserve the client across hot reloads in dev
declare global {
  var _mongoClient: MongoClient | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(process.env.DATABASE_URL);
  }
  client = global._mongoClient;
  clientPromise = client.connect();
} else {
  client = new MongoClient(process.env.DATABASE_URL);
  clientPromise = client.connect();
}

export default clientPromise;
