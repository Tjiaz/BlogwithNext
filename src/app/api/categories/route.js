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
    const { db } = await connectToDatabase();
    const collection = db.collection("Articles");

    // Get all unique topics
    const topics = await collection.distinct("topic");
    
    // For each topic, get a random article
    const articles = [];
    for (const topic of topics.slice(skip, skip + limit)) {
      const topicArticles = await collection
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
        .toArray();
      
      if (topicArticles.length > 0) {
        // Get a random article from this topic
        const randomIndex = Math.floor(Math.random() * topicArticles.length);
        articles.push(topicArticles[randomIndex] || topicArticles[0]);
      }
    }

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
    return new Response(
      JSON.stringify({ message: "Error fetching articles", error: error.message }),
      { status: 500 }
    );
  }
}
