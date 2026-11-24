import type { Metadata } from "next";
import NewsletterAction from "@/components/home/NewsletterAction";

export const metadata: Metadata = { title: "Confirm newsletter subscription", robots: { index: false, follow: false } };

export default async function ConfirmNewsletterPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <NewsletterAction token={token} action="confirm" />;
}
