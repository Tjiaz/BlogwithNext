import type { Metadata } from "next";
import NewsletterAction from "@/components/home/NewsletterAction";

export const metadata: Metadata = { title: "Unsubscribe from newsletter", robots: { index: false, follow: false } };

export default async function UnsubscribeNewsletterPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <NewsletterAction token={token} action="unsubscribe" />;
}
