import { MongoClient } from "mongodb";
const uri = process.env.DATABASE_URL;
const client = new MongoClient(uri);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const titleName = searchParams.get("title");

  if (topicName) {
    try {
      await client.connect();
      const collection = client
        .db("ARTICLES")
        .collection(titleName.toLowerCase() + "_articles");

      const articles = await collection.find({}).toArray();
      const topicDetails = articles.map((article) => ({
        title: article.title,
        content: article.content,
        author: article.author,
        date: article.date,
      }));

      return new Response(JSON.stringify(topicDetails), { status: 200 });
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

  // If no specific topic is requested, return all topics
  // Your existing logic for fetching all topics here...
}
