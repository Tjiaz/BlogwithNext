// Debug endpoint to check Supabase connection and data
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  // Check environment variables FIRST before trying to use supabase
  // Get all env vars that contain SUPABASE to debug naming issues
  const allSupabaseVars = Object.keys(process.env)
    .filter(key => key.toUpperCase().includes('SUPABASE'))
    .reduce((acc, key) => {
      const value = process.env[key];
      acc[key] = value ? `${value.substring(0, 30)}... (length: ${value.length})` : 'NOT SET';
      return acc;
    }, {} as Record<string, string>);

  // Check exact variable names
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const urlValue = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const keyValue = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Check for common typos/variations
  const possibleUrlVars = {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'next_public_supabase_url': process.env.next_public_supabase_url,
    'NEXT_PUBLIC_SUPABASE_UR': process.env.NEXT_PUBLIC_SUPABASE_UR,
    'NEXT_PUBLIC_SUPABASE_URL ': process.env['NEXT_PUBLIC_SUPABASE_URL '],
  };
  
  const urlLength = urlValue?.length || 0;

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
        urlLength: urlLength,
        allSupabaseEnvVars: allSupabaseVars,
        possibleUrlVariations: Object.entries(possibleUrlVars)
          .filter(([_, val]) => val)
          .map(([name, val]) => ({ name, value: `${val?.substring(0, 30)}...` })),
        note: "NEXT_PUBLIC_SUPABASE_URL is missing. Check for typos, case sensitivity, or if it's set for the wrong environment.",
      },
      instructions: [
        "1. In Vercel, click on NEXT_PUBLIC_SUPABASE_URL to edit it",
        "2. Verify the name is EXACTLY: NEXT_PUBLIC_SUPABASE_URL (no spaces, correct case)",
        "3. Verify the value is: https://owmqmqsgmkfuayfpfmva.supabase.co",
        "4. Make sure it's set for 'All Environments'",
        "5. Save and redeploy",
      ],
    });
  }

  try {
    // Now try to use supabase since env vars are present
    const {
      data: articles,
      error,
      count,
    } = await supabase
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
      sample:
        articles?.slice(0, 2).map((a: any) => ({
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
