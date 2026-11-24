import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About AzByteGems",
  description: "Learn about AzByteGems, our mission, and the practical tutorials and resources we publish.",
  alternates: { canonical: "/blog/about" },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
