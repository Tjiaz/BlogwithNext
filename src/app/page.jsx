//

// page.jsx
import Featured from "@/components/featured/Featured";
import styles from "./homepage.module.css";
import CategoryList from "@/components/categoryList/CategoryList";
import { headers } from "next/headers";

const POSTS_PER_PAGE = 8;

function buildBaseUrl() {
  const hdrs = headers();
  // Prefer x-forwarded proto/host (set by proxies like Vercel)
  const proto =
    hdrs.get("x-forwarded-proto") ||
    (process.env.NODE_ENV === "development" ? "http" : "https");
  const forwardedHost = hdrs.get("x-forwarded-host");
  const host = forwardedHost || hdrs.get("host") || process.env.VERCEL_URL;

  if (!host) {
    // Last-resort: use NEXT_PUBLIC_BASE_URL if you set it (recommended)
    if (process.env.NEXT_PUBLIC_BASE_URL)
      return process.env.NEXT_PUBLIC_BASE_URL;
    // Return null so caller can decide
    return null;
  }

  // If host already has protocol, return it
  if (host.startsWith("http://") || host.startsWith("https://")) return host;
  return `${proto}://${host}`;
}

export default async function Home({ searchParams }) {
  const page = parseInt(searchParams?.page || "1", 10) || 1;

  const baseUrl = buildBaseUrl();

  // helper that tries server absolute fetch, otherwise a relative fetch
  async function safeFetch(path, opts = {}) {
    // prefer absolute if baseUrl is known, else try relative
    const url = baseUrl ? `${baseUrl}${path}` : path;
    try {
      // important: no-store here since you're fetching dynamic data
      const res = await fetch(url, { cache: "no-store", ...opts });
      if (!res.ok) {
        const text = await res.text().catch(() => "<unreadable body>");
        console.error(`Fetch failed: ${url} status:${res.status} body:${text}`);
        return { ok: false, status: res.status, bodyText: text };
      }
      const json = await res.json().catch(() => null);
      return { ok: true, json };
    } catch (err) {
      console.error(`Fetch error for ${url}:`, err);
      // If we used absolute and it failed, try relative (helps in some Vercel setups)
      if (url !== path) {
        try {
          const res2 = await fetch(path, { cache: "no-store", ...opts });
          if (!res2.ok) {
            const t2 = await res2.text().catch(() => "<unreadable body>");
            console.error(
              `Relative fetch failed: ${path} status:${res2.status} body:${t2}`
            );
            return { ok: false, status: res2.status, bodyText: t2 };
          }
          const json2 = await res2.json().catch(() => null);
          return { ok: true, json: json2 };
        } catch (err2) {
          console.error(`Relative fetch also failed for ${path}:`, err2);
        }
      }
      return { ok: false, error: err };
    }
  }

  // Parallel fetches
  const [latestResult, topResult, recentResult, categoriesResult] =
    await Promise.all([
      safeFetch(`/api/latest_articles?page=${page}`),
      safeFetch(`/api/topArticles?page=1`),
      safeFetch(`/api/moreRecent_articles?page=${page}`),
      safeFetch(`/api/categories?page=${page}`),
    ]);

  // If any critical fetch failed, render the page with fallback content and log the error
  const errors = [];
  if (!latestResult.ok)
    errors.push({ name: "latest_articles", detail: latestResult });
  if (!topResult.ok) errors.push({ name: "topArticles", detail: topResult });
  if (!recentResult.ok)
    errors.push({ name: "moreRecent_articles", detail: recentResult });
  if (!categoriesResult.ok)
    errors.push({ name: "categories", detail: categoriesResult });

  // parse JSON (or default to empty arrays)
  const mongoData =
    latestResult.ok && latestResult.json ? latestResult.json : [];
  const topPostsData = topResult.ok && topResult.json ? topResult.json : [];
  const recentData =
    recentResult.ok && recentResult.json ? recentResult.json : [];
  const popularData =
    categoriesResult.ok && categoriesResult.json ? categoriesResult.json : [];

  try {
    // sort safely
    if (Array.isArray(mongoData)) {
      mongoData.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  } catch (e) {
    console.error("Sort error:", e);
  }

  const latestPosts = Array.isArray(mongoData) ? mongoData : [];
  const hasNext = latestPosts.length === POSTS_PER_PAGE;

  // If there were fetch errors, you may still render with fallback UI; return helpful UI instead of crashing
  if (errors.length > 0) {
    // log to server logs (Vercel) — you can inspect these
    console.error("Home page fetch errors:", JSON.stringify(errors, null, 2));
    // Optionally you can show a friendly message on the page (instead of throwing)
    return (
      <div className={styles.container}>
        <h2>Issues loading data</h2>
        <p>
          There was an error fetching content from the server. Check server logs
          or network.
        </p>
        {/* still try to render whatever we have */}
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
