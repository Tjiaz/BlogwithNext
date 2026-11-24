import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Technology Briefs",
  description: "Read concise technical briefs on current AI, machine learning, data science, and software topics.",
  alternates: { canonical: "/resources/techbriefs" },
};

export default function TechBriefsLayout({ children }: { children: React.ReactNode }) { return children; }
