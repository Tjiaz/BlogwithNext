import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developer Tool Recommendations",
  description: "Explore tools and resources recommended for Python development, data science, and AI projects.",
  alternates: { canonical: "/resources/recommendations" },
};

export default function RecommendationsLayout({ children }: { children: React.ReactNode }) { return children; }
