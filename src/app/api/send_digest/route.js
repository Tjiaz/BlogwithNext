// app/api/send-digest/route.js
import { PrismaClient } from "@prisma/client";
import { MongoClient } from "mongodb";
import { sendEmail } from "@/app/lib/email";
import { getTemplate } from "@/app/emailTemplates";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();
const uri = process.env.DATABASE_URL;
const mongoClient = new MongoClient(uri);

async function getTodaysArticles() {
  try {
    await mongoClient.connect();
    const collection = mongoClient.db("ARTICLES").collection("Topic");

    // Get today's date in the same format as your article dates
    const today = new Date();
    const todayString = today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Fetch all topics
    const topics = await collection.find().toArray();

    let featuredArticles = [];

    // Find articles published today
    topics.forEach((topic) => {
      if (Array.isArray(topic.articles)) {
        topic.articles.forEach((article) => {
          if (article.date === todayString) {
            featuredArticles.push({
              ...article,
              topic: topic.name,
              url: `${process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL}/article_details/${article._id.toString()}`,
            });
          }
        });
      }
    });

    // If no articles today, get the most recent articles
    if (featuredArticles.length === 0) {
      let allArticles = [];
      topics.forEach((topic) => {
        if (Array.isArray(topic.articles)) {
          allArticles = allArticles.concat(
            topic.articles.map((article) => ({
              ...article,
              topic: topic.name,
              url: `${process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL}/article_details/${article._id.toString()}`,
            }))
          );
        }
      });

      // Sort by date and take the 3 most recent
      allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
      featuredArticles = allArticles.slice(0, 3);
    }

    return featuredArticles.map((article) => ({
      title: article.title,
      author: article.author,
      publication: "AZbytegems",
      description: article.description,
      readTime: Math.ceil((article.content?.length || 0) / 1000) || 3,
      views: article.views || 0,
      claps: article.likes || 0,
      url: article.url,
      image:
        article.filtered_images?.[0] ||
        `${process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL}/azbyte.jpeg`,
    }));
  } catch (error) {
    console.error("Error fetching today's articles:", error);
    return [];
  } finally {
    await mongoClient.close();
  }
}

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

    // 2. Get today's articles
    const articles = await getTodaysArticles();

    if (articles.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No articles found for today's digest",
        })
      );
    }

    // 3. Send emails
    const results = [];
    for (const subscriber of subscribers) {
      try {
        const emailContent = getTemplate("digest", {
          name: subscriber.name || "Subscriber",
          articles,
          unsubscribeLink: `${process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?id=${subscriber.id}`,
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