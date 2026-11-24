import { NextResponse } from "next/server";
import { ObjectId, type Document } from "mongodb";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { supabase } from "@/lib/supabase";
import { isAdminEmail } from "@/lib/utils";
import {
  ensureUnsubscribeToken,
  ELIGIBLE_SUBSCRIBER_FILTER,
  getNewsletterCollection,
  sendNewsletterMessage,
} from "@/lib/newsletter";
import {
  NewsletterTemplateError,
  renderNewsletterTemplate,
  type NewsletterArticle,
  type NewsletterTemplateSubscriber,
} from "@/lib/newsletter-template";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.azbytegems.com").replace(/\/$/, "");

function getSubscriberTemplateContext(subscriber: Document): NewsletterTemplateSubscriber {
  return {
    email: typeof subscriber.email === "string" ? subscriber.email : "",
    name: typeof subscriber.name === "string" ? subscriber.name : undefined,
    firstName: typeof subscriber.firstName === "string" ? subscriber.firstName : undefined,
  };
}

async function getDigestArticles(): Promise<NewsletterArticle[]> {
  const { data, error } = await supabase
    .from("final_articles")
    .select("id, slug, title, description, excerpt, topic, category, author, author_name, views, likes, reading_time")
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(3);

  if (error) {
    console.error("Failed to load newsletter digest articles:", error.message);
    throw new Error("Could not load articles for the newsletter digest.");
  }

  return (data || []).map((article: any) => {
    const slug = String(article.slug || article.id);
    const readingTime = String(article.reading_time || "5 min read").replace(/\s*(?:minutes?|mins?)?\s*read\s*$/i, "").trim() || "5";
    const articleUrl = `${SITE_URL}/${encodeURIComponent(slug)}?utm_source=newsletter&utm_medium=email&utm_campaign=weekly_digest`;
    return {
      title: article.title || "Untitled guide",
      slug,
      description: article.description || article.excerpt || "Read the latest practical guide from AzByteGems.",
      author: article.author || article.author_name || "AzByteGems",
      publication: article.topic || article.category || "AzByteGems",
      readTime: readingTime,
      views: Number(article.views) || 0,
      claps: Number(article.likes) || 0,
      url: articleUrl,
    };
  });
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    if (!isAdminEmail(session.user.email)) return NextResponse.json({ success: false, error: "Forbidden - Admin only" }, { status: 403 });

    const body = await req.json();
    const { subject, content } = body;
    const isTest = body.mode === "test";
    if (typeof subject !== "string" || !subject.trim() || typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ success: false, error: "Subject and content are required" }, { status: 400 });
    }

    const articles = /{{\s*#articles\s*}}/.test(content) ? await getDigestArticles() : [];
    const adminSubscriber = { email: session.user.email.trim().toLowerCase() };

    if (body.mode === "preview") {
      const renderedSubject = renderNewsletterTemplate(subject.trim(), adminSubscriber, articles);
      let renderedContent = renderNewsletterTemplate(content, adminSubscriber, articles);
      const previewUnsubscribe = '<a href="#unsubscribe-preview">Unsubscribe</a>';
      renderedContent = renderedContent.includes("[unsubscribe_link]")
        ? renderedContent.replaceAll("[unsubscribe_link]", previewUnsubscribe)
        : `${renderedContent}<p style="font-size:13px;color:#666">You’re receiving this because you subscribed to AzByteGems. ${previewUnsubscribe}</p>`;
      return NextResponse.json({ success: true, preview: { subject: renderedSubject, content: renderedContent } });
    }

    if (isTest) {
      const testRecipient = adminSubscriber.email;
      const renderedSubject = renderNewsletterTemplate(subject.trim(), { email: testRecipient }, articles);
      const renderedContent = renderNewsletterTemplate(content, { email: testRecipient }, articles);
      await sendNewsletterMessage({
        to: testRecipient,
        subject: `[TEST] ${renderedSubject}`,
        html: renderedContent,
        testMessage: true,
      });
      return NextResponse.json({ success: true, sent: 1, test: true });
    }

    const collection = await getNewsletterCollection();
    const requestedIds = body.subscriberIds;
    let subscribers;
    if (requestedIds !== undefined) {
      if (!Array.isArray(requestedIds) || requestedIds.length === 0 || requestedIds.length > 1000 || requestedIds.some((id) => typeof id !== "string" || !ObjectId.isValid(id))) {
        return NextResponse.json({ success: false, error: "Select at least one valid active subscriber." }, { status: 400 });
      }
      const uniqueIds = [...new Set(requestedIds as string[])];
      subscribers = await collection.find({
        ...ELIGIBLE_SUBSCRIBER_FILTER,
        _id: { $in: uniqueIds.map((id) => new ObjectId(id)) },
      }).toArray();
      if (subscribers.length !== uniqueIds.length) {
        return NextResponse.json({ success: false, error: "One or more selected subscribers are no longer eligible. Refresh the subscriber list and try again." }, { status: 400 });
      }
    } else {
      subscribers = await collection.find(ELIGIBLE_SUBSCRIBER_FILTER).toArray();
    }

    if (!subscribers.length) return NextResponse.json({ success: false, error: "No active subscribers found" }, { status: 400 });

    // Validate all template tags before sending to anyone, avoiding partial campaigns on a typo.
    try {
      const firstSubscriber = getSubscriberTemplateContext(subscribers[0]);
      renderNewsletterTemplate(subject.trim(), firstSubscriber, articles);
      renderNewsletterTemplate(content, firstSubscriber, articles);
    } catch (error) {
      if (error instanceof NewsletterTemplateError) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      throw error;
    }

    let sentCount = 0;
    const failedEmails: string[] = [];
    for (const subscriber of subscribers) {
      try {
        const unsubscribeToken = await ensureUnsubscribeToken(collection, subscriber);
        const templateSubscriber = getSubscriberTemplateContext(subscriber);
        await sendNewsletterMessage({
          to: subscriber.email,
          subject: renderNewsletterTemplate(subject.trim(), templateSubscriber, articles),
          html: renderNewsletterTemplate(content, templateSubscriber, articles),
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
    if (error instanceof NewsletterTemplateError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    if (error instanceof Error && error.message === "Could not load articles for the newsletter digest.") {
      return NextResponse.json({ success: false, error: error.message }, { status: 502 });
    }
    return NextResponse.json({ success: false, error: "Failed to send newsletter." }, { status: 500 });
  }
}
