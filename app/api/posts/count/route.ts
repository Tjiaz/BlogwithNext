import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 300;

/**
 * Returns total count of published articles - used for pagination.
 * Lightweight query, no cache, ensures accurate totalPages.
 */
export async function GET() {
  try {
    const { count, error } = await supabase
      .from("final_articles")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true);

    if (error) {
      console.error("❌ [posts/count] Supabase error:", error);
      return NextResponse.json({ total: 0 }, { status: 200 });
    }

    return NextResponse.json(
      { total: count ?? 0 },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
    );
  } catch {
    return NextResponse.json({ total: 0 }, { status: 200 });
  }
}
