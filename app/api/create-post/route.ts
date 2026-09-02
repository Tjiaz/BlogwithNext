import { NextRequest, NextResponse } from "next/server";
import { verifyCreatePostApiKey } from "@/lib/api-key-auth";
import { createArticle } from "@/lib/create-article";

/**
 * Automation endpoint for n8n / scheduled posting.
 *
 * POST /api/create-post
 * Headers:
 *   Authorization: Bearer <CREATE_POST_API_KEY>
 *   or x-api-key: <CREATE_POST_API_KEY>
 *
 * Body (JSON):
 *   title, description, content, topic  (required)
 *   author, tags, hero_image            (optional)
 *   notify: false                       (optional — skip subscriber email)
 *   is_published: true                  (optional)
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    endpoint: "/api/create-post",
    method: "POST",
    description:
      "Automation endpoint for publishing blog articles (n8n, cron). Use POST with your API key.",
    requiredHeaders: {
      Authorization: "Bearer <CREATE_POST_API_KEY>",
      "Content-Type": "application/json",
    },
    requiredBody: ["title", "description", "content", "topic"],
    optionalBody: ["author", "tags", "hero_image", "notify", "is_published"],
  });
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.CREATE_POST_API_KEY && !process.env.N8N_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error:
            "CREATE_POST_API_KEY is not configured. Add it in Vercel env vars.",
        },
        { status: 503 },
      );
    }

    if (!verifyCreatePostApiKey(req)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized — invalid or missing API key" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const result = await createArticle(body);

    return NextResponse.json({
      success: true,
      message: "Article published successfully",
      data: result,
    });
  } catch (error) {
    console.error("❌ create-post API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("Missing required") ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export const dynamic = "force-dynamic";
