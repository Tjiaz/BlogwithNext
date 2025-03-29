// app/services/dailyDigest.js
import { getTemplate } from "../emailTemplates";
import { sendEmail } from "../../../utils/email"; // Assuming you have an email sending utility
import fetch from "node-fetch";
import prisma from "../../../prisma/client";

async function getSubscribers() {
  try {
    console.log("Fetching subscribers from database...");

    // Fetch only active subscribers using Prisma
    const subscribers = await prisma.subscriber.findMany({
      where: {
        active: true,
      },
      select: {
        email: true,
        // Add other fields you might need (like name if you add it later)
      },
    });

    console.log(`Found ${subscribers.length} active subscribers`);
    return subscribers;
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    throw error;
  }
}

export async function sendDailyDigest() {
  try {
    console.log("Preparing daily digest...");

    // 1. Fetch today's featured articles
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DOMAIN}/api/featured-articles`
    );
    if (!response.ok) throw new Error("Failed to fetch articles");

    const articles = await response.json();

    if (!articles || articles.length === 0) {
      console.log("No articles found for today's digest");
      return { success: false, message: "No articles found" };
    }

    // 2. Fetch all subscribers
    const subscribers = await getSubscribers();
    if (!subscribers.length) {
      console.log("No subscribers found");
      return { success: false, message: "No subscribers found" };
    }

    // 3. Send to all subscribers
    const results = [];
    for (const subscriber of subscribers) {
      try {
        // Prepare email content
        const emailContent = getTemplate("digest", {
          name: subscriber.name || "Subscriber",
          articles: articles.map((article) => ({
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
              "https://azbytegems.com/default-article-image.jpg",
          })),
          unsubscribeLink: `${
            process.env.NEXT_PUBLIC_DOMAIN
          }/unsubscribe?email=${encodeURIComponent(subscriber.email)}`,
        });

        // Send email
        await sendEmail({
          to: subscriber.email,
          subject: "AZbytegems Daily Digest",
          html: emailContent,
        });

        results.push({ email: subscriber.email, status: "success" });
      } catch (error) {
        console.error(`Error sending to ${subscriber.email}:`, error);
        results.push({
          email: subscriber.email,
          status: "failed",
          error: error.message,
        });
      }
    }

    console.log(`Digest sending completed. Results:`, results);
    return {
      success: true,
      message: `Digest sent to ${
        results.filter((r) => r.status === "success").length
      } subscribers`,
      results,
    };
  } catch (error) {
    console.error("Error in sendDailyDigest:", error);
    return { success: false, error: error.message };
  }
}
