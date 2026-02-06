import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const { action } = body; // "like" or "unlike"
    
    // Try to find article by slug first
    let { data: articlesBySlug, error: slugError } = await supabase
      .from("final_articles")
      .select("id, slug, likes")
      .eq("slug", slug)
      .limit(1);

    let article = articlesBySlug && articlesBySlug.length > 0 ? articlesBySlug[0] : null;

    // If not found by slug, try by ID (UUID)
    if (!article) {
      const { data: articlesById, error: idError } = await supabase
        .from("final_articles")
        .select("id, slug, likes")
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

    // Initialize likes field if it doesn't exist
    const currentLikes = article.likes ?? 0;

    // Calculate new like count
    const increment = action === "like" ? 1 : action === "unlike" ? -1 : 0;
    const newLikes = Math.max(0, currentLikes + increment);

    // Update likes atomically using Supabase
    // Use limit(1) to ensure only one row is returned, then maybeSingle() to handle edge cases
    const { data: updatedArticles, error: updateError } = await supabase
      .from("final_articles")
      .update({ likes: newLikes })
      .eq("id", article.id)
      .select("likes")
      .limit(1);

    if (updateError) {
      console.error("Error updating likes:", updateError);
      return NextResponse.json(
        {
          success: false,
          error: updateError.message || "Failed to update likes",
        },
        { status: 500 },
      );
    }

    // Get the updated likes count from the response
    const updatedLikes = updatedArticles && updatedArticles.length > 0 
      ? updatedArticles[0].likes ?? newLikes
      : newLikes;

    return NextResponse.json({
      success: true,
      likes: updatedLikes,
      action: action,
    });
  } catch (error) {
    console.error("Error updating likes:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
