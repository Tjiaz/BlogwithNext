// lib/mongo.js
import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL;

if (!uri) {
  throw new Error("Please define DATABASE_URL in your environment");
}

let client;
let db;

export async function getDb() {
  if (db) return db;

  if (!client) {
    client = new MongoClient(uri);
  }

  // Only connect if not already connected
  if (!client.topology || client.topology.isDestroyed()) {
    await client.connect();
  }

  db = client.db("ARTICLES"); // same DB name as before
  return db;
}
