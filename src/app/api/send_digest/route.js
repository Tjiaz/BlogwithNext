// app/api/send-digest/route.js
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "@/lib/email";
import { digestTemplate } from "@/emailTemplates/digest";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 1. Get active subscribers
    const subscribers = await prisma.subscriber.findMany({
      where: { active: true },
    });

    if (subscribers.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No active subscribers found",
        })
      );
    }

    // 2. Get today's articles (implement your logic here)
    const articles = await getTodaysArticles();

    // 3. Send emails
    const results = [];
    for (const subscriber of subscribers) {
      try {
        const emailContent = digestTemplate({
          name: subscriber.name || "Subscriber",
          articles,
          unsubscribeLink: `${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?id=${subscriber.id}`,
        });

        await sendEmail({
          to: subscriber.email,
          subject: "Your Daily Digest",
          html: emailContent,
        });

        results.push({ email: subscriber.email, status: "success" });
      } catch (error) {
        results.push({
          email: subscriber.email,
          status: "failed",
          error: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sentCount: results.filter((r) => r.status === "success").length,
        failedCount: results.filter((r) => r.status === "failed").length,
        results,
      })
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}


////

// To Deploy This:
// Set up a cron job (on Vercel, AWS, etc.) to hit your endpoint daily:

// 1.https://yourdomain.com/api/send-digest

//2.Add authentication to protect the endpoint:

//-------Add this to your route----------
// export const dynamic = 'force-dynamic'; // Required for cron jobs

// export async function GET(request) {
//   const authHeader = request.headers.get('authorization');
//   if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
//     return new Response('Unauthorized', { status: 401 });
//   }
//   ----------// ... rest of your code
// }

// 3.Environment variables:

// env
// Copy
// CRON_SECRET=your-secret-key-here
// DATABASE_URL=your-prisma-connection-string
// EMAIL_* # Your existing email config
// /////