import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL;
const client = new MongoClient(uri);

export async function GET(req) {
  const databaseName = "ARTICLES"; // Your MongoDB database name
  const years = [2024, 2023]; // Define the years for which to fetch articles
  const limit = 5; // Number of top articles per year

  try {
    await client.connect();
    const collection = client.db(databaseName).collection("Topic");

    let results = {};
    let seenArticles = new Set();

    // Loop through the years
    for (const year of years) {
      let yearResults = [];

      // Fetch all articles from the Topic collection
      const topics = await collection.find().toArray();

      topics.forEach((topic) => {
        if (topic.articles && topic.articles.length > 0) {
          // Fetch the top articles for the given year using aggregation
          const articles = topic.articles.filter((article) => {
            const articleDate = new Date(article.date);
            return articleDate.getFullYear() === year;
          });

          // Sort articles by date in descending order (newest first)
          const sortedArticles = articles.sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          );

          // Only add non-duplicate articles
          sortedArticles.slice(0, limit).forEach((article) => {
            const articleKey = `${article.title}-${article.date}`;
            if (!seenArticles.has(articleKey)) {
              seenArticles.add(articleKey);
              yearResults.push({
                ...article,
                topic: topic.name,
              });
            }
          });
        }
      });

      // Sort the results for the year by date (newest first)
      yearResults.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Take the top results for the year
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
          id: article._id.toString(),
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
