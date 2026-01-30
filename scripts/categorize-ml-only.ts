// Simple script to move "machine learning" articles from AI to ML topic
// Run with: npx tsx scripts/categorize-ml-only.ts

import clientPromise from "../lib/mongodb";

async function categorizeMLArticles() {
  try {
    console.log("🚀 Starting ML categorization...");
    console.log("=====================================\n");

    const client = await clientPromise;
    const db = client.db("ARTICLES");
    const articlesCollection = db.collection("final_articles");
    const topicsCollection = db.collection("topics");

    // Step 1: Check current state
    const aiCount = await articlesCollection.countDocuments({ topic: "AI" });
    const aiLowerCount = await articlesCollection.countDocuments({ topic: "ai" });
    
    console.log(`📊 Articles with topic "AI": ${aiCount}`);
    console.log(`📊 Articles with topic "ai": ${aiLowerCount}\n`);

    // Step 2: Ensure "ml" topic exists
    let mlTopic = await topicsCollection.findOne({ name: "ml" });

    if (!mlTopic) {
      const insertResult = await topicsCollection.insertOne({
        name: "ml",
        display_name: "ML",
        created_at: new Date(),
      });
      mlTopic = {
        _id: insertResult.insertedId,
        name: "ml",
      };
      console.log("✓ Created topic: ml\n");
    } else {
      console.log("✓ Topic 'ml' already exists\n");
    }

    // Step 3: Find all articles with topic "AI" that contain "machine learning"
    // Fix: Use proper MongoDB query structure
    const aiArticles = await articlesCollection
      .find({
        topic: "AI", // Check exact match first
        $or: [
          { title: { $regex: /machine learning/i } },
          { description: { $regex: /machine learning/i } },
          { content: { $regex: /machine learning/i } },
        ],
      })
      .toArray();

    console.log(
      `📊 Found ${aiArticles.length} articles with "machine learning" in AI topic\n`
    );

    if (aiArticles.length === 0) {
      console.log("⚠️  No articles found! Let's check what's in the database...\n");
      
      // Show some sample AI articles
      const sampleAI = await articlesCollection
        .find({ topic: "AI" })
        .limit(10)
        .toArray();
      
      console.log("Sample AI articles (first 10):");
      sampleAI.forEach((article, index) => {
        const hasML = article.title?.toLowerCase().includes("machine learning") || 
                     article.description?.toLowerCase().includes("machine learning");
        console.log(`${index + 1}. "${article.title}"`);
        console.log(`   Has "machine learning": ${hasML ? "✓ YES" : "✗ NO"}`);
      });
      
      return;
    }

    // Step 4: Update each article
    let updatedCount = 0;
    let errorCount = 0;

    console.log("Updating articles...\n");

    for (const doc of aiArticles) {
      try {
        const updateResult = await articlesCollection.updateOne(
          { _id: doc._id },
          {
            $set: {
              topic: "ml",
            },
          }
        );

        if (updateResult.modifiedCount > 0) {
          updatedCount++;
          const titlePreview = doc.title
            ? doc.title.substring(0, 80)
            : "No title";
          console.log(`${updatedCount}. ✓ Updated: "${titlePreview}" → ml`);
        } else {
          console.log(`⚠️  No change for: "${doc.title?.substring(0, 50)}"`);
        }
      } catch (error: any) {
        errorCount++;
        console.error(`❌ Error updating article ${doc._id}:`, error.message);
      }
    }

    console.log("\n=====================================");
    console.log(`📈 Total articles updated: ${updatedCount}`);
    if (errorCount > 0) {
      console.log(`⚠️  Errors encountered: ${errorCount}`);
    }
    
    // Verify the update
    const remainingAI = await articlesCollection.countDocuments({ topic: "AI" });
    const mlCount = await articlesCollection.countDocuments({ topic: "ml" });
    
    console.log(`\n📊 Verification:`);
    console.log(`   Articles still with AI topic: ${remainingAI}`);
    console.log(`   Articles now with ML topic: ${mlCount}`);
    console.log("=====================================");
    console.log("✅ Done!");
  } catch (error) {
    console.error("❌ Error categorizing articles:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      console.error("Stack:", error.stack);
    }
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the script
categorizeMLArticles();
