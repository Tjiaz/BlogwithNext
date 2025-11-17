// app/api/send-newsletter/route.js
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import prisma from "@/utils/connect";

// app/api/send-newsletter/route.js
export async function POST(request) {
  try {
    const { subject, content } = await request.json();
    console.log("Received request:", { subject, content });

    const subscribers = await prisma.subscriber.findMany({
      where: { active: true },
      select: { email: true },
    });
    console.log("Found subscribers:", subscribers);

    const subscriberEmails = subscribers.map((sub) => sub.email);
    console.log("Sending to emails:", subscriberEmails);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Send test email first
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_USER, // Send to yourself first
        subject: `TEST - ${subject}`,
        html: content,
      });
      console.log("Test email sent successfully");
    } catch (error) {
      console.error("Test email failed:", error);
      throw error;
    }

    // Then send to all subscribers
    const emailPromises = subscriberEmails.map(async (email) => {
      try {
        const info = await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: email,
          subject: subject,
          html: content,
        });
        console.log("Email sent to", email, ":", info.response);
        return info;
      } catch (error) {
        console.error("Failed to send to", email, ":", error);
        throw error;
      }
    });

    const results = await Promise.all(emailPromises);
    console.log("All emails sent:", results);

    return NextResponse.json({
      message: "Newsletter sent successfully",
      recipientCount: subscriberEmails.length,
    });
  } catch (error) {
    console.error("Newsletter sending error:", error);
    return NextResponse.json(
      {
        error: "Failed to send newsletter",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
