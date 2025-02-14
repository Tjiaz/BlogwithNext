import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL;
const client = new MongoClient(uri);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page"), 8) || 1;
  const limit = 8;
  const skip = (page - 1) * limit;
  const databaseName = "ARTICLES";

  try {
    await client.connect();
    const collectionsToQuery = [
      {
        name: "Artificial_intelligence_articles",
        topic: "Artificial Intelligence",
      },
      { name: "NLP_articles", topic: "Natural Language Processing" },
      { name: "SQL_articles", topic: "SQL" },
      { name: "career_advice_articles", topic: "Career Advice" },
      { name: "computer_vision_articles", topic: "Computer Vision" },
      { name: "data_engineering_articles", topic: "Data Engineering" },
      { name: "data_science_articles", topic: "Data Science" },
      { name: "language_model_articles", topic: "Language Models" },
      { name: "machine_learning_articles", topic: "Machine Learning" },
      { name: "machine_learning_ops_articles", topic: "Machine Learning Ops" },
      { name: "programming_articles", topic: "Programming" },
    ];

    let results = [];
    let seenArticles = new Set();

    for (const { name: collectionName, topic } of collectionsToQuery) {
      const collection = client.db(databaseName).collection(collectionName);

      // Fetch articles with parsed dates
      const articles = await collection
        .aggregate([
          {
            $addFields: {
              parsedDate: {
                $dateFromString: {
                  dateString: "$date",
                  format: "%b %d, %Y",
                },
              },
            },
          },
          {
            $sort: { parsedDate: -1 },
          },
        ])
        .toArray();

      // Only add non-duplicate articles
      articles.forEach((article) => {
        const articleKey = `${article.title}-${article.date}`;
        if (!seenArticles.has(articleKey)) {
          seenArticles.add(articleKey);
          results.push({
            ...article,
            topic,
          });
        }
      });
    }

    // Sort all combined articles by parsed date
    results.sort((a, b) => new Date(b.parsedDate) - new Date(a.parsedDate));

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
