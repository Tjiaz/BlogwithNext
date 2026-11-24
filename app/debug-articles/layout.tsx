import type { Metadata } from "next";

export const metadata: Metadata = { title: "Article Diagnostics", robots: { index: false, follow: false } };

export default function DebugArticlesLayout({ children }: { children: React.ReactNode }) { return children; }
