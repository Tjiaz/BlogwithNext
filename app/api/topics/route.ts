import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ARTICLES");

    // Fetch all topics from final_articles collection
    const docs = await db
      .collection("final_articles")
      .find({}, { projection: { topic: 1 } })
      .toArray();

    let topics = docs
      .map((d) => d.topic)
      .filter((t) => t && typeof t === "string");

    // Normalization helper
    function normalizeTopic(raw: string): string {
      if (!raw) return "";

      let t = raw.trim();

      // Fix underscores → spaces
      t = t.replace(/_/g, " ");

      // Handle special cases first
      const lower = t.toLowerCase();
      
      // Machine Learning Ops stays as "Machine Learning Ops" (handle underscores)
      if (lower === "machine learning ops" || lower === "machine learning operations" || lower === "machine_learning_ops") {
        return "Machine Learning Ops";
      }
      
      // Data Engineering (handle data_engineer variation)
      if (lower === "data engineering" || lower === "data_engineer") {
        return "Data Engineering";
      }
      
      // Career Advice stays as is (handle underscores)
      if (lower === "career advice" || lower === "career_advice") {
        return "Career Advice";
      }
      
      // Language Models (handle underscores)
      if (lower === "language models" || lower === "language_models") {
        return "Language Models";
      }
      
      // RSS Feed → ML (your request)
      if (lower.includes("rss")) return "ML";

      // Special acronyms
      const upper = t.toUpperCase();
      if (["AI", "ML", "NLP", "SQL"].includes(upper)) {
        return upper;
      }

      // Capitalize words
      return t
        .toLowerCase()
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }

    // Normalize + dedupe
    const normalizedMap = new Map<string, string>();
    
    topics.forEach((t) => {
      const cleaned = normalizeTopic(t);
      const key = cleaned.toLowerCase();
      // Only add if not already exists (case-insensitive)
      if (!normalizedMap.has(key)) {
        normalizedMap.set(key, cleaned);
      }
    });

    // Filter out ML if Machine Learning exists
    // Keep Machine Learning Ops separate from Machine Learning
    const normalized = Array.from(normalizedMap.values());
    const hasMachineLearning = normalized.some(
      (t) => t.toLowerCase() === "machine learning"
    );
    const filtered = normalized.filter((t) => {
      const lower = t.toLowerCase();
      // Filter out ML if Machine Learning exists
      if (hasMachineLearning && lower === "ml") {
        return false;
      }
      // Keep Machine Learning Ops separate from Machine Learning
      return true;
    });

    return NextResponse.json({ success: true, topics: filtered });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}
