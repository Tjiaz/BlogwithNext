import { NextResponse } from "next/server";
import { getNewsletterCollection, hashEmailToken } from "@/lib/newsletter";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    if (!token || token.length > 200) return NextResponse.json({ success: false, error: "Invalid unsubscribe link." }, { status: 400 });
    const collection = await getNewsletterCollection();
    const result = await collection.updateOne(
      { unsubscribeTokenHashes: hashEmailToken(token) },
      {
        $set: { active: false, status: "unsubscribed", unsubscribedAt: new Date() },
        $unset: { unsubscribeTokenHashes: "" },
      },
    );
    // Idempotent response also handles providers retrying one-click unsubscribe.
    return NextResponse.json({ success: true, message: result.modifiedCount ? "You have been unsubscribed." : "This address is already unsubscribed." });
  } catch (error) {
    console.error("Failed to unsubscribe:", error);
    return NextResponse.json({ success: false, error: "Could not process your request right now." }, { status: 500 });
  }
}
