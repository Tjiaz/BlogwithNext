import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developer Resources",
  description: "Explore practical developer resources from AzByteGems, including cheat sheets, technical briefs, and recommendations.",
};

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
