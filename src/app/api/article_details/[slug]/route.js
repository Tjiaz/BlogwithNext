// api/article_details/[slug]/route.js
import { MongoClient, ObjectId } from "mongodb";
const uri = process.env.DATABASE_URL;
const client = new MongoClient(uri);

export async function GET(req, { params }) {
  const articleSlug = params.slug;

  if (!articleSlug) {
    return new Response(JSON.stringify({ message: "No articleID provided" }), {
      status: 400,
    });
  }

  try {
    await client.connect();

    const collection = client.db("ARTICLES").collection("Topic");
    const topic = await collection.findOne({
      "articles._id": new ObjectId(articleSlug),
    });

    if (!topic || !topic.articles || topic.articles.length === 0) {
      console.error("No articles found.");
      return new Response(JSON.stringify({ error: "Articles Not Found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const article = topic.articles.find(
      (article) => article._id.toString() === articleSlug
    );

    if (!article) {
      console.error("Article not found.");
      return new Response(JSON.stringify({ message: "Article not found" }), {
        status: 404,
      });
    }

    return new Response(
      JSON.stringify({
        filtered_images: article.filtered_images,
        title: article.title,
        description: article.description,
        content: article.content,
        author: article.author,
        topic: article.topic,
        date: article.date,
        id: article._id.toString(), // Include the ID in the response
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
  } finally {
    await client.close();
  }
}
