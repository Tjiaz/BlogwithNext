import {
  ensureUnsubscribeToken,
  ELIGIBLE_SUBSCRIBER_FILTER,
  getNewsletterCollection,
  sendNewsletterMessage,
} from "@/lib/newsletter";
import clientPromise from "@/lib/mongodb";

interface ArticleData {
  title: string;
  description: string;
  slug: string;
  topic: string;
  author: string;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}

export async function notifySubscribersOfNewArticle(article: ArticleData): Promise<void> {
  try {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log("Newsletter email is not configured; skipping article announcement.");
      return;
    }

    const collection = await getNewsletterCollection();
    const subscribers = await collection.find(ELIGIBLE_SUBSCRIBER_FILTER).toArray();
    if (!subscribers.length) return;

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.azbytegems.com").replace(/\/$/, "");
    const campaign = encodeURIComponent(article.slug);
    const articleUrl = `${siteUrl}/${encodeURIComponent(article.slug)}?utm_source=newsletter&utm_medium=email&utm_campaign=${campaign}`;
    const title = escapeHtml(article.title);
    const description = escapeHtml(article.description || "Read the latest practical guide from AzByteGems.");
    const topic = escapeHtml(article.topic || "New tutorial");
    const author = escapeHtml(article.author || "AzByteGems");
    const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;line-height:1.6"><p style="color:#0a73b0;font-weight:bold">${topic}</p><h1>${title}</h1><p>${description}</p><p>By ${author}</p><p><a href="${articleUrl}" style="display:inline-block;background:#0a73b0;color:white;padding:12px 20px;border-radius:6px;text-decoration:none">Read the guide</a></p><p>[unsubscribe_link]</p></div>`;

    let sentCount = 0;
    let failedCount = 0;
    for (const subscriber of subscribers) {
      try {
        const unsubscribeToken = await ensureUnsubscribeToken(collection, subscriber);
        await sendNewsletterMessage({
          to: subscriber.email,
          subject: `New AzByteGems guide: ${article.title}`,
          html,
          text: `${article.title}\n\n${article.description}\n\nRead: ${articleUrl}`,
          unsubscribeToken,
        });
        sentCount++;
      } catch (error) {
        failedCount++;
        console.error("Failed to send article announcement:", error);
      }
    }

    const client = await clientPromise;
    await client.db("ARTICLES").collection("newsletter_logs").insertOne({
      type: "auto_notification",
      articleSlug: article.slug,
      articleTitle: article.title,
      sentAt: new Date(),
      totalSubscribers: subscribers.length,
      sentCount,
      failedCount,
    });
  } catch (error) {
    console.error("Failed to notify newsletter subscribers:", error);
  }
}
