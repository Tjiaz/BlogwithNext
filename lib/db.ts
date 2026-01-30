import mongoose from "mongoose";

const MONGO_URI =
  process.env.DATABASE_URL || "mongodb://localhost:27017/ARTICLES";

if (!MONGO_URI) {
  throw new Error(
    "Please define the DATABASE_URL environment variable inside .env.local"
  );
}

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: GlobalMongoose | undefined;
}

const cached: GlobalMongoose = global.mongoose || { conn: null, promise: null };

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGO_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Auto-disconnect in development to prevent connection leaks
if (process.env.NODE_ENV === "development") {
  process.on("beforeExit", async () => {
    if (cached.conn) {
      await cached.conn.disconnect();
    }
  });
}
