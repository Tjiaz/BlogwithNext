import prisma from "./connect";
import { connectToDatabase } from "./mongodb";
import { sendEmail } from "@/app/lib/email";
import { newArticleTemplate } from "@/app/emailTemplates/newArticle";

/**
 * Notify all subscribers about a new article
 * @param {Object} article - Article object with id, title, description, author, topic, date, filtered_images
 */
export async function notifySubscribersAboutNewArticle(article) {
  try {
    console.log("[notifySubscribers] Starting notification process for article:", article.title);
    
    // Get subscribers from both Prisma and MongoDB
    const [prismaSubscribers, mongoSubscribers] = await Promise.all([
      // Get subscribers from Prisma
      prisma.subscriber.findMany({
        where: { active: true },
        select: { email: true },
      }).catch(() => {
        console.warn("[notifySubscribers] Failed to fetch Prisma subscribers, continuing...");
        return [];
      }),
      
      // Get subscribers from MongoDB
      (async () => {
        try {
          const { db } = await connectToDatabase();
          const subscribers = await db.collection("subscriptions")
            .find({ active: { $ne: false } })
            .toArray();
          return subscribers.map(sub => ({ email: sub.email }));
        } catch (error) {
          console.warn("[notifySubscribers] Failed to fetch MongoDB subscribers, continuing...");
          return [];
        }
      })(),
    ]);

    // Combine and deduplicate subscribers
    const allSubscribers = [...prismaSubscribers, ...mongoSubscribers];
    const uniqueEmails = new Set();
    const uniqueSubscribers = [];

    allSubscribers.forEach(sub => {
      if (sub.email && !uniqueEmails.has(sub.email.toLowerCase())) {
        uniqueEmails.add(sub.email.toLowerCase());
        uniqueSubscribers.push(sub.email);
      }
    });

    console.log(`[notifySubscribers] Found ${uniqueSubscribers.length} unique subscribers`);

    if (uniqueSubscribers.length === 0) {
      console.log("[notifySubscribers] No subscribers to notify");
      return { success: true, notified: 0, errors: [] };
    }

    // Prepare email content
    const emailHtml = newArticleTemplate(article);
    const subject = `New Article: ${article.title}`;

    // Send emails in batches to avoid overwhelming the email server
    const batchSize = 10;
    const errors = [];
    let successCount = 0;

    for (let i = 0; i < uniqueSubscribers.length; i += batchSize) {
      const batch = uniqueSubscribers.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (email) => {
        try {
          await sendEmail({
            to: email,
            subject: subject,
            html: emailHtml,
          });
          console.log(`[notifySubscribers] Email sent successfully to ${email}`);
          return { email, success: true };
        } catch (error) {
          console.error(`[notifySubscribers] Failed to send email to ${email}:`, error.message);
          return { email, success: false, error: error.message };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(result => {
        if (result.success) {
          successCount++;
        } else {
          errors.push({ email: result.email, error: result.error });
        }
      });

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < uniqueSubscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`[notifySubscribers] Notification complete: ${successCount} successful, ${errors.length} failed`);

    return {
      success: true,
      notified: successCount,
      total: uniqueSubscribers.length,
      errors: errors,
    };
  } catch (error) {
    console.error("[notifySubscribers] Error notifying subscribers:", error);
    return {
      success: false,
      notified: 0,
      errors: [{ error: error.message }],
    };
  }
}
