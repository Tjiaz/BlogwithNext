import nodemailer from "nodemailer";
import clientPromise from "@/lib/mongodb";

interface ArticleData {
  title: string;
  description: string;
  slug: string;
  topic: string;
  author: string;
}

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "465"),
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

const generateEmailHtml = (article: ArticleData, unsubscribeUrl: string) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "https://azbytegems.com";
  const articleUrl = `${siteUrl}/${article.slug}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Article: ${article.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center; background: linear-gradient(135deg, #0a73b0 0%, #2a9bd0 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">AzByteGems</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">New Article Published</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
                ${article.topic}
              </p>
              
              <h2 style="margin: 0 0 16px; color: #111827; font-size: 22px; font-weight: 700; line-height: 1.3;">
                ${article.title}
              </h2>
              
              <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                ${article.description}
              </p>
              
              <p style="margin: 0 0 24px; color: #6b7280; font-size: 14px;">
                By <strong>${article.author}</strong>
              </p>
              
              <a href="${articleUrl}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #0a73b0 0%, #2a9bd0 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Read Article →
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px;">
                You're receiving this because you subscribed to AzByteGems newsletter.
              </p>
              <a href="${unsubscribeUrl}" style="color: #0a73b0; font-size: 13px; text-decoration: underline;">
                Unsubscribe
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

export async function notifySubscribersOfNewArticle(article: ArticleData): Promise<void> {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log("📧 Email not configured, skipping subscriber notification");
      return;
    }

    const client = await clientPromise;
    const db = client.db("ARTICLES");
    const collection = db.collection("newsletter_subscribers");

    // Get all active subscribers
    const subscribers = await collection.find({ active: true }).toArray();

    if (subscribers.length === 0) {
      console.log("📧 No active subscribers to notify");
      return;
    }

    console.log(`📧 Notifying ${subscribers.length} subscribers of new article: ${article.title}`);

    const transporter = createTransporter();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "https://azbytegems.com";

    let sentCount = 0;
    let failedCount = 0;

    // Send emails to all subscribers
    for (const subscriber of subscribers) {
      try {
        const unsubscribeUrl = `${siteUrl}/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;
        const emailHtml = generateEmailHtml(article, unsubscribeUrl);

        await transporter.sendMail({
          from: process.env.EMAIL_FROM || "AzByteGems <azbytegems@gmail.com>",
          to: subscriber.email,
          subject: `New Article: ${article.title}`,
          html: emailHtml,
        });

        sentCount++;
      } catch (error) {
        console.error(`❌ Failed to notify ${subscriber.email}:`, error);
        failedCount++;
      }
    }

    // Log the notification
    await db.collection("newsletter_logs").insertOne({
      type: "auto_notification",
      articleSlug: article.slug,
      articleTitle: article.title,
      sentAt: new Date(),
      totalSubscribers: subscribers.length,
      sentCount,
      failedCount,
    });

    console.log(`📧 Notification complete: ${sentCount} sent, ${failedCount} failed`);
  } catch (error) {
    console.error("❌ Failed to notify subscribers:", error);
  }
}
