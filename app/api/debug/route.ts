// Debug endpoint to check Supabase connection and data
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Check environment variables
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Try to fetch articles
    const { data: articles, error, count } = await supabase
      .from("final_articles")
      .select("*", { count: "exact", head: false })
      .eq("is_published", true)
      .limit(5);

    // Check published count
    const { count: publishedCount } = await supabase
      .from("final_articles")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true);

    // Check total count
    const { count: totalCount } = await supabase
      .from("final_articles")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      success: true,
      environment: {
        hasSupabaseUrl: hasUrl,
        hasSupabaseKey: hasKey,
        supabaseUrl: hasUrl ? process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + "..." : "Missing",
      },
      data: {
        totalArticles: totalCount || 0,
        publishedArticles: publishedCount || 0,
        sampleArticles: articles?.length || 0,
        error: error ? error.message : null,
      },
      sample: articles?.slice(0, 2).map((a: any) => ({
        id: a.id,
        title: a.title,
        is_published: a.is_published,
        topic: a.topic,
      })) || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
        environment: {
          hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
      },
      { status: 500 }
    );
  }
}
