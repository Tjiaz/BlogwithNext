import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL;
const client = new MongoClient(uri);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page"), 8) || 1; // Default to 1 if page is not provided
  const limit = 8; // Number of articles per page
  const skip = (page - 1) * limit; // Calculate how many articles to skip
  const databaseName = "ARTICLES"; // Your MongoDB database name

  try {
    await client.connect();
    const collectionsToQuery = [
      { name: "Artificial_intelligence_articles",topic: "Artificial Intelligence"},
      { name: "NLP_articles", topic: "Natural Language Processing" },
      { name: "SQL_articles", topic: "SQL" },
      { name: "career_advice_articles", topic: "Career Advice" },
      { name: "computer_vision_articles", topic: "Computer Vision" },
      { name: "data_engineer_articles", topic: "Data Engineering" },
      { name: "data_science_articles", topic: "Data Science" },
      { name: "language_model_articles", topic: "Language Models" },
      { name: "machine_learning_articles", topic: "Machine Learning" },
      { name: "machine_learning_ops_articles", topic: "MLOps" },
      { name: "programming_articles", topic: "Programming" },
    ];

    let results = [];
    for (const { name: collectionName, topic } of collectionsToQuery) {
      const collection = client.db(databaseName).collection(collectionName);

      // Fetch articles sorted by date in descending order
      const latest_articles = await collection
        .find({})
        .sort({ date: -1 }) // Sort by date, newest first
        .toArray();

      const latest_articles_topic = latest_articles.map((latest_article) => ({
        ...latest_article,
        topic,
      }));

      results.push(...latest_articles_topic);
    }

    // Sort all combined articles by date
    results.sort((a, b) => new Date(b.date) - new Date(a.date));

    const paginatedArticles = results.slice(skip, skip + limit);

    // Process the results as needed (e.g., deduplicate, format)
    const processedResults = paginatedArticles.map((article) => {
      // Modify the article structure as desired
      return {
        filtered_images: article.filtered_images,
        title: article.title,
        description: article.description,
        author: article.author,
        date: article.date,
        content: article.content,
        topic: article.topic,
        id: article._id.toString(),
      };
    });
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
