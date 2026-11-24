import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Python, Data Science & AI Tutorials",
  description: "Browse practical Python, data science, machine learning, and AI tutorials from AzByteGems.",
  alternates: { canonical: "/blog" },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
