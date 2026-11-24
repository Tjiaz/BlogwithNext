import { NextResponse } from "next/server";
import {
  ensureUnsubscribeToken,
  getNewsletterCollection,
  hashEmailToken,
  sendNewsletterMessage,
} from "@/lib/newsletter";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    if (!token || token.length > 200) return NextResponse.json({ success: false, error: "Invalid confirmation link." }, { status: 400 });
    const collection = await getNewsletterCollection();
    const tokenHash = hashEmailToken(token);
    const subscriber = await collection.findOne({ confirmationTokenHash: tokenHash, confirmationExpiresAt: { $gt: new Date() } });
    if (!subscriber) return NextResponse.json({ success: false, error: "This confirmation link is invalid or expired. Please subscribe again." }, { status: 400 });
    const result = await collection.updateOne(
      { _id: subscriber._id, confirmationTokenHash: tokenHash, confirmationExpiresAt: { $gt: new Date() } },
      {
        $set: { active: true, status: "active", confirmedAt: new Date(), subscribedAt: new Date() },
        $unset: { confirmationTokenHash: "", confirmationExpiresAt: "" },
      },
    );
    if (!result.modifiedCount) return NextResponse.json({ success: false, error: "This confirmation link is invalid or expired. Please subscribe again." }, { status: 400 });

    try {
      const unsubscribeToken = await ensureUnsubscribeToken(collection, subscriber);
      const siteUrl = process.env.NODE_ENV === "development"
        ? new URL(_req.url).origin
        : (process.env.NEXT_PUBLIC_SITE_URL || "https://www.azbytegems.com").replace(/\/$/, "");
      await sendNewsletterMessage({
        to: subscriber.email,
        subject: "Welcome to AzByteGems",
        html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;line-height:1.6"><h1>You’re subscribed</h1><p>Thanks for confirming. We’ll email you when new practical Python, data science, and AI guides are published.</p><p>Explore <a href="${siteUrl}/topics">all topics</a> or browse the <a href="${siteUrl}/resources">developer resources</a>.</p></div>`,
        text: `Thanks for confirming. We’ll email you when new practical Python, data science, and AI guides are published. Explore topics at ${siteUrl}/topics.`,
        unsubscribeToken,
        siteUrl,
      });
    } catch (welcomeError) {
      console.error("Subscription confirmed, but welcome email could not be sent:", welcomeError);
    }
    return NextResponse.json({ success: true, message: "Your subscription is confirmed. Welcome to AzByteGems!" });
  } catch (error) {
    console.error("Failed to confirm newsletter subscription:", error);
    return NextResponse.json({ success: false, error: "Could not confirm your subscription right now." }, { status: 500 });
  }
}
