import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * Cron endpoint to manually revalidate ads.txt cache
 * 
 * Usage:
 * - Vercel Cron: Set up in vercel.json
 * - External Cron: Call this endpoint with Authorization header
 * 
 * Authorization: Bearer YOUR_CRON_SECRET (set in Vercel env vars)
 */
export async function GET(request: Request) {
  try {
    // Optional: Verify the request is from a trusted source
    // Uncomment the following lines if you want to secure this endpoint
    /*
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    */

    // Revalidate the ads.txt route to fetch fresh content from Ezoic
    revalidatePath("/ads.txt");

    return NextResponse.json({
      success: true,
      message: "ads.txt cache revalidated successfully",
      timestamp: new Date().toISOString(),
      url: "https://www.azbytegems.com/ads.txt",
    });
  } catch (error) {
    console.error("Error revalidating ads.txt:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Allow this endpoint to be called externally
export const dynamic = "force-dynamic";
