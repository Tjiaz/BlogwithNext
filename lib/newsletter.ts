import { createHash, randomBytes } from "node:crypto";
import nodemailer from "nodemailer";
import type { Collection, Document } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { NEWSLETTER_CONSENT_VERSION } from "@/lib/newsletter-constants";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.azbytegems.com").replace(/\/$/, "");

export const ELIGIBLE_SUBSCRIBER_FILTER = {
  active: true,
  $or: [{ confirmedAt: { $exists: true } }, { legacyConsentReviewed: true }],
};

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

export function createEmailToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: createHash("sha256").update(token).digest("hex") };
}

export function hashEmailToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function getNewsletterCollection(): Promise<Collection<Document>> {
  const client = await clientPromise;
  return client.db("ARTICLES").collection("newsletter_subscribers");
}

function getTransporter() {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error("Newsletter email is not configured. Set EMAIL_HOST, EMAIL_USER, and EMAIL_PASSWORD.");
  }
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 465),
    secure: Number(process.env.EMAIL_PORT || 465) === 465,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
  });
}

function sender() {
  return process.env.EMAIL_FROM || `AzByteGems <${process.env.EMAIL_USER}>`;
}

export async function sendConfirmationEmail(email: string, token: string, siteUrl = SITE_URL) {
  const baseUrl = siteUrl.replace(/\/$/, "");
  const url = `${baseUrl}/newsletter/confirm/${encodeURIComponent(token)}`;
  await getTransporter().sendMail({
    from: sender(),
    to: email,
    subject: "Confirm your AzByteGems newsletter subscription",
    text: `Please confirm your AzByteGems newsletter subscription: ${url}\n\nIf you did not request this, you can ignore this email.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;line-height:1.6"><h1>Confirm your subscription</h1><p>Click below to receive practical Python, data science, and AI tutorials from AzByteGems.</p><p><a href="${url}" style="display:inline-block;background:#0a73b0;color:white;padding:12px 20px;border-radius:6px;text-decoration:none">Confirm subscription</a></p><p>If you didn’t request this, ignore this email. The link expires in 24 hours.</p><p><a href="${baseUrl}/privacy">Privacy policy</a></p></div>`,
  });
}

export async function ensureUnsubscribeToken(collection: Collection<Document>, subscriber: Document) {
  const { token, hash } = createEmailToken();
  // Keep prior hashes valid so unsubscribe links in older emails continue to work.
  await collection.updateOne({ _id: subscriber._id }, { $addToSet: { unsubscribeTokenHashes: hash } });
  return token;
}

export async function sendNewsletterMessage({
  to,
  subject,
  html,
  text,
  unsubscribeToken,
  siteUrl = SITE_URL,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  unsubscribeToken: string;
  siteUrl?: string;
}) {
  const baseUrl = siteUrl.replace(/\/$/, "");
  const unsubscribeUrl = `${baseUrl}/api/newsletter/unsubscribe/${encodeURIComponent(unsubscribeToken)}`;
  const visibleUnsubscribeUrl = `${baseUrl}/newsletter/unsubscribe/${encodeURIComponent(unsubscribeToken)}`;
  const footer = `<p style="font-size:13px;color:#666">You’re receiving this because you subscribed to AzByteGems. <a href="${visibleUnsubscribeUrl}">Unsubscribe</a></p>`;
  const safeHtml = html.includes("[unsubscribe_link]")
    ? html.split("[unsubscribe_link]").join(visibleUnsubscribeUrl)
    : `${html}${footer}`;
  const plainText = text || html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

  await getTransporter().sendMail({
    from: sender(),
    to,
    subject,
    html: safeHtml,
    text: `${plainText}\n\nUnsubscribe: ${visibleUnsubscribeUrl}`,
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
}
