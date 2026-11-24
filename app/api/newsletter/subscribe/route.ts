import { NextResponse } from "next/server";
import {
  createEmailToken,
  getNewsletterCollection,
  normalizeEmail,
  sendConfirmationEmail,
} from "@/lib/newsletter";
import { NEWSLETTER_CONSENT_TEXT, NEWSLETTER_CONSENT_VERSION } from "@/lib/newsletter-constants";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Quietly accept the honeypot to avoid revealing bot detection.
    if (typeof body.website === "string" && body.website.trim()) {
      return NextResponse.json({ success: true, message: "If the address is valid, a confirmation email will arrive shortly." });
    }

    const email = normalizeEmail(body.email);
    if (!email) return NextResponse.json({ success: false, error: "Enter a valid email address." }, { status: 400 });
    if (body.consent !== true) return NextResponse.json({ success: false, error: "Please agree to receive email updates before subscribing." }, { status: 400 });

    const collection = await getNewsletterCollection();
    const existing = await collection.findOne({ email });
    if (existing?.active === true && (existing.confirmedAt || existing.legacyConsentReviewed)) {
      return NextResponse.json({ success: true, alreadySubscribed: true, message: "This address is already subscribed." });
    }

    // Limit confirmation messages for repeated submissions of the same address.
    const lastRequestedAt = existing?.confirmationRequestedAt instanceof Date
      ? existing.confirmationRequestedAt.getTime()
      : 0;
    const withinCooldown = Date.now() - lastRequestedAt < 90_000;
    if (existing && !existing.active && withinCooldown) {
      return NextResponse.json({ success: true, message: "Check your inbox for a confirmation email." });
    }

    const { token, hash } = createEmailToken();
    const now = new Date();
    await collection.updateOne(
      { email },
      {
        $set: {
          email,
          active: false,
          status: "pending",
          consentAt: now,
          consentSource: typeof body.source === "string" ? body.source.slice(0, 80) : "website",
          consentVersion: NEWSLETTER_CONSENT_VERSION,
          consentText: NEWSLETTER_CONSENT_TEXT,
          confirmationRequestedAt: now,
          confirmationTokenHash: hash,
          confirmationExpiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      { upsert: true },
    );

    try {
      const emailSiteUrl = process.env.NODE_ENV === "development"
        ? new URL(req.url).origin
        : undefined;
      await sendConfirmationEmail(email, token, emailSiteUrl);
    } catch (mailError) {
      await collection.updateOne(
        { email, confirmationTokenHash: hash },
        {
          $unset: { confirmationTokenHash: "", confirmationExpiresAt: "" },
          $set: { confirmationRequestedAt: new Date(0) },
        },
      );
      console.error("Failed to send newsletter confirmation:", mailError);
      return NextResponse.json({ success: false, error: "Email confirmation is temporarily unavailable. Please try again later." }, { status: 503 });
    }

    return NextResponse.json({ success: true, message: "Check your inbox for a confirmation email. The link expires in 24 hours." });
  } catch (error) {
    console.error("Failed to process newsletter subscription:", error);
    return NextResponse.json({ success: false, error: "Could not subscribe right now. Please try again later." }, { status: 500 });
  }
}
