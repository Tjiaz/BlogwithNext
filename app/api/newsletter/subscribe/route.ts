import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid email is required" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("ARTICLES");
    const collection = db.collection("newsletter_subscribers");

    // Check if email already exists
    const existing = await collection.findOne({ email: email.toLowerCase() });

    if (existing) {
      if (existing.active) {
        return NextResponse.json(
          { success: false, error: "Email already subscribed" },
          { status: 400 },
        );
      } else {
        // Reactivate subscription
        await collection.updateOne(
          { email: email.toLowerCase() },
          {
            $set: {
              active: true,
              subscribedAt: new Date(),
            },
          },
        );
        return NextResponse.json({
          success: true,
          message: "Subscription reactivated",
        });
      }
    }

    // Create new subscription
    await collection.insertOne({
      email: email.toLowerCase(),
      active: true,
      subscribedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to newsletter",
    });
  } catch (error: any) {
    console.error("Failed to subscribe:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
