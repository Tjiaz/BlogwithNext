import { MongoClient, ObjectId } from "mongodb";
const uri = process.env.DATABASE_URL;
const client = new MongoClient(uri);

const collectionNames = [
  "Artificial_intelligence_articles",
  "NLP_articles",
  "SQL_articles",
  "career_advice_articles",
  "computer_vision_articles",
  "data_engineer_articles",
  "data_science_articles",
  "language_model_articles",
  "machine_learning_articles",
  "machine_learning_ops_articles",
  "programming_articles",
  "py_articles",
];

export async function GET(req, { params }) {
  const articleSlug = params.slug;
  console.log("Article slug:", JSON.stringify(articleSlug, null, 2));

  const { searchParams } = new URL(req.url);

  if (articleSlug) {
    try {
      await client.connect();
      console.log("Connected to MongoDB successfully.");

      let article = null;
      for (const collectionName of collectionNames) {
        const collection = client.db("ARTICLES").collection(collectionName);

        //check for an article with the provided _id
        article = await collection.findOne({ _id: new ObjectId(articleSlug) });

        if (article) break;
      }

      if (article) {
        return new Response(
          JSON.stringify({
            filtered_images: article.filtered_images,
            title: article.title,
            content: article.content,
            author: article.author,
            topic: article.topic,
            date: article.date,
          }),
          { status: 200 }
        );
      } else {
        return new Response(JSON.stringify(topicDetails), { status: 200 });
      }
    } catch (error) {
      console.error("Error fetching topic details:", error);
      return new Response(
        JSON.stringify({ message: "Error fetching topic details" }),
        { status: 500 }
      );
    } finally {
      await client.close();
    }
  }
  //if no specific articleID is requested
  return new Response(JSON.stringify({ message: "No articleID provided" }), {
    status: 400,
  });
}
