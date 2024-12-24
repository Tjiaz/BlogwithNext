import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL;
const client = new MongoClient(uri);

export async function GET(req) {
  const databaseName = "ARTICLES"; // Your MongoDB database name
  const years = [2023, 2022, 2021, 2020]; // Define the years for which to fetch articles
  const limit = 5; // Number of top articles per year

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
      { name: "data_engineer_articles", topic: "Data Engineering" },
      { name: "data_science_articles", topic: "Data Science" },
      { name: "language_model_articles", topic: "Language Models" },
      { name: "machine_learning_articles", topic: "Machine Learning" },
      { name: "machine_learning_ops_articles", topic: "MLOps" },
      { name: "programming_articles", topic: "Programming" },
    ];

    let results = {};

    // Loop through the years
    for (const year of years) {
      let yearResults = [];

      for (const { name: collectionName, topic } of collectionsToQuery) {
        const collection = client.db(databaseName).collection(collectionName);

        // Fetch the top 5 articles for the given year sorted by date in descending order
        const articles = await collection
          .find({
            date: {
              $gte: new Date(`${year}-01-01T00:00:00Z`),
              $lte: new Date(`${year}-12-31T23:59:59Z`),
            },
          })
          .sort({ date: -1 }) // Sort by date, newest first
          .limit(limit)
          .toArray();

        // Add the articles to the year's results
        if (articles.length > 0) {
          yearResults.push(
            ...articles.map((article) => ({
              ...article,
              topic,
            }))
          );
        }
      }

      // Shuffle the results for the year
      yearResults = yearResults.sort(() => Math.random() - 0.5);

      // Take the top 5 results for the year if more than 5 articles are available
      results[year] = yearResults.slice(0, limit);
    }

    // Process the results as needed
    const processedResults = years.map((year) => ({
      year,
      articles:
        results[year]?.map((article) => ({
          filtered_images: article.filtered_images,
          title: article.title,
          description: article.description,
          author: article.author,
          date: article.date,
          content: article.content,
          topic: article.topic,
          id: article._id,
        })) || [], // If no articles for the year, return an empty array
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
