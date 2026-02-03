// Debug endpoint to check Supabase connection and data
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  // Check environment variables FIRST before trying to use supabase
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const urlValue = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const keyValue = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env vars are missing, return early with helpful message
  if (!hasUrl || !hasKey) {
    return NextResponse.json({
      success: false,
      error: "Missing environment variables",
      environment: {
        hasSupabaseUrl: hasUrl,
        hasSupabaseKey: hasKey,
        supabaseUrl: urlValue ? `${urlValue.substring(0, 30)}...` : "NOT SET",
        supabaseKey: keyValue ? `${keyValue.substring(0, 20)}...` : "NOT SET",
        note: "If variables are set in Vercel but showing as missing, you need to REDEPLOY your project",
      },
      instructions: [
        "1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables",
        "2. Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set",
        "3. Make sure they're set for 'All Environments' (Production, Preview, Development)",
        "4. Go to Deployments tab → Click '...' on latest → Click 'Redeploy'",
        "5. Wait for redeploy to complete, then check /api/debug again",
      ],
    });
  }

  try {
    // Now try to use supabase since env vars are present
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
        supabaseUrl: urlValue ? `${urlValue.substring(0, 30)}...` : "Missing",
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
          hasSupabaseUrl: hasUrl,
          hasSupabaseKey: hasKey,
          supabaseUrl: urlValue ? `${urlValue.substring(0, 30)}...` : "NOT SET",
          supabaseKey: keyValue ? `${keyValue.substring(0, 20)}...` : "NOT SET",
        },
        errorDetails: error.toString(),
      },
      { status: 500 }
    );
  }
}
