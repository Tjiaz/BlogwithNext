// Script to delete all articles with topic "RSS Feed"
// Run with: npx tsx scripts/delete-rss-feed-articles.ts

import clientPromise from "../lib/mongodb";

async function deleteRSSFeedArticles() {
  try {
    console.log("🗑️  Deleting RSS Feed articles...");
    console.log("=====================================\n");

    const client = await clientPromise;
    const db = client.db("ARTICLES");
    const articlesCollection = db.collection("final_articles");

    // First, check how many articles will be deleted
    const rssFeedCount = await articlesCollection.countDocuments({ topic: "RSS Feed" });
    console.log(`📊 Found ${rssFeedCount} articles with topic "RSS Feed"\n`);

    if (rssFeedCount === 0) {
      console.log("✅ No articles to delete!");
      return;
    }

    // Show some sample articles that will be deleted
    console.log("Sample articles that will be deleted:");
    const sampleArticles = await articlesCollection
      .find({ topic: "RSS Feed" })
      .limit(10)
      .toArray();

    sampleArticles.forEach((article, index) => {
      console.log(`${index + 1}. "${article.title?.substring(0, 70)}"`);
    });
    if (rssFeedCount > 10) {
      console.log(`... and ${rssFeedCount - 10} more`);
    }

    console.log(`\n⚠️  WARNING: This will delete ${rssFeedCount} articles!`);
    console.log("Proceeding with deletion...\n");

    // Delete all articles with topic "RSS Feed"
    const deleteResult = await articlesCollection.deleteMany({ topic: "RSS Feed" });

    console.log("=====================================");
    console.log(`📈 Delete Result:`);
    console.log(`   Deleted: ${deleteResult.deletedCount}`);
    console.log("=====================================\n");

    // Verify
    const remainingRSS = await articlesCollection.countDocuments({ topic: "RSS Feed" });
    const totalArticles = await articlesCollection.countDocuments({});

    console.log("📊 Verification:");
    console.log(`   Articles with 'RSS Feed' topic remaining: ${remainingRSS}`);
    console.log(`   Total articles in collection: ${totalArticles}`);
    console.log("=====================================");
    console.log("✅ Done!");
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

deleteRSSFeedArticles();
