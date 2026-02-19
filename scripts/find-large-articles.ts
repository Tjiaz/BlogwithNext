/**
 * Find articles with large content (helps identify storage/bandwidth issues)
 * Run: npx tsx scripts/find-large-articles.ts
 */
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function findLargeArticles() {
  console.log("🔍 Finding articles with largest content...\n");

  // Fetch articles - limit to 100 to avoid memory issues with very large DBs
  const { data: articles, error } = await supabase
    .from("final_articles")
    .select("id, title, slug, content")
    .eq("is_published", true)
    .limit(200);

  if (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }

  if (!articles || articles.length === 0) {
    console.log("No articles found.");
    process.exit(0);
  }

  // Calculate size for each article (content is the main culprit)
  const withSize = articles.map((a) => {
    const contentSize = (a.content || "").length;
    const totalSize =
      contentSize +
      (a.title || "").length +
      (a.slug || "").length +
      JSON.stringify(a).length; // rough total
    return {
      id: a.id,
      title: a.title,
      slug: a.slug,
      contentBytes: contentSize,
      contentMB: (contentSize / 1024 / 1024).toFixed(2),
    };
  });

  // Sort by content size descending
  withSize.sort((a, b) => b.contentBytes - a.contentBytes);

  console.log("📊 Top 15 largest articles by content size:\n");
  console.log(
    "  " +
      "Title".padEnd(50) +
      "  Slug".padEnd(45) +
      "  Size (MB)".padStart(10)
  );
  console.log("  " + "-".repeat(110));

  withSize.slice(0, 15).forEach((a, i) => {
    const title = (a.title || "").slice(0, 48).padEnd(50);
    const slug = (a.slug || "").slice(0, 43).padEnd(45);
    const size = a.contentMB.padStart(10);
    console.log(`  ${title}  ${slug}  ${size}`);
  });

  const totalContentBytes = withSize.reduce((sum, a) => sum + a.contentBytes, 0);
  console.log("\n📈 Total content size across all articles:", (totalContentBytes / 1024 / 1024).toFixed(2), "MB");

  const over2MB = withSize.filter((a) => a.contentBytes > 2 * 1024 * 1024);
  if (over2MB.length > 0) {
    console.log(`\n⚠️  ${over2MB.length} article(s) exceed 2MB (Next.js cache limit):`);
    over2MB.forEach((a) => {
      console.log(`   - ${a.slug} (${a.contentMB} MB)`);
    });
  }

  console.log("\n💡 For full accuracy (all articles), run supabase/find-large-articles.sql in Supabase Dashboard > SQL Editor");
}

findLargeArticles()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  });
