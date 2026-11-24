import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datasets for Python and Data Science Projects",
  description: "Find datasets and project resources for practicing Python, data analysis, and machine learning.",
  alternates: { canonical: "/datasets" },
};

export default function DatasetsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
