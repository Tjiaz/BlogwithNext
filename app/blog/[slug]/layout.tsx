import type { Metadata } from "next";

// Legacy Mongo-backed article URLs are not used by current site navigation.
// The Supabase-backed root article route is the indexable canonical destination.
export const metadata: Metadata = { robots: { index: false, follow: true } };

export default function LegacyBlogArticleLayout({ children }: { children: React.ReactNode }) { return children; }
