import { connectToDatabase } from "@/utils/mongodb";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const { articleId } = params;
  const limit = 6; // Number of related articles to return

  if (!articleId) {
    return new Response(JSON.stringify({ message: "No articleId provided" }), {
      status: 400,
    });
  }

  try {
    const { db } = await connectToDatabase();
    const finalArticlesCollection = db.collection("final_articles");

    // Helper function to check if string is a valid ObjectId
    const isValidObjectId = (str) => {
      return /^[0-9a-fA-F]{24}$/.test(str);
    };

    // First, find the current article to get its topic
    let currentArticle = null;
    
    if (isValidObjectId(articleId)) {
      try {
        currentArticle = await finalArticlesCollection.findOne({
          _id: new ObjectId(articleId),
        });
      } catch (idError) {
        console.log("ObjectId search failed, trying string match for:", articleId);
      }
    }

    // If not found, try string match
    if (!currentArticle) {
      try {
        currentArticle = await finalArticlesCollection.findOne({
          _id: articleId,
        });
      } catch (error) {
        console.log("String ID match failed for:", articleId);
      }
    }

    // If still not found, try old collections
    if (!currentArticle) {
      const articlesCollection = db.collection("Articles");
      if (isValidObjectId(articleId)) {
        try {
          currentArticle = await articlesCollection.findOne({
            _id: new ObjectId(articleId),
          });
        } catch (idError) {
          console.log("Articles collection ObjectId search failed");
        }
      }
    }

    if (!currentArticle) {
      return new Response(JSON.stringify({ message: "Article not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const currentTopic = currentArticle.topic;
    if (!currentTopic) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Normalize topic for matching (handle variations)
    const normalizedTopic = currentTopic.toLowerCase().trim();
    const topicVariations = [
      currentTopic, // Original topic
      normalizedTopic, // Lowercase
      normalizedTopic.replace(/\s+/g, "_"), // With underscores
      normalizedTopic.replace(/_/g, " "), // With spaces
      normalizedTopic
        .split(/[\s_]+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "), // Title case with spaces
      normalizedTopic
        .split(/[\s_]+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("_"), // Title case with underscores
    ];

    // Find related articles from the same topic, excluding the current article
    const relatedArticles = await finalArticlesCollection
      .find({
        $and: [
          {
            $or: [
              { topic: { $in: topicVariations } }, // Exact match
              { topic: { $regex: `^${normalizedTopic.replace(/\s+/g, "[\\s_]+")}$`, $options: "i" } }, // Case-insensitive regex
            ],
          },
          {
            // Exclude current article
            _id: isValidObjectId(articleId)
              ? { $ne: new ObjectId(articleId) }
              : { $ne: articleId },
          },
          {
            // Exclude RSS feeds
            $or: [
              { source: { $ne: "rss_source" } },
              { source: { $exists: false } },
              { source: null },
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
      .limit(limit + 1) // Get one extra in case we need to filter
      .toArray();

    // Sort by date (newest first)
    relatedArticles.sort((a, b) => {
      const dateA = a.published_at || a.date || a.created_at || new Date(0);
      const dateB = b.published_at || b.date || b.created_at || new Date(0);
      const dateAObj = dateA instanceof Date ? dateA : new Date(dateA);
      const dateBObj = dateB instanceof Date ? dateB : new Date(dateB);
      if (isNaN(dateAObj.getTime())) return 1;
      if (isNaN(dateBObj.getTime())) return -1;
      return dateBObj - dateAObj;
    });

    // Limit to requested number
    const limitedArticles = relatedArticles.slice(0, limit);

    // Process articles to ensure consistent format
    const processedArticles = limitedArticles.map((article) => {
      // Parse filtered_images if it's a string
      let filteredImages = article.filtered_images;
      if (typeof filteredImages === "string") {
        try {
          filteredImages = JSON.parse(filteredImages);
        } catch (e) {
          filteredImages = [];
        }
      }
      if (!Array.isArray(filteredImages)) {
        filteredImages = [];
      }

      return {
        id: article._id?.toString() || article._id,
        title: article.title,
        description: article.description || "",
        author: article.author || "Anonymous",
        topic: article.topic,
        date: article.published_at?.toString() || article.date || "",
        filtered_images: filteredImages,
        hero_image: article.hero_image || null,
        content: article.content || "",
      };
    });

    return new Response(JSON.stringify(processedArticles), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching related articles:", error);
    return new Response(
      JSON.stringify({
        message: "Error fetching related articles",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
