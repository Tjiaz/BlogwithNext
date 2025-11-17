// import Featured from "@/components/featured/Featured";
// import styles from "./homepage.module.css";
// import CategoryList from "@/components/categoryList/CategoryList";

// export default function Home({ searchParams }) {
//   const page = parseInt(searchParams.page) || 1;
//   return (
//     <div className={styles.container}>
//       <Featured />
//       <CategoryList />
//     </div>
//   );
// }

// app/page.jsx
import Featured from "@/components/featured/Featured";
import styles from "./homepage.module.css";
import CategoryList from "@/components/categoryList/CategoryList";

const POSTS_PER_PAGE = 8;

export default async function Home({ searchParams }) {
  const page = parseInt(searchParams?.page || "1", 10) || 1;

  // Fetch from your existing API routes, but on the SERVER now
  const base =
    process.env.NEXT_PUBLIC_DOMAIN ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000"; 

  const [mongoRes, topRes] = await Promise.all([
    fetch(`${base}/api/latest_articles?page=${page}`, {
      cache: "no-store", // always fresh
    }),
    fetch(`${base}/api/topArticles?page=1`, {
      cache: "no-store",
    }),
  ]);

  const [mongoData, topPostsData] = await Promise.all([
    mongoRes.json(),
    topRes.json(),
  ]);

  // Sort by date (newest first)
  mongoData.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Paginate on the server
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
