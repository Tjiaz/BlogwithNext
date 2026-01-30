// Force update script - updates ALL AI articles that contain "machine learning"
// This uses a more aggressive approach with updateMany
// Run with: npx tsx scripts/force-update-ml.ts

import clientPromise from "../lib/mongodb";

async function forceUpdateML() {
  try {
    console.log("🚀 Force updating ML articles...");
    console.log("=====================================\n");

    const client = await clientPromise;
    const db = client.db("ARTICLES");
    const articlesCollection = db.collection("final_articles");
    const topicsCollection = db.collection("topics");

    // Ensure ml topic exists
    await topicsCollection.updateOne(
      { name: "ml" },
      {
        $setOnInsert: {
          name: "ml",
          display_name: "ML",
          created_at: new Date(),
        },
      },
      { upsert: true }
    );
    console.log("✓ Ensured ML topic exists\n");

    // Count before
    const beforeCount = await articlesCollection.countDocuments({ topic: "AI" });
    console.log(`📊 Articles with topic "AI" before: ${beforeCount}\n`);

    // Use updateMany with proper query
    const updateResult = await articlesCollection.updateMany(
      {
        topic: "AI",
        $or: [
          { title: { $regex: /machine learning/i } },
          { description: { $regex: /machine learning/i } },
          { content: { $regex: /machine learning/i } },
        ],
      },
      {
        $set: {
          topic: "ml",
        },
      }
    );

    console.log("=====================================");
    console.log(`📈 Update Result:`);
    console.log(`   Matched: ${updateResult.matchedCount}`);
    console.log(`   Modified: ${updateResult.modifiedCount}`);
    console.log("=====================================\n");

    // Verify
    const afterCount = await articlesCollection.countDocuments({ topic: "AI" });
    const mlCount = await articlesCollection.countDocuments({ topic: "ml" });

    console.log("📊 Verification:");
    console.log(`   Articles with AI topic now: ${afterCount}`);
    console.log(`   Articles with ML topic now: ${mlCount}`);
    console.log(`   Expected reduction: ${beforeCount - afterCount} articles moved\n`);

    // Show some examples of what was updated
    const updatedArticles = await articlesCollection
      .find({ topic: "ml" })
      .limit(10)
      .toArray();

    if (updatedArticles.length > 0) {
      console.log("Sample ML articles:");
      updatedArticles.forEach((article, index) => {
        console.log(`${index + 1}. "${article.title}"`);
      });
    }

    console.log("\n✅ Done!");
  } catch (error) {
    console.error("❌ Error:", error);
    if (error instanceof Error) {
      console.error("Details:", error.message);
    }
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

forceUpdateML();
