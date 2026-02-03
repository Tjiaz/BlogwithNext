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
      // Check for hidden characters (non-printable)
      const hasHiddenChars = /[\x00-\x1F\x7F-\x9F]/.test(key);
      const charCodes = Array.from(key).map(c => c.charCodeAt(0));
      acc[key] = {
        value: value ? `${value.substring(0, 30)}... (length: ${value.length})` : 'NOT SET',
        hasHiddenChars,
        charCodes: hasHiddenChars ? charCodes : undefined,
        exactMatch: key === 'NEXT_PUBLIC_SUPABASE_URL',
      };
      return acc;
    }, {} as Record<string, any>);

  // Check exact variable names with multiple methods
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
  
  // Check all env keys that might be the URL (case-insensitive partial match)
  const allEnvKeys = Object.keys(process.env);
  const urlLikeKeys = allEnvKeys.filter(key => 
    key.toUpperCase().includes('SUPABASE') && key.toUpperCase().includes('URL')
  );
  
  const urlLength = urlValue?.length || 0;
  
  // Get deployment info
  const vercelEnv = process.env.VERCEL_ENV || 'unknown';
  const vercelUrl = process.env.VERCEL_URL || 'unknown';

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
        urlLikeKeys: urlLikeKeys,
        possibleUrlVariations: Object.entries(possibleUrlVars)
          .filter(([_, val]) => val)
          .map(([name, val]) => ({ name, value: `${val?.substring(0, 30)}...` })),
        deployment: {
          vercelEnv,
          vercelUrl,
        },
        note: "NEXT_PUBLIC_SUPABASE_URL is missing from runtime. Variable exists in Vercel dashboard but deployment isn't picking it up.",
      },
      instructions: [
        "🔧 FORCE VERCEL TO RECOGNIZE THE VARIABLE:",
        "",
        "Option 1: Delete and Recreate (Recommended)",
        "1. In Vercel → Settings → Environment Variables",
        "2. DELETE NEXT_PUBLIC_SUPABASE_URL (click trash icon)",
        "3. Click 'Add New' and recreate it:",
        "   - Name: NEXT_PUBLIC_SUPABASE_URL",
        "   - Value: https://owmqmqsgmkfuayfpfmva.supabase.co",
        "   - Environment: All Environments",
        "4. Save",
        "",
        "Option 2: Clear Build Cache",
        "1. Go to Deployments → Latest → '...' → 'Redeploy'",
        "2. Check 'Clear build cache and redeploy' checkbox",
        "3. Click 'Redeploy'",
        "",
        "Option 3: Push a new commit",
        "1. Make any small change (add a comment)",
        "2. Commit and push",
        "3. This forces a completely fresh build",
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
