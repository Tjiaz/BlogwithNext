"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ThumbsUp, ThumbsDown } from "lucide-react";
import toast from "react-hot-toast";

type FeedbackValue = "up" | "down" | null;

interface ArticleFeedbackProps {
  slug: string;
  /** Sidebar: compact stack; bottom: full row */
  variant?: "sidebar" | "bottom";
}

const COMPLETED_KEY = "completedArticles";
const FEEDBACK_KEY = "articleFeedback";

function readJsonArray(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readFeedbackMap(): Record<string, FeedbackValue> {
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export default function ArticleFeedback({
  slug,
  variant = "bottom",
}: ArticleFeedbackProps) {
  const [completed, setCompleted] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackValue>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCompleted(readJsonArray(COMPLETED_KEY).includes(slug));
    setFeedback(readFeedbackMap()[slug] ?? null);
  }, [slug]);

  const toggleCompleted = () => {
    const list = readJsonArray(COMPLETED_KEY);
    const next = list.includes(slug)
      ? list.filter((s) => s !== slug)
      : [...list, slug];
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(next));
    setCompleted(next.includes(slug));
    toast.success(
      next.includes(slug) ? "Marked as completed" : "Marked as incomplete",
    );
  };

  const setThumbs = (value: "up" | "down") => {
    const map = readFeedbackMap();
    const next: FeedbackValue = map[slug] === value ? null : value;
    if (next) map[slug] = next;
    else delete map[slug];
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(map));
    setFeedback(next);
    if (next === "up") toast.success("Thanks for the feedback!");
    else if (next === "down") toast.success("Thanks — we'll keep improving.");
  };

  if (!mounted) {
    return (
      <div
        className={
          variant === "sidebar"
            ? "h-24 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"
            : "h-16 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"
        }
        aria-hidden
      />
    );
  }

  const completeBtn = (
    <button
      type="button"
      onClick={toggleCompleted}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
        completed
          ? "bg-emerald-600 text-white hover:bg-emerald-700"
          : "bg-gray-800 dark:bg-gray-700 text-white hover:bg-gray-900 dark:hover:bg-gray-600"
      } ${variant === "sidebar" ? "w-full" : ""}`}
      aria-pressed={completed}
    >
      <CheckCircle2 className="w-4 h-4" />
      {completed ? "Completed" : "Mark as Completed"}
    </button>
  );

  const thumbs = (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 dark:text-gray-400 mr-1">
        Was this helpful?
      </span>
      <button
        type="button"
        onClick={() => setThumbs("up")}
        aria-label="Liked it (thumbs up)"
        aria-pressed={feedback === "up"}
        className={`inline-flex items-center justify-center rounded-lg border p-2.5 transition-colors ${
          feedback === "up"
            ? "border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
            : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        }`}
      >
        <ThumbsUp className={`w-4 h-4 ${feedback === "up" ? "fill-current" : ""}`} />
      </button>
      <button
        type="button"
        onClick={() => setThumbs("down")}
        aria-label="Disliked it (thumbs down)"
        aria-pressed={feedback === "down"}
        className={`inline-flex items-center justify-center rounded-lg border p-2.5 transition-colors ${
          feedback === "down"
            ? "border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
            : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        }`}
      >
        <ThumbsDown
          className={`w-4 h-4 ${feedback === "down" ? "fill-current" : ""}`}
        />
      </button>
    </div>
  );

  if (variant === "sidebar") {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 space-y-3">
        {completeBtn}
        <div className="flex flex-col gap-2 pt-1 border-t border-gray-100 dark:border-gray-700">
          {thumbs}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-5">
        {completeBtn}
        {thumbs}
      </div>
    </div>
  );
}
