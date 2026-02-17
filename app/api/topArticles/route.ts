import { NextResponse } from "next/server";
import { getTopArticles } from "@/lib/supabase-queries";

export const runtime = "edge";
export const revalidate = 60;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 5;

    const articles = await getTopArticles(page, limit);

    // Process images - extract from content if needed
    const processedResults = articles.map((article) => {
      let imageUrl = article.img;

      // If no image, try to extract from content (would need to fetch content separately)
      if (!imageUrl || imageUrl === "/images/azbyte.jpeg") {
        // For now, keep default image
        imageUrl = imageUrl || "/images/azbyte.jpeg";
      }

      return {
        ...article,
        img: imageUrl,
      };
    });

    return NextResponse.json(processedResults);
  } catch (error: any) {
    console.error("Error fetching top articles:", error);
    return NextResponse.json([], { status: 200 });
  }
}
