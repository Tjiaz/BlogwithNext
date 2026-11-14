/**
 * Smoke test key production endpoints for azbytegems.com
 */
const BASE = process.env.PROD_URL || "https://www.azbytegems.com";

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`✅ ${name}`);
  } catch (e) {
    console.error(`❌ ${name}:`, e instanceof Error ? e.message : e);
  }
}

async function main() {
  console.log(`Testing production: ${BASE}\n`);

  await test("Homepage returns 200", async () => {
    const res = await fetch(BASE);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const html = await res.text();
    if (html.includes("Content temporarily unavailable")) {
      throw new Error("Homepage shows quota exceeded message");
    }
    if (!html.includes("Latest Articles")) {
      throw new Error("Homepage missing expected content");
    }
  });

  await test("/topics returns 200", async () => {
    const res = await fetch(`${BASE}/topics`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
  });

  await test("/api/topics returns topics", async () => {
    const res = await fetch(`${BASE}/api/topics`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.topics) || data.topics.length === 0) {
      throw new Error(`Invalid response: ${JSON.stringify(data)}`);
    }
    console.log(`   → ${data.topics.length} topics`);
  });

  await test("/api/upload-image requires auth (401)", async () => {
    const res = await fetch(`${BASE}/api/upload-image`, { method: "POST" });
    if (res.status !== 401) {
      const body = await res.text();
      throw new Error(`Expected 401, got ${res.status}: ${body.slice(0, 200)}`);
    }
  });

  await test("/api/latest_articles returns articles", async () => {
    const res = await fetch(`${BASE}/api/latest_articles`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    const articles = Array.isArray(data) ? data : data.articles || data.posts || [];
    if (!Array.isArray(articles) || articles.length === 0) {
      throw new Error(`No articles in response`);
    }
    const first = articles[0];
    const img =
      first.hero_image ||
      first.img ||
      first.featured_image ||
      first.image ||
      first.imageUrl;
    console.log(`   → ${articles.length} articles, first image: ${img ? "yes" : "default"}`);
  });

  await test("/write redirects unauthenticated users", async () => {
    const res = await fetch(`${BASE}/write`, { redirect: "manual" });
    // May return 200 (client-side redirect) or 307/308
    if (res.status >= 300 && res.status < 400) {
      console.log(`   → redirect to ${res.headers.get("location")}`);
      return;
    }
    if (res.ok) {
      console.log("   → page loads (auth check is client-side)");
      return;
    }
    throw new Error(`Status ${res.status}`);
  });

  console.log("\nDone.");
}

main();
