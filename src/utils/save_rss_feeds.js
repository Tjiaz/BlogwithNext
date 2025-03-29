import Parser from "rss-parser";
const parser = new Parser();

// Add 'export const dynamic = "force-dynamic"' if needed
export const dynamic = "force-dynamic";

// Change to named export
export async function GET(request) {
  try {
    const feedUrl =
      "https://rss.feedspot.com/folder/5hrJs2cf5Q==/rss/rsscombiner";
    const feed = await parser.parseURL(feedUrl);

    // Transform and validate items
    const articles = feed.items.map((item) => {
      // Validate image URL
      let imageUrl = null;
      if (item.enclosure?.url) {
        try {
          new URL(item.enclosure.url); // Validate URL
          imageUrl = item.enclosure.url;
        } catch (e) {
          console.log(`Invalid image URL: ${item.enclosure.url}`);
        }
      }

      return {
        title: item.title?.trim() || "Untitled",
        description: item.contentSnippet || item.description || "",
        link: item.link?.trim() || "",
        pubDate: item.pubDate || null,
        isoDate: item.isoDate || null,
        author: item.creator?.trim().replace(/\n/g, "") || "Unknown",
        guid: item.guid || item.link || `${item.title}-${Date.now()}`,
        content: item.content || "",
        image: imageUrl || "/azbyte.jpeg", // Default image if none available
        isRssPost: true,
      };
    });

    return new Response(JSON.stringify(articles), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Error fetching RSS feed:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch RSS feed",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
