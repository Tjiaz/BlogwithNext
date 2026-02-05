// app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { extractFirstImageFromContent } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { title, description, content, topic, tags, author } = body;

    if (!title || !description || !content || !topic) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Generate slug from title
    let baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Ensure slug is unique by appending number if needed
    let slug = baseSlug;
    let slugCounter = 1;
    let isUnique = false;

    // Use admin client to check for existing slugs (bypasses RLS)
    while (!isUnique) {
      const { data: existing } = await supabaseAdmin
        ?.from("final_articles")
        .select("id")
        .eq("slug", slug)
        .limit(1) || { data: null };

      if (!existing || existing.length === 0) {
        isUnique = true;
      } else {
        slug = `${baseSlug}-${slugCounter}`;
        slugCounter++;
      }
    }

    // Extract first image from content to use as cover image
    const extractedImage = extractFirstImageFromContent(content);
    const now = new Date().toISOString();

    const newPost = {
      title,
      description,
      excerpt: description, // Use description as excerpt if not provided
      content,
      topic,
      category: topic, // Also set category to topic
      tags: tags || [],
      author: author || session.user?.name || session.user?.email || "Anonymous",
      author_name: author || session.user?.name || session.user?.email || "Anonymous",
      date: now,
      published_at: now,
      created_at: now,
      updated_at: now,
      img: extractedImage || null,
      featured_image: extractedImage || null,
      views: 0,
      likes: 0,
      comments: [],
      slug,
      is_published: true,
      reading_time: "5 min read", // Default reading time
    };

    // Use admin client to insert (bypasses RLS for authenticated users)
    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection not available. Please check SUPABASE_SERVICE_ROLE_KEY environment variable.",
        },
        { status: 500 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("final_articles")
      .insert(newPost)
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase insert error:", error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || "Failed to create article",
          details: error.code === '42501' 
            ? "Row Level Security policy violation. Please check Supabase RLS policies or use admin client."
            : undefined,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        _id: data.id, // For compatibility with existing code
        id: data.id,
      },
    });
  } catch (error) {
    console.error("❌ POST API ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  console.log("🔵 /api/posts hit");
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const search = searchParams.get("search");
    const topic = searchParams.get("topic");

    const { getArticles } = await import("@/lib/supabase-queries");
    const { extractFirstImageFromContent } = await import("@/lib/utils");

    const result = await getArticles({
      page,
      limit,
      search: search || undefined,
      topic: topic || undefined,
    });

    // Extract images from content if needed
    const processedPosts = result.data.map((post: any) => {
      // Ensure slug is a string
      if (!post.slug || typeof post.slug !== "string") {
        post.slug = post.id || post._id || "";
      }

      // Extract first image from content if no img field exists
      if (
        (!post.img ||
          post.img === "" ||
          post.img === null ||
          post.img === "[object Object]") &&
        post.content
      ) {
        const extractedImage = extractFirstImageFromContent(post.content);
        if (extractedImage) {
          post.img = extractedImage;
        }
      }

      // Get best image from available sources
      const filteredImage =
        post.filtered_images &&
        Array.isArray(post.filtered_images) &&
        post.filtered_images.length > 0
          ? post.filtered_images[0]
          : null;

      post.img =
        post.hero_image ||
        filteredImage ||
        post.img ||
        post.featuredImage ||
        post.image ||
        post.imageUrl ||
        null;

      // Use default image if no image found
      if (!post.img || post.img === "" || post.img === null) {
        post.img = "/images/azbyte.jpeg";
      }

      // Remove content from response
      const { content, ...postWithoutContent } = post;
      return postWithoutContent;
    });

    console.log(
      `📤 Returning ${processedPosts.length} posts (page ${page}, limit ${limit}, total ${result.total})`,
    );

    return NextResponse.json({
      success: true,
      data: processedPosts,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error: any) {
    console.error("❌ POSTS API ERROR:", error);
    return NextResponse.json(
      {
        success: true,
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 0,
        },
      },
      { status: 200 },
    );
  }
}
