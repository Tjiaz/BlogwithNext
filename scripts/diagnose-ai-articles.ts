// Diagnostic script to check what's in the database
// Run with: npm run diagnose:ai

import clientPromise from "../lib/mongodb";

async function diagnoseAIArticles() {
  try {
    console.log("🔍 Diagnosing AI articles...");
    console.log("=====================================\n");

    const client = await clientPromise;
    const db = client.db("ARTICLES");
    const articlesCollection = db.collection("final_articles");

    // Check different variations of AI topic
    const aiVariations = ["AI", "ai", "Ai", "Artificial Intelligence"];
    
    for (const variation of aiVariations) {
      const count = await articlesCollection.countDocuments({ topic: variation });
      console.log(`Topic "${variation}": ${count} articles`);
    }

    // Get sample articles
    console.log("\n📋 Sample articles with topic 'AI':");
    const sampleArticles = await articlesCollection
      .find({ topic: "AI" })
      .limit(10)
      .toArray();

    sampleArticles.forEach((article, index) => {
      console.log(`\n${index + 1}. Title: "${article.title}"`);
      console.log(`   Topic: "${article.topic}"`);
      console.log(`   Has "machine learning" in title: ${article.title?.toLowerCase().includes("machine learning") || false}`);
      console.log(`   Description: ${article.description?.substring(0, 100) || "N/A"}...`);
    });

    // Check for articles with "machine learning" in title
    console.log("\n🔍 Checking for 'machine learning' in AI articles:");
    const mlInTitle = await articlesCollection
      .find({
        topic: "AI",
        title: { $regex: /machine learning/i }
      })
      .toArray();
    
    console.log(`Found ${mlInTitle.length} articles with "machine learning" in title`);
    
    if (mlInTitle.length > 0) {
      console.log("\nSample titles:");
      mlInTitle.slice(0, 5).forEach((article, index) => {
        console.log(`${index + 1}. "${article.title}"`);
      });
    }

    // Check if ml topic exists
    const topicsCollection = db.collection("topics");
    const mlTopic = await topicsCollection.findOne({ name: "ml" });
    console.log(`\n📌 ML topic exists: ${mlTopic ? "Yes" : "No"}`);
    if (mlTopic) {
      console.log(`   ML topic:`, mlTopic);
    }

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    process.exit(0);
  }
}

diagnoseAIArticles();
