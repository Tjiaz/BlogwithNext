import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];
  const limit = 5;

  try {
    const client = await clientPromise;
    const db = client.db("ARTICLES");
    const collection = db.collection("final_articles");

    const results: Record<number, any[]> = {};

    for (const year of years) {
      const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
      const startOfNextYear = new Date(`${year + 1}-01-01T00:00:00.000Z`);

      const articles = await collection
        .find({
          $or: [
            {
              date: {
                $gte: startOfYear,
                $lt: startOfNextYear,
              },
            },
            {
              publishedAt: {
                $gte: startOfYear,
                $lt: startOfNextYear,
              },
            },
          ],
        })
        .sort({ date: -1 })
        .limit(limit)
        .toArray();

      results[year] = articles.map((article) => ({
        id: article._id.toString(),
        title: article.title,
        description: article.description,
        author: article.author || "",
        date: article.date || article.publishedAt || "",
        topic: article.topic || "",
        img: article.img || article.featuredImage || article.image || null,
      }));
    }

    // Only include years that have articles
    const processedResults = years
      .map((year) => ({
        year,
        articles: results[year] || [],
      }))
      .filter((yearData) => yearData.articles.length > 0); // Filter out years with no articles

    return NextResponse.json(processedResults);
  } catch (error) {
    console.error("Error fetching articles by year:", error);
    return NextResponse.json(
      {
        message: "Error fetching articles",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
