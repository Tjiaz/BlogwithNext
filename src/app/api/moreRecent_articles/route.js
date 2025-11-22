import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL;
const client = new MongoClient(uri);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page"), 10) || 1; // Default to 1 if page is not provided
  const limit = 8; // Number of articles per page
  const skip = (page - 1) * limit; // Calculate how many articles to skip
  const databaseName = "ARTICLES"; // Your MongoDB database name

  try {
    await client.connect();
    const collection = client.db(databaseName).collection("Topic");

    // Fetch all articles from the Topic collection
    const topics = await collection.find().toArray();

    let results = [];

    // Combine all articles from each topic
    topics.forEach((topic) => {
      if (topic.articles && topic.articles.length > 0) {
        const recent_articles_topic = topic.articles.map((latest_article) => ({
          ...latest_article,
          topic: topic.name,
        }));
        results.push(...recent_articles_topic);
      }
    });

    // Sort all combined articles by date in descending order (newest first)
    results.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Paginate: skip the first 'skip' articles and return the next 'limit' articles
    const paginatedArticles = results.slice(skip, skip + limit);

    // Process the results as needed (e.g., deduplicate, format)
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
