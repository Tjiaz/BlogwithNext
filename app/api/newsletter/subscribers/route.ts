import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { isAdminEmail } from "@/lib/utils";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    if (!isAdminEmail(session.user.email)) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin only" },
        { status: 403 },
      );
    }

    const client = await clientPromise;
    const db = client.db("ARTICLES");
    const collection = db.collection("newsletter_subscribers");

    const subscribers = await collection
      .find({})
      .sort({ subscribedAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      subscribers: subscribers.map((sub) => ({
        _id: sub._id.toString(),
        email: sub.email,
        active: sub.active ?? true,
        subscribedAt: sub.subscribedAt,
      })),
    });
  } catch (error: any) {
    console.error("Failed to fetch subscribers:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
