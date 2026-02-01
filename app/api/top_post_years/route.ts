import { NextResponse } from "next/server";
import { getArticlesByYear } from "@/lib/supabase-queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear - 1, currentYear - 2];
    const limit = 5;

    const results = await getArticlesByYear(years, limit);

    return NextResponse.json(results);
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
