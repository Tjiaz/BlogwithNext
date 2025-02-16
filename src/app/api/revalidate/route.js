// app/api/revalidate/route.js
export async function GET(request) {
  try {
    // Force revalidation of the RSS feed
    const response = await fetch(
      `${process.env.VERCEL_URL || "http://localhost:3000"}/api/rss`,
      {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to revalidate RSS feed");
    }

    return new Response(
      JSON.stringify({
        revalidated: true,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
