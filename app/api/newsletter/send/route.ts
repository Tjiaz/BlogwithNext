import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { isAdminEmail } from "@/lib/utils";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
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

    const { subject, content } = await req.json();

    if (!subject || !content) {
      return NextResponse.json(
        { success: false, error: "Subject and content are required" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("ARTICLES");
    const collection = db.collection("newsletter_subscribers");

    // Get all active subscribers
    const subscribers = await collection.find({ active: true }).toArray();

    if (subscribers.length === 0) {
      return NextResponse.json(
        { success: false, error: "No active subscribers found" },
        { status: 400 },
      );
    }

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "465"),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Replace unsubscribe links in content
    const processedContent = content.replace(
      /\[unsubscribe_link\]/g,
      () => {
        // In a real implementation, you'd generate unique unsubscribe links
        return `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe?email=[email]`;
      },
    );

    let sentCount = 0;
    const errors: string[] = [];

    // Send emails to all subscribers
    for (const subscriber of subscribers) {
      try {
        // Replace [email] placeholder with actual email for unsubscribe link
        const emailContent = processedContent.replace(
          /\[email\]/g,
          encodeURIComponent(subscriber.email),
        );

        await transporter.sendMail({
          from:
            process.env.EMAIL_FROM ||
            "AzByteGems Newsletter <azbytegems@gmail.com>",
          to: subscriber.email,
          subject: subject,
          html: emailContent,
        });

        sentCount++;
      } catch (error: any) {
        console.error(`Failed to send email to ${subscriber.email}:`, error);
        errors.push(subscriber.email);
      }
    }

    // Log newsletter send
    await db.collection("newsletter_logs").insertOne({
      sentBy: session.user.email,
      subject,
      sentAt: new Date(),
      totalSubscribers: subscribers.length,
      sentCount,
      failedCount: errors.length,
      failedEmails: errors,
    });

    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Failed to send newsletter:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
