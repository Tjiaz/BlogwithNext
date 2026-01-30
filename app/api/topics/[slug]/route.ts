import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: Request, { params }: any) {
  const { slug } = await params; // required in Next.js 16

  try {
    const client = await clientPromise;
    const db = client.db("ARTICLES");

    // Decode and normalize slug to match DB
    const decodedSlug = decodeURIComponent(slug)
      .replace(/_/g, " ")
      .replace(/%20/g, " ")
      .trim();

    // If slug contains commas, use only the first part
    const cleanSlug = decodedSlug.split(",")[0].trim().toLowerCase();

    let query: any;

    // Handle special cases and variations
    if (cleanSlug === "career advice" || cleanSlug === "career_advice") {
      // Match "Career Advice" or "career_advice" (case-insensitive, flexible spacing/underscores)
      query = {
        $or: [
          { topic: { $regex: /^Career\s+Advice$/i } },
          { topic: { $regex: /^career_advice$/i } },
        ],
      };
    } else if (cleanSlug === "machine learning") {
      // Match "Machine Learning" but NOT "Machine Learning Ops" or "machine_learning_ops"
      query = {
        $and: [
          { topic: { $regex: /^Machine\s+Learning$/i } },
          { topic: { $not: /Machine\s+Learning\s+Ops/i } },
          { topic: { $not: /machine_learning_ops/i } },
        ],
      };
    } else if (cleanSlug === "machine learning ops" || cleanSlug === "mlops") {
      // Match Machine Learning Ops or machine_learning_ops (case-insensitive, flexible spacing/underscores)
      query = {
        $or: [
          { topic: { $regex: /^Machine\s+Learning\s+Ops$/i } },
          { topic: { $regex: /^machine_learning_ops$/i } },
          { topic: { $regex: /^MLOps$/i } },
        ],
      };
    } else if (cleanSlug === "data engineering") {
      // Match "Data Engineering" or "data_engineer" (case-insensitive, flexible spacing/underscores)
      query = {
        $or: [
          { topic: { $regex: /^Data\s+Engineering$/i } },
          { topic: { $regex: /^data_engineer$/i } },
        ],
      };
    } else if (cleanSlug === "data science") {
      // Match "Data Science" exactly (case-insensitive, flexible spacing)
      query = {
        topic: { $regex: /^Data\s+Science$/i },
      };
    } else if (
      cleanSlug === "language models" ||
      cleanSlug === "language_models"
    ) {
      // Match "Language Models" or "language_models" (case-insensitive, flexible spacing/underscores)
      query = {
        $or: [
          { topic: { $regex: /^Language\s+Models$/i } },
          { topic: { $regex: /^language_models$/i } },
        ],
      };
    } else {
      // For other topics, use case-insensitive exact match with flexible spacing
      const escapedSlug = cleanSlug
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        .replace(/\s+/g, "\\s+");
      query = {
        topic: { $regex: new RegExp(`^${escapedSlug}$`, "i") },
      };
    }

    // Fetch all matching documents
    const docs = await db.collection("final_articles").find(query).toArray();

    // Sort by date in descending order (newest first)
    // Handles multiple date field names and formats
    docs.sort((a: any, b: any) => {
      const dateA = new Date(
        a.date || a.publishedAt || a.createdAt || 0,
      ).getTime();
      const dateB = new Date(
        b.date || b.publishedAt || b.createdAt || 0,
      ).getTime();
      return dateB - dateA; // Descending order (newest first)
    });

    return NextResponse.json({
      success: true,
      topic: slug,
      count: docs.length,
      articles: docs.map((d) => ({
        ...d,
        _id: d._id.toString(),
      })),
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 },
    );
  }
}
