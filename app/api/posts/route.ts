// app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createArticle } from "@/lib/create-article";

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
    const defaultAuthor =
      session.user?.name || session.user?.email || "Anonymous";

    const result = await createArticle(body, { defaultAuthor });

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        _id: result.id,
      },
    });
  } catch (error) {
    console.error("❌ POST API ERROR:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("Missing required") ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export const dynamic = "force-dynamic"; // Uses request.url for searchParams
export const revalidate = 300;

export async function GET(req: NextRequest) {
  console.log("🔵 /api/posts hit");
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const search = searchParams.get("search");
    const topic = searchParams.get("topic");

    const { getArticles } = await import("@/lib/supabase-queries");

    const result = await getArticles({
      page,
      limit,
      search: search || undefined,
      topic: topic || undefined,
    });

    const processedPosts = result.data.map((post: any) => {
      if (!post.slug || typeof post.slug !== "string") {
        post.slug = post.id || post._id || "";
      }

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

      if (!post.img || post.img === "" || post.img === null) {
        post.img = "/images/azbyte.jpeg";
      }

      return post;
    });

    console.log(
      `📤 Returning ${processedPosts.length} posts (page ${page}, limit ${limit}, total ${result.total})`,
    );

    return NextResponse.json(
      {
        success: true,
        data: processedPosts,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=900",
        },
      }
    );
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
