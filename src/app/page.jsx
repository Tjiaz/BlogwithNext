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

  const [mongoRes, topRes] = await Promise.all([
    fetch(`${baseUrl}/api/latest_articles?page=${page}`, {
      cache: "no-store",
    }),
    fetch(`${baseUrl}/api/topArticles?page=1`, {
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

  const [mongoData, topPostsData] = await Promise.all([
    mongoRes.json(),
    topRes.json(),
  ]);

  mongoData.sort((a, b) => new Date(b.date) - new Date(a.date));

  const startIndex = (page - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const paginated = mongoData.slice(startIndex, endIndex);
  const hasNext = endIndex < mongoData.length;

  return (
    <div className={styles.container}>
      <Featured
        page={page}
        initialAllPosts={mongoData}
        initialLatestPosts={paginated}
        initialTopPosts={topPostsData.slice(0, 7)}
        initialHasNext={hasNext}
      />
      <CategoryList />
    </div>
  );
}
