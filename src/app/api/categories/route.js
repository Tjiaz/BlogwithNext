import { connectToDatabase } from "@/utils/mongodb";

export const dynamic = 'force-dynamic';

function formatTopicName(topicName) {
  return topicName
    .replace(/_articles$/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page"), 10) || 1;
  const limit = 4;
  const skip = (page - 1) * limit;

  try {
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL environment variable is not set");
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const { db } = await connectToDatabase();
    const collection = db.collection("Articles");

    // Get all unique topics with timeout
    const topics = await Promise.race([
      collection.distinct("topic"),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 8000)
      )
    ]);
    
    // For each topic, get a random article (limit to avoid too many queries)
    const articles = [];
    const topicsToProcess = topics.slice(skip, skip + limit);
    
    // Process topics in parallel with timeout
    const articlePromises = topicsToProcess.map(async (topic) => {
      try {
        const topicArticles = await Promise.race([
          collection
            .find({ topic: topic })
            .project({
              _id: 1,
              title: 1,
              description: 1,
              author: 1,
              date: 1,
              topic: 1,
              filtered_images: 1,
            })
            .limit(10) // Limit results for faster query
            .toArray(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Query timeout')), 5000)
          )
        ]);
        
        if (topicArticles.length > 0) {
          const randomIndex = Math.floor(Math.random() * topicArticles.length);
          return topicArticles[randomIndex] || topicArticles[0];
        }
        return null;
      } catch (error) {
        console.warn(`Error fetching articles for topic ${topic}:`, error);
        return null;
      }
    });
    
    const results = await Promise.all(articlePromises);
    articles.push(...results.filter(article => article !== null));

    // Format topic names and process results
    const processedResults = articles.map((article) => ({
      id: article._id.toString(),
      title: article.title,
      description: article.description,
      author: article.author,
      date: article.date,
      topic: formatTopicName(article.topic || ""),
      filtered_images: article.filtered_images || [],
    }));

    return new Response(JSON.stringify(processedResults), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    // Return empty array instead of error to prevent frontend issues
    return new Response(
      JSON.stringify([]),
      { 
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
