// lib/featuredArticles.js
import { getDb } from "./mongo.js";

export async function getFeaturedArticles() {
  const db = await getDb();
  const collection = db.collection("Topic");

  // Build today's date string in the same format you already use
  const today = new Date();
  const todayString = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Get all topics
  const topics = await collection.find().toArray();

  const allArticles = [];

  // Flatten all topic.articles once and decorate with topic + URL
  topics.forEach((topic) => {
    if (Array.isArray(topic.articles)) {
      topic.articles.forEach((article) => {
        allArticles.push({
          ...article,
          topic: topic.name,
          url: `${process.env.NEXT_PUBLIC_DOMAIN}/article_details/${article._id?.toString?.() ?? article._id}`,
        });
      });
    }
  });

  // First try: articles with today's date
  const todaysArticles = allArticles.filter(
    (article) => article.date === todayString
  );

  let featuredArticles;

  if (todaysArticles.length > 0) {
    featuredArticles = todaysArticles;
  } else {
    // Fallback: most recent 3 by date
    allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
    featuredArticles = allArticles.slice(0, 3);
  }

  return featuredArticles;
}
