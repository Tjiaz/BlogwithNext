import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    
    // Try to find article by slug first
    let { data: articlesBySlug, error: slugError } = await supabase
      .from("final_articles")
      .select("id, slug, views")
      .eq("slug", slug)
      .limit(1);

    let article = articlesBySlug && articlesBySlug.length > 0 ? articlesBySlug[0] : null;

    // If not found by slug, try by ID (UUID)
    if (!article) {
      const { data: articlesById, error: idError } = await supabase
        .from("final_articles")
        .select("id, slug, views")
        .eq("id", slug)
        .limit(1);

      if (idError || !articlesById || articlesById.length === 0) {
        return NextResponse.json(
          { success: false, error: "Post not found" },
          { status: 404 },
        );
      }

      article = articlesById[0];
    }

    // Get current views count (default to 0 if null)
    const currentViews = article.views ?? 0;
    const newViews = currentViews + 1;

    // Increment views atomically using Supabase
    // Use limit(1) to ensure only one row is returned
    const { data: updatedArticles, error: updateError } = await supabase
      .from("final_articles")
      .update({ views: newViews })
      .eq("id", article.id)
      .select("views")
      .limit(1);

    if (updateError) {
      console.error("Error incrementing views:", updateError);
      return NextResponse.json(
        {
          success: false,
          error: updateError.message || "Failed to increment views",
        },
        { status: 500 },
      );
    }

    // Get the updated views count from the response
    const updatedViews = updatedArticles && updatedArticles.length > 0 
      ? updatedArticles[0].views ?? newViews
      : newViews;

    return NextResponse.json({
      success: true,
      views: updatedViews,
    });
  } catch (error) {
    console.error("Error incrementing views:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
