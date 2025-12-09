import { connectToDatabase } from "@/utils/mongodb";
import { ObjectId } from "mongodb";

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  const articleSlug = params.slug;

  if (!articleSlug) {
    return new Response(JSON.stringify({ message: "No articleID provided" }), {
      status: 400,
    });
  }

  try {
    const { db } = await connectToDatabase();

    // Try Articles collection first (faster, flattened structure)
    let article = null;
    let collection = db.collection("Articles");
    
    try {
      article = await collection.findOne({
        _id: new ObjectId(articleSlug),
      });
    } catch (idError) {
      // If ObjectId conversion fails, try Topic collection
      console.log("Trying Topic collection for article:", articleSlug);
    }

    // If not found in Articles, try Topic collection (for backward compatibility)
    if (!article) {
      collection = db.collection("Topic");
      const topic = await collection.findOne({
        "articles._id": new ObjectId(articleSlug),
      });

      if (topic && topic.articles) {
        article = topic.articles.find(
          (art) => art._id.toString() === articleSlug
        );
        if (article) {
          article.topic = topic.name;
        }
      }
    }

    // If still not found, try Article collection (new structure)
    if (!article) {
      collection = db.collection("Article");
      try {
        article = await collection.findOne({
          _id: articleSlug, // Article collection uses string IDs
        });
        if (article) {
          // Transform Article collection format to expected format
          article = {
            _id: article._id,
            title: article.title,
            description: article.description,
            content: article.content,
            author: article.author,
            topic: article.topic,
            date: article.date ? new Date(article.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }) : new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            filtered_images: [], // Extract from content if needed
          };
        }
      } catch (error) {
        console.log("Article not found in Article collection");
      }
    }

    if (!article) {
      return new Response(JSON.stringify({ error: "Article Not Found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(
      JSON.stringify({
        filtered_images: article.filtered_images || [],
        title: article.title,
        description: article.description,
        content: article.content,
        author: article.author,
        topic: article.topic,
        date: article.date,
        id: article._id?.toString() || article._id,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching article details:", error);
    return new Response(
      JSON.stringify({
        message: "Error fetching article details",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
