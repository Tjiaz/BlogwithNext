import type { CSSProperties } from "react";

/**
 * Shared topic badge colors for homepage cards, Most Popular, Discover Topics, etc.
 * Hex colors are used with inline styles so Tailwind purge cannot strip them.
 */

const TOPIC_COLORS: Record<string, { className: string; hex: string }> = {
  "data science": { className: "bg-green-600", hex: "#16a34a" },
  data_science: { className: "bg-green-600", hex: "#16a34a" },
  nlp: { className: "bg-teal-500", hex: "#14b8a6" },
  sql: { className: "bg-orange-500", hex: "#f97316" },
  python: { className: "bg-purple-600", hex: "#9333ea" },
  programming: { className: "bg-emerald-600", hex: "#059669" },
  ai: { className: "bg-pink-500", hex: "#ec4899" },
  ml: { className: "bg-blue-500", hex: "#3b82f6" },
  "machine learning": { className: "bg-blue-500", hex: "#3b82f6" },
  "machine learning ops": { className: "bg-indigo-600", hex: "#4f46e5" },
  machine_learning_ops: { className: "bg-indigo-600", hex: "#4f46e5" },
  "data engineering": { className: "bg-cyan-600", hex: "#0891b2" },
  "career advice": { className: "bg-amber-600", hex: "#d97706" },
  career_advice: { className: "bg-amber-600", hex: "#d97706" },
  "language models": { className: "bg-violet-600", hex: "#7c3aed" },
  language_models: { className: "bg-violet-600", hex: "#7c3aed" },
};

const DEFAULT_HEX = [
  "#3b82f6",
  "#22c55e",
  "#a855f7",
  "#ec4899",
  "#f97316",
  "#14b8a6",
  "#6366f1",
  "#06b6d4",
];

const DEFAULT_CLASSES = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-cyan-500",
];

function topicHash(topicName: string): number {
  let hash = 0;
  for (let i = 0; i < topicName.length; i++) {
    hash = topicName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function resolveTopicColor(topicName: string): { className: string; hex: string } {
  const lower = (topicName || "").toLowerCase().trim();
  if (!lower) {
    return { className: "bg-gray-500", hex: "#6b7280" };
  }

  if (TOPIC_COLORS[lower]) {
    return TOPIC_COLORS[lower];
  }

  for (const [key, color] of Object.entries(TOPIC_COLORS)) {
    if (lower.includes(key) || key.includes(lower)) {
      return color;
    }
  }

  const idx = topicHash(topicName) % DEFAULT_HEX.length;
  return { className: DEFAULT_CLASSES[idx], hex: DEFAULT_HEX[idx] };
}

/** Tailwind bg-* class for chips that already rely on utility classes */
export function getTopicColor(topicName: string): string {
  return resolveTopicColor(topicName).className;
}

/** Hex color for inline styles (survives CSS purge) */
export function getTopicHex(topicName: string): string {
  return resolveTopicColor(topicName).hex;
}

/** Ready-to-use badge style for featured / latest article cards */
export function getTopicBadgeStyle(topicName: string): CSSProperties {
  return {
    backgroundColor: getTopicHex(topicName),
    color: "#ffffff",
  };
}
