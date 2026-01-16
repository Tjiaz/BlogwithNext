import { connectToDatabase } from "@/utils/mongodb";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const { slug } = params;
  const databaseName = "ARTICLES";

  try {
    const { db } = await connectToDatabase();

    // Use final_articles collection (excluding RSS feeds)
    let articles = [];
    let topicTitle = "";

    // Normalize slug to match topic format
    // Handle both "python" and "python_articles" formats, and "Data Engineering" vs "data_engineering"
    const normalizedSlug = slug.toLowerCase().replace(/-/g, "_");
    const normalizedSlugWithSpaces = slug.toLowerCase().replace(/-/g, " ");
    const topicVariations = [
      normalizedSlug, // e.g., "python"
      `${normalizedSlug}_articles`, // e.g., "python_articles"
      // Handle "Data Engineering" format (capitalize first letter of each word)
      normalizedSlugWithSpaces
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "), // e.g., "Data Engineering"
      // Also try with underscores
      normalizedSlugWithSpaces
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("_"), // e.g., "Data_Engineering"
      // Original capitalized version
      normalizedSlug.charAt(0).toUpperCase() + normalizedSlug.slice(1), // e.g., "Python"
      // Also try lowercase with spaces (for topics like "data engineering")
      normalizedSlugWithSpaces, // e.g., "data engineering"
    ];

    const finalArticlesCollection = db.collection("final_articles");

    // Debug: Log the query
    console.log(
      `[articles/${slug}] Searching for topics: ${JSON.stringify(
        topicVariations
      )}`
    );

    // Try exact match first (faster), then case-insensitive regex fallback
    // Only filter by source, not by topic (articles with topic "RSS Feed" but source "html_source" are legitimate)
    const regexPattern = normalizedSlugWithSpaces.replace(/\s+/g, "[\\s_]+");
    articles = await finalArticlesCollection
      .find({
        $and: [
          {
            $or: [
              { topic: { $in: topicVariations } }, // Exact match first
              { topic: { $regex: `^${regexPattern}$`, $options: "i" } }, // Case-insensitive regex
            ],
          },
          {
            $or: [
              { source: { $ne: "rss_source" } },
              { source: { $exists: false } }, // Include documents where source doesn't exist
              { source: null }, // Include documents where source is null
            ],
          },
        ],
      })
      .project({
        _id: 1,
        title: 1,
        description: 1,
        author: 1,
        date: 1,
        published_at: 1,
        topic: 1,
        filtered_images: 1,
        hero_image: 1,
        content: 1,
      })
      .toArray();
    
    // Sort in JavaScript (more reliable than MongoDB sort on mixed types)
    articles.sort((a, b) => {
      // Handle both new format (published_at) and old format (date)
      const dateA = a.published_at || a.date || a.created_at || new Date(0);
      const dateB = b.published_at || b.date || b.created_at || new Date(0);
      const dateAObj = dateA instanceof Date ? dateA : new Date(dateA);
      const dateBObj = dateB instanceof Date ? dateB : new Date(dateB);
      // Handle invalid dates
      if (isNaN(dateAObj.getTime())) return 1;
      if (isNaN(dateBObj.getTime())) return -1;
      return dateBObj - dateAObj; // Descending (newest first)
    });

    console.log(
      `[articles/${slug}] Found ${articles.length} articles in final_articles`
    );

    if (articles.length > 0) {
      topicTitle = articles[0].topic || slug;
    } else {
      // Fallback to old collections for backward compatibility during migration
      const articlesCollection = db.collection("Articles");
      articles = await articlesCollection
        .find({
          topic: { $regex: slug, $options: "i" },
        })
        .project({
          _id: 1,
          title: 1,
          description: 1,
          author: 1,
          date: 1,
          topic: 1,
          filtered_images: 1,
          content: 1,
        })
        .sort({ date: -1 })
        .toArray();

      if (articles.length > 0) {
        topicTitle = articles[0].topic || slug;
      } else {
        // Fallback to Topic collection
        const topicCollection = db.collection("Topic");
        const topic = await topicCollection.findOne({
          $or: [{ name: `${slug}_articles` }, { title: `${slug}_articles` }],
        });

        if (topic && topic.articles && topic.articles.length > 0) {
          articles = topic.articles.map((article) => ({
            ...article,
            _id: article._id ? article._id.toString() : null,
          }));

          // Sort articles by published_at (newest first), fallback to date
          articles.sort((a, b) => {
            const dateA = a.published_at || a.date || new Date(0);
            const dateB = b.published_at || b.date || new Date(0);
            return new Date(dateB) - new Date(dateA);
          });

          topicTitle = topic.title || topic.name;
        }
      }
    }

    if (!articles || articles.length === 0) {
      return new Response(JSON.stringify({ error: "Articles Not Found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(
      JSON.stringify({
        articles: articles.map((article) => ({
          ...article,
          id: article._id?.toString() || article._id,
        })),
        articleCount: articles.length,
        topicTitle: topicTitle,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching articles:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch articles",
        message: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
