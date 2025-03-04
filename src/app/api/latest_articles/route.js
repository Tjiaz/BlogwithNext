import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL;
const client = new MongoClient(uri);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page"), 10) || 1;
  const limit = 8;
  const skip = (page - 1) * limit;
  const databaseName = "ARTICLES";

  try {
    await client.connect();
    const collection = client.db(databaseName).collection("Topic");

    // Fetch all articles from the Topic collection
    const topics = await collection.find().toArray();

    if (!Array.isArray(topics)) {
      throw new Error("Expected an array of topics");
    }

    let results = [];
    let seenArticles = new Set();

    // Combine articles from all topics
    topics.forEach((topic) => {
      if (Array.isArray(topic.articles)) {
        topic.articles.forEach((article) => {
          const articleKey = `${article.title}-${article.date}`;
          if (!seenArticles.has(articleKey)) {
            seenArticles.add(articleKey);
            results.push({
              ...article,
              topic: topic.name,
            });
          }
        });
      }
    });

    // Sort all combined articles by date
    results.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Apply pagination after deduplication
    const paginatedArticles = results.slice(skip, skip + limit);

    // Process the results
    const processedResults = paginatedArticles.map((article) => ({
      filtered_images: article.filtered_images,
      title: article.title,
      description: article.description,
      author: article.author,
      date: article.date,
      content: article.content,
      topic: article.topic,
      id: article._id.toString(),
    }));

    return new Response(JSON.stringify(processedResults), { status: 200 });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return new Response(
      JSON.stringify({ message: "Error fetching articles" }),
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
