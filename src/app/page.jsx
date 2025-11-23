// import Featured from "@/components/featured/Featured";
// import styles from "./homepage.module.css";
// import CategoryList from "@/components/categoryList/CategoryList";
// import { headers } from "next/headers";

// const POSTS_PER_PAGE = 8;

// export default async function Home({ searchParams }) {
//   const page = parseInt(searchParams?.page || "1", 10) || 1;

//   // Build absolute base URL from request headers
//   const headersList = headers();
//   const host = headersList.get("host");
//   const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
//   const baseUrl = `${protocol}://${host}`;

//   const [mongoRes, topRes, recentRes, popularRes] = await Promise.all([
//     fetch(`${baseUrl}/api/latest_articles?page=${page}`, {
//       cache: "no-store",
//     }),
//     fetch(`${baseUrl}/api/topArticles?page=1`, {
//       cache: "no-store",
//     }),
//     fetch(`${baseUrl}/api/moreRecent_articles?page=${page}`, {
//       cache: "no-store",
//     }),
//     fetch(`${baseUrl}/api/categories?page=${page}`, {
//       cache: "no-store",
//     }),
//   ]);

//   if (!mongoRes.ok) {
//     console.error("latest_articles error:", await mongoRes.text());
//     throw new Error("Failed to fetch latest articles");
//   }
//   if (!topRes.ok) {
//     console.error("topArticles error:", await topRes.text());
//     throw new Error("Failed to fetch top articles");
//   }
//   if (!recentRes.ok) {
//     console.error("moreRecent_articles error:", await recentRes.text());
//     throw new Error("Failed to fetch more recent articles");
//   }
//   if (!popularRes.ok) {
//     console.error("categories error:", await popularRes.text());
//     throw new Error("Failed to fetch popular/category articles");
//   }

//   const [mongoData, topPostsData, recentData, popularData] = await Promise.all([
//     mongoRes.json(),
//     topRes.json(),
//     recentRes.json(),
//     popularRes.json(),
//   ]);

//   mongoData.sort((a, b) => new Date(b.date) - new Date(a.date));

//   // Sort this page’s results by date (just in case)
//   mongoData.sort((a, b) => new Date(b.date) - new Date(a.date));

//   // 👉 mongoData is already "page N"
//   const latestPosts = mongoData;

//   // 👉 If we got a full page, we *might* have a next page
//   const hasNext = latestPosts.length === POSTS_PER_PAGE;

//   return (
//     <div className={styles.container}>
//       <Featured
//         page={page}
//         initialAllPosts={latestPosts} // this page
//         initialLatestPosts={latestPosts} // this page
//         initialTopPosts={topPostsData.slice(0, 7)}
//         initialHasNext={hasNext}
//       />
//       <CategoryList
//         page={page}
//         initialRecent={recentData}
//         initialPopular={popularData}
//       />
//     </div>
//   );
// }

// page.jsx
import Featured from "@/components/featured/Featured";
import styles from "./homepage.module.css";
import CategoryList from "@/components/categoryList/CategoryList";
import { headers } from "next/headers";

const POSTS_PER_PAGE = 8;

export default async function Home({ searchParams }) {
  const page = parseInt(searchParams?.page || "1", 10) || 1;

  async function safeFetch(path, opts = {}) {
    // IMPORTANT: use relative path to avoid Vercel deployment protection / auth pages
    const url = path; // e.g. "/api/latest_articles?page=1"
    try {
      const res = await fetch(url, { cache: "no-store", ...opts });
      if (!res.ok) {
        const text = await res.text().catch(() => "<unreadable body>");
        console.error(`Fetch failed: ${url} status:${res.status} body:${text}`);
        return { ok: false, status: res.status, bodyText: text, url };
      }
      const json = await res.json().catch(() => null);
      return { ok: true, json, url };
    } catch (err) {
      console.error(`Fetch error for ${url}:`, err);
      return { ok: false, error: err, url };
    }
  }

  // ------------------------------
  // PARALLEL FETCHES (RELATIVE PATHS)
  // ------------------------------
  const [latestResult, topResult, recentResult, categoriesResult] =
    await Promise.all([
      safeFetch(`/api/latest_articles?page=${page}`),
      safeFetch(`/api/topArticles?page=1`),
      safeFetch(`/api/moreRecent_articles?page=${page}`),
      safeFetch(`/api/categories?page=${page}`),
    ]);

  // ------------------------------
  // NORMALIZE ALL API RESPONSES
  // ------------------------------
  function normalizeResponsePayload(payload) {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;

    const keys = ["data", "items", "results", "articles", "rows", "docs"];
    for (const k of keys) {
      if (payload[k] && Array.isArray(payload[k])) return payload[k];
    }

    if (typeof payload === "object") {
      for (const v of Object.values(payload)) {
        if (Array.isArray(v)) return v;
      }
    }

    return [];
  }

  const mongoData = normalizeResponsePayload(
    latestResult.ok ? latestResult.json : null
  );
  const topPostsData = normalizeResponsePayload(
    topResult.ok ? topResult.json : null
  );
  const recentData = normalizeResponsePayload(
    recentResult.ok ? recentResult.json : null
  );
  const popularData = normalizeResponsePayload(
    categoriesResult.ok ? categoriesResult.json : null
  );

  // LOG TO VERCEL — inspect these logs if something still fails
  console.log("production fetch counts:", {
    latestCount: mongoData.length,
    topCount: topPostsData.length,
    recentCount: recentData.length,
    popularCount: popularData.length,
    sampleLatestKeys: mongoData[0] ? Object.keys(mongoData[0]) : null,
  });

  // ------------------------------
  // SORT LATEST POSTS SAFELY
  // ------------------------------
  try {
    if (Array.isArray(mongoData)) {
      mongoData.sort(
        (a, b) =>
          new Date(b.date || b.pubDate || b.publishedAt || 0) -
          new Date(a.date || a.pubDate || a.publishedAt || 0)
      );
    }
  } catch (e) {
    console.error("Sort error:", e);
  }

  const latestPosts = Array.isArray(mongoData) ? mongoData : [];
  const hasNext = latestPosts.length === POSTS_PER_PAGE;

  // ------------------------------
  // ERROR HANDLING UI
  // ------------------------------
  const errors = [];
  if (!latestResult.ok)
    errors.push({ name: "latest_articles", detail: latestResult });
  if (!topResult.ok) errors.push({ name: "topArticles", detail: topResult });
  if (!recentResult.ok)
    errors.push({ name: "moreRecent_articles", detail: recentResult });
  if (!categoriesResult.ok)
    errors.push({ name: "categories", detail: categoriesResult });

  if (errors.length > 0) {
    console.error("Home page fetch errors:", JSON.stringify(errors, null, 2));
    return (
      <div className={styles.container}>
        <h2>Issues loading data</h2>
        <p>
          There was an error fetching content from the server. Check Vercel
          logs.
        </p>

        <Featured
          page={page}
          initialAllPosts={latestPosts}
          initialLatestPosts={latestPosts}
          initialTopPosts={topPostsData.slice(0, 7)}
          initialHasNext={hasNext}
        />

        <CategoryList
          page={page}
          initialRecent={recentData}
          initialPopular={popularData}
        />
      </div>
    );
  }

  // ------------------------------
  // NORMAL RENDER
  // ------------------------------
  return (
    <div className={styles.container}>
      <Featured
        page={page}
        initialAllPosts={latestPosts}
        initialLatestPosts={latestPosts}
        initialTopPosts={topPostsData.slice(0, 7)}
        initialHasNext={hasNext}
      />

      <CategoryList
        page={page}
        initialRecent={recentData}
        initialPopular={popularData}
      />
    </div>
  );
}
