import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { isAdminEmail } from "@/lib/utils";
import {
  ensureUnsubscribeToken,
  ELIGIBLE_SUBSCRIBER_FILTER,
  getNewsletterCollection,
  sendNewsletterMessage,
} from "@/lib/newsletter";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    if (!isAdminEmail(session.user.email)) return NextResponse.json({ success: false, error: "Forbidden - Admin only" }, { status: 403 });

    const { subject, content } = await req.json();
    if (typeof subject !== "string" || !subject.trim() || typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ success: false, error: "Subject and content are required" }, { status: 400 });
    }

    const collection = await getNewsletterCollection();
    const subscribers = await collection.find(ELIGIBLE_SUBSCRIBER_FILTER).toArray();
    if (!subscribers.length) return NextResponse.json({ success: false, error: "No active subscribers found" }, { status: 400 });

    let sentCount = 0;
    const failedEmails: string[] = [];
    for (const subscriber of subscribers) {
      try {
        const unsubscribeToken = await ensureUnsubscribeToken(collection, subscriber);
        await sendNewsletterMessage({
          to: subscriber.email,
          subject: subject.trim(),
          html: content,
          unsubscribeToken,
        });
        sentCount++;
      } catch (error) {
        console.error("Failed to send newsletter to a subscriber:", error);
        failedEmails.push(subscriber.email);
      }
    }

    const client = await clientPromise;
    await client.db("ARTICLES").collection("newsletter_logs").insertOne({
      sentBy: session.user.email,
      subject: subject.trim(),
      sentAt: new Date(),
      totalSubscribers: subscribers.length,
      sentCount,
      failedCount: failedEmails.length,
      failedEmails,
    });

    return NextResponse.json({ success: true, sent: sentCount, failed: failedEmails.length });
  } catch (error) {
    console.error("Failed to send newsletter:", error);
    return NextResponse.json({ success: false, error: "Failed to send newsletter." }, { status: 500 });
  }
}
