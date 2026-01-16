// app/api/subscribers/route.js
import { MongoClient } from "mongodb";
import prisma from "@/utils/connect";
import { connectToDatabase } from "@/utils/mongodb";

if (!process.env.DATABASE_URL) {
  throw new Error("Please add your MongoDB connection string to .env file");
}

export async function GET() {
  try {
    console.log("Starting to fetch subscribers...");
    
    // Get subscribers from both Prisma and MongoDB
    const [prismaSubscribers, mongoSubscribers] = await Promise.all([
      // Get subscribers from Prisma
      prisma.subscriber.findMany({
        where: { active: true },
        select: { email: true, createdAt: true, active: true },
      }).catch(() => {
        console.warn("Failed to fetch Prisma subscribers, continuing...");
        return [];
      }),
      
      // Get subscribers from MongoDB
      (async () => {
        try {
          const { db } = await connectToDatabase();
          const subscribers = await db.collection("subscriptions")
            .find({ active: { $ne: false } })
            .toArray();
          return subscribers.map(sub => ({
            email: sub.email,
            createdAt: sub.subscribedAt || sub.createdAt,
            active: sub.active !== false,
          }));
        } catch (error) {
          console.warn("Failed to fetch MongoDB subscribers, continuing...");
          return [];
        }
      })(),
    ]);

    // Combine and deduplicate subscribers
    const allSubscribers = [...prismaSubscribers, ...mongoSubscribers];
    const uniqueEmails = new Set();
    const uniqueSubscribers = [];

    allSubscribers.forEach(sub => {
      if (sub.email && !uniqueEmails.has(sub.email.toLowerCase())) {
        uniqueEmails.add(sub.email.toLowerCase());
        uniqueSubscribers.push(sub);
      }
    });

    console.log(`Found ${uniqueSubscribers.length} unique subscribers`);

    return new Response(JSON.stringify(uniqueSubscribers), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch subscribers" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
