import { connectToDatabase } from "@/utils/mongodb";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const articleSlug = params.slug;

  if (!articleSlug) {
    return new Response(JSON.stringify({ message: "No articleID provided" }), {
      status: 400,
    });
  }

  try {
    const { db } = await connectToDatabase();

    // Helper function to check if string is a valid ObjectId
    const isValidObjectId = (str) => {
      return /^[0-9a-fA-F]{24}$/.test(str);
    };

    // Try final_articles collection first (new unified collection)
    let article = null;

    // Try ObjectId first if it's a valid format, otherwise try string match
    if (isValidObjectId(articleSlug)) {
      try {
        const finalArticlesCollection = db.collection("final_articles");
        article = await finalArticlesCollection.findOne({
          _id: new ObjectId(articleSlug),
        });
      } catch (idError) {
        // If ObjectId conversion fails, try with string ID
        console.log("ObjectId search failed, trying string match for:", articleSlug);
      }
    }

    // If not found and not a valid ObjectId, try string match
    if (!article && !isValidObjectId(articleSlug)) {
      try {
        const finalArticlesCollection = db.collection("final_articles");
        article = await finalArticlesCollection.findOne({
          _id: articleSlug, // Try matching as string ID
        });
      } catch (error) {
        console.log("String ID match failed for:", articleSlug);
      }
    }

    // If not found in final_articles, try old collections (for backward compatibility)
    if (!article) {
      let collection = db.collection("Articles");
      if (isValidObjectId(articleSlug)) {
        try {
          article = await collection.findOne({
            _id: new ObjectId(articleSlug),
          });
        } catch (idError) {
          console.log("Articles collection ObjectId search failed");
        }
      }

      // If not found in Articles, try Topic collection
      if (!article) {
        collection = db.collection("Topic");
        if (isValidObjectId(articleSlug)) {
          try {
            const topic = await collection.findOne({
              "articles._id": new ObjectId(articleSlug),
            });

            if (topic && topic.articles) {
              article = topic.articles.find(
                (art) => art._id?.toString() === articleSlug
              );
              if (article) {
                article.topic = topic.name;
              }
            }
          } catch (error) {
            console.log("Error searching Topic collection:", error.message);
          }
        } else {
          // Try finding by string ID in nested articles
          try {
            const topics = await collection.find({}).toArray();
            for (const topic of topics) {
              if (topic.articles && Array.isArray(topic.articles)) {
                article = topic.articles.find(
                  (art) => art._id?.toString() === articleSlug || art._id === articleSlug
                );
                if (article) {
                  article.topic = topic.name;
                  break;
                }
              }
            }
          } catch (error) {
            console.log("Error searching Topic collection by string:", error.message);
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
              date: article.date
                ? new Date(article.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : new Date().toLocaleDateString("en-US", {
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
