// src/app/page.jsx
import Featured from "@/components/featured/Featured";
import styles from "./homepage.module.css";
import CategoryList from "@/components/categoryList/CategoryList";
import { headers } from "next/headers";

const POSTS_PER_PAGE = 8;

export default async function Home({ searchParams }) {
  const page = parseInt(searchParams?.page || "1", 10) || 1;

  // Build absolute base URL from request headers
  const headersList = headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const [mongoRes, topRes, recentRes, popularRes] = await Promise.all([
    fetch(`${baseUrl}/api/latest_articles?page=${page}`, {
      cache: "no-store",
    }),
    fetch(`${baseUrl}/api/topArticles?page=1`, {
      cache: "no-store",
    }),
    fetch(`${baseUrl}/api/moreRecent_articles?page=${page}`, {
      cache: "no-store",
    }),
    fetch(`${baseUrl}/api/categories?page=${page}`, {
      cache: "no-store",
    }),
  ]);

  if (!mongoRes.ok) {
    console.error("latest_articles error:", await mongoRes.text());
    throw new Error("Failed to fetch latest articles");
  }
  if (!topRes.ok) {
    console.error("topArticles error:", await topRes.text());
    throw new Error("Failed to fetch top articles");
  }
  if (!recentRes.ok) {
    console.error("moreRecent_articles error:", await recentRes.text());
    throw new Error("Failed to fetch more recent articles");
  }
  if (!popularRes.ok) {
    console.error("categories error:", await popularRes.text());
    throw new Error("Failed to fetch popular/category articles");
  }

  const [mongoData, topPostsData, recentData, popularData] = await Promise.all([
    mongoRes.json(),
    topRes.json(),
    recentRes.json(),
    popularRes.json(),
  ]);

  mongoData.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Sort this page’s results by date (just in case)
  mongoData.sort((a, b) => new Date(b.date) - new Date(a.date));

  // 👉 mongoData is already "page N"
  const latestPosts = mongoData;

  // 👉 If we got a full page, we *might* have a next page
  const hasNext = latestPosts.length === POSTS_PER_PAGE;

  return (
    <div className={styles.container}>
      <Featured
        page={page}
        initialAllPosts={latestPosts} // this page
        initialLatestPosts={latestPosts} // this page
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
