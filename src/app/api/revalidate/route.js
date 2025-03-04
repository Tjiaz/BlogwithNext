// app/api/revalidate/route.js
export async function GET(request) {
  try {
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://azbytegems.com"
        : "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/rss`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
      },
    });

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
