// Fixed script to properly move ML articles from AI to ML
// This uses the correct MongoDB query structure
// Run with: npx tsx scripts/fix-ml-categorization.ts

import clientPromise from "../lib/mongodb";

async function fixMLCategorization() {
  try {
    console.log("🚀 Fixing ML categorization...");
    console.log("=====================================\n");

    const client = await clientPromise;
    const db = client.db("ARTICLES");
    const articlesCollection = db.collection("final_articles");
    const topicsCollection = db.collection("topics");

    // Step 1: Ensure ml topic exists
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

    // Step 2: Check current state
    const aiCount = await articlesCollection.countDocuments({ topic: "AI" });
    console.log(`📊 Articles with topic "AI" before: ${aiCount}\n`);

    // Step 3: Find articles to update (using $and to properly combine conditions)
    const query = {
      $and: [
        { topic: "AI" },
        {
          $or: [
            { title: { $regex: /machine learning/i } },
            { description: { $regex: /machine learning/i } },
            { content: { $regex: /machine learning/i } },
          ],
        },
      ],
    };

    // First, let's see what we'll update
    const articlesToUpdate = await articlesCollection.find(query).toArray();
    console.log(`📋 Found ${articlesToUpdate.length} articles to update:\n`);

    if (articlesToUpdate.length === 0) {
      console.log("⚠️  No articles found matching criteria!");
      console.log("\nLet's check what AI articles exist...\n");
      
      const sampleAI = await articlesCollection
        .find({ topic: "AI" })
        .limit(10)
        .toArray();
      
      sampleAI.forEach((article, index) => {
        const title = article.title || "No title";
        const hasML = title.toLowerCase().includes("machine learning") ||
                     (article.description || "").toLowerCase().includes("machine learning");
        console.log(`${index + 1}. "${title.substring(0, 70)}"`);
        console.log(`   Has "machine learning": ${hasML ? "✓ YES" : "✗ NO"}`);
      });
      
      return;
    }

    // Show what will be updated
    articlesToUpdate.slice(0, 10).forEach((article, index) => {
      console.log(`${index + 1}. "${article.title?.substring(0, 70)}"`);
    });
    if (articlesToUpdate.length > 10) {
      console.log(`... and ${articlesToUpdate.length - 10} more`);
    }

    // Step 4: Update using updateMany with the correct query structure
    console.log("\n🔄 Updating articles...\n");
    
    const updateResult = await articlesCollection.updateMany(query, {
      $set: { topic: "ml" },
    });

    console.log("=====================================");
    console.log(`📈 Update Result:`);
    console.log(`   Matched: ${updateResult.matchedCount}`);
    console.log(`   Modified: ${updateResult.modifiedCount}`);
    console.log("=====================================\n");

    // Step 5: Verify
    const afterAICount = await articlesCollection.countDocuments({ topic: "AI" });
    const mlCount = await articlesCollection.countDocuments({ topic: "ml" });

    console.log("📊 Verification:");
    console.log(`   Articles with AI topic now: ${afterAICount}`);
    console.log(`   Articles with ML topic now: ${mlCount}`);
    console.log(`   Reduction: ${aiCount - afterAICount} articles moved\n`);

    // Show some updated articles
    const updatedSample = await articlesCollection
      .find({ topic: "ml" })
      .limit(5)
      .toArray();

    if (updatedSample.length > 0) {
      console.log("Sample updated articles:");
      updatedSample.forEach((article, index) => {
        console.log(`${index + 1}. "${article.title?.substring(0, 70)}"`);
      });
    }

    console.log("\n✅ Done!");
  } catch (error) {
    console.error("❌ Error:", error);
    if (error instanceof Error) {
      console.error("Details:", error.message);
      console.error("Stack:", error.stack);
    }
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

fixMLCategorization();
