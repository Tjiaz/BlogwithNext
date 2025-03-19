// import { MongoClient } from "mongodb";

// const uri = process.env.DATABASE_URL;
// const client = new MongoClient(uri);

// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const page = parseInt(searchParams.get("page"), 10) || 1;
//   const limit = 8;
//   const skip = (page - 1) * limit;
//   const databaseName = "ARTICLES";

//   try {
//     await client.connect();
//     const collection = client.db(databaseName).collection("Topic");

//     // Fetch all articles from the Topic collection
//     const topics = await collection.find().toArray();

//     if (!Array.isArray(topics)) {
//       throw new Error("Expected an array of topics");
//     }
//     console.log("=== DEBUGGING ARTICLE RETRIEVAL ===");
//     console.log(`Total Topics Found: ${topics.length}`);

//     let results = [];
//     let seenArticles = new Set();

//     // Combine articles from all topics
//     topics.forEach((topic) => {
//       if (Array.isArray(topic.articles)) {
//         console.log("Articles in this topic:", topic.articles.length);
//         topic.articles.forEach((article) => {
//           const articleKey = `${article.title}-${article.date}`;
//           if (!seenArticles.has(articleKey)) {
//             seenArticles.add(articleKey);

//             results.push({
//               ...article,
//               topic: topic.name,
//             });
//           }
//         });
//       }
//     });

//     // Sort all combined articles by date
//     results.sort((a, b) => {
//       const dateA = new Date(a.date);
//       const dateB = new Date(b.date);

//       return dateB - dateA;
//     });

//     // Apply pagination after deduplication
//     const paginatedArticles = results.slice(skip, skip + limit);

//     // Process the results
//     const processedResults = paginatedArticles.map((article) => ({
//       filtered_images: article.filtered_images,
//       title: article.title,
//       description: article.description,
//       author: article.author,
//       date: article.date,
//       content: article.content,
//       topic: article.topic,
//       id: article._id.toString(),
//     }));

//     return new Response(JSON.stringify(processedResults), { status: 200 });
//   } catch (error) {
//     console.error("Error fetching articles:", error);
//     return new Response(
//       JSON.stringify({ message: "Error fetching articles" }),
//       { status: 500 }
//     );
//   } finally {
//     await client.close();
//   }
// }

import { MongoClient, ObjectId } from "mongodb";

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

    // Find the specific topic where you added the new article
    const topicToInvestigate = await collection.findOne({
      name: "python_articles", // Replace with the exact topic name
    });

    if (topicToInvestigate) {
      console.log("\n=== DETAILED INVESTIGATION OF PYTHON ARTICLES ===");
      console.log(
        `Total Articles in Python Topic: ${
          topicToInvestigate.articles?.length || 0
        }`
      );

      // Detailed logging of the most recent articles
      if (topicToInvestigate.articles) {
        const recentArticles = topicToInvestigate.articles
          .sort(
            (a, b) =>
              new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
          )
          .slice(0, 5); // Get the 5 most recent articles

        recentArticles.forEach((article, index) => {
          console.log(`\nRecent Article ${index + 1}:`);
          console.log(`Title: ${article.title}`);
          console.log(`Date: ${article.date}`);
          console.log(`Created At: ${article.createdAt}`);
          console.log(`Author: ${article.author}`);
          console.log(`Description: ${article.description}`);

          // Check content structure
          console.log("Content Structure:");
          console.log(JSON.stringify(article.content, null, 2));

          // Check ID
          if (article._id) {
            console.log(`Article ID: ${article._id}`);
            console.log(`Article ID Type: ${typeof article._id}`);
          } else {
            console.log("WARNING: No _id found for this article");
          }
        });
      }
    }

    // Original aggregation logic
    const aggregatedResults = await collection
      .aggregate([
        { $unwind: "$articles" },
        { $sort: { "articles.createdAt": -1 } },
        {
          $project: {
            title: "$articles.title",
            description: "$articles.description",
            date: "$articles.date",
            author: "$articles.author",
            content: "$articles.content",
            topic: "$name",
            articleId: "$articles._id",
            createdAt: "$articles.createdAt",
          },
        },
      ])
      .toArray();

    console.log("\n=== AGGREGATED RESULTS ===");
    console.log(`Total Aggregated Articles: ${aggregatedResults.length}`);

    // Process and return results
    const processedResults = aggregatedResults.map((article) => ({
      title: article.title,
      description: article.description,
      date: article.date,
      author: article.author,
      content: article.content,
      topic: article.topic.replace("_articles", ""),
      id: article.articleId ? article.articleId.toString() : null,
      filtered_images: [], // Add if you have image processing
      createdAt: article.createdAt,
    }));

    console.log("\n=== PROCESSED RESULTS ===");
    processedResults.slice(0, 5).forEach((result, index) => {
      console.log(`Result ${index + 1}:`);
      console.log(JSON.stringify(result, null, 2));
    });

    return new Response(JSON.stringify(processedResults), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("CRITICAL ERROR in article retrieval:", error);
    return new Response(
      JSON.stringify({
        message: "Comprehensive error in fetching articles",
        errorDetails: error.message,
        stack: error.stack,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await client.close();
  }
}
