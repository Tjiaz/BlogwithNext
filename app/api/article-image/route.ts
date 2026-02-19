import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 300;

/**
 * Image proxy - serves article images without bloating the page payload.
 * Supports both URL images (redirect) and base64 (decode & stream).
 * Use: <img src={`/api/article-image?id=${article.id}`} />
 */
export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.redirect(new URL("/images/azbyte.jpeg", req.url));
    }

    const { data: article, error } = await supabase
      .from("final_articles")
      .select("hero_image, img, featured_image, image, image_url, filtered_images")
      .eq("id", id)
      .single();

    if (error || !article) {
      return NextResponse.redirect(new URL("/images/azbyte.jpeg", req.url));
    }

    const raw =
      article.hero_image ||
      (Array.isArray(article.filtered_images) && article.filtered_images.length > 0
        ? article.filtered_images[0]
        : null) ||
      article.img ||
      article.featured_image ||
      article.image ||
      article.image_url ||
      null;

    if (!raw || typeof raw !== "string") {
      return NextResponse.redirect(new URL("/images/azbyte.jpeg", req.url));
    }

    // Base64 image - decode and return
    if (raw.startsWith("data:")) {
      const match = raw.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        const contentType = match[1] || "image/jpeg";
        const base64 = match[2];
        const buffer = Buffer.from(base64, "base64");
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        });
      }
    }

    // URL - redirect to source (lets browser load directly)
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      return NextResponse.redirect(raw, 302);
    }

    // Relative path like /images/xxx
    if (raw.startsWith("/")) {
      return NextResponse.redirect(new URL(raw, req.url), 302);
    }

    return NextResponse.redirect(new URL("/images/azbyte.jpeg", req.url));
  } catch {
    return NextResponse.redirect(new URL("/images/azbyte.jpeg", req.url));
  }
}
