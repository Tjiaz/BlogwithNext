// "use client";
// import React, { useState, useEffect } from "react";
// import styles from "./categoryList.module.css";
// import Link from "next/link";
// import Image from "next/image";
// import { useSearchParams } from "next/navigation";
// import CatCard from "./CatCard";
// import MenuCategories from "../menuCategories/MenuCategories";
// import MenuPostCard from "../menuPosts/MenuPostCard";

// const CategoryList = () => {
//   const [moreRecentPosts, setMoreRecentPosts] = useState([]);
//   const [menuPosts, setMenuPosts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const searchParam = useSearchParams();
//   const moreParam = searchParam.get("page");
//   const page = parseInt(moreParam) || 1;

//   useEffect(() => {
//     async function fetchRecentPosts() {
//       try {
//         const response = await fetch(`/api/moreRecent_articles?page=${page}`);
//         const data = await response.json();
//         if (Array.isArray(data)) {
//           setMoreRecentPosts(data);
//         } else {
//           console.error("Unexpected data format", data);
//         }
//       } catch (error) {
//         console.error("Failed to fetch more recent articles", error);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchRecentPosts();
//   }, [page]);

//   useEffect(() => {
//     async function fetchMenuArticles() {
//       try {
//         const response = await fetch(`/api/categories?page=${page}`);
//         const data = await response.json();
//         if (Array.isArray(data)) {
//           setMenuPosts(data);
//         } else {
//           console.error("Unexpected data format", data);
//         }
//       } catch (error) {
//         console.error("Failed to fetch articles", error);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchMenuArticles();
//   }, [page]);

//   return (
//     <div className={styles.container}>
//       <div className={styles.recentContainer1}>
//         <div className={styles.category}>
//           <h3 className={styles.title}>More Recent Articles</h3>
//           {loading ? (
//             <p>Loading...</p>
//           ) : moreRecentPosts.length > 0 ? (
//             moreRecentPosts.map((item) => (
//               <CatCard
//                 key={item.id}
//                 postTitle={
//                   <Link href={`/article_details/${item.id}`} postId={item.id}>
//                     {item.title}
//                   </Link>
//                 }
//               />
//             ))
//           ) : (
//             <p>No categories available at the moment.</p>
//           )}
//         </div>
//       </div>
//       <div className={styles.recentContainer2}>
//         <div className={styles.menuContainer}>
//           <h2 className={styles.title}>Most Popular Articles</h2>
//           {loading ? (
//             <p>Loading...</p>
//           ) : menuPosts.length > 0 ? (
//             menuPosts.map((post) => (
//               <MenuPostCard
//                 key={post._id}
//                 withImage={true}
//                 topic={post.topic}
//                 title={post.title}
//                 author={post.author}
//                 date={post.date}
//                 image={
//                   post.filtered_images && post.filtered_images.length > 0
//                     ? post.filtered_images[0]
//                     : "/AZBYTEGEMS.png"
//                 }
//               />
//             ))
//           ) : (
//             <p>No popular post available at the moment.</p>
//           )}

//           <h2 className={styles.subtitle}>Discover by topics</h2>
//           <MenuCategories />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CategoryList;

"use client";
import React, { useEffect, useState } from "react";
import styles from "./categoryList.module.css";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import MenuCategories from "../menuCategories/MenuCategories";
import MenuPostCard from "../menuPosts/MenuPostCard";

/* ─────────────────────────────────────────────── */
/* shimmer loader (very small helper)             */
const Skeleton = ({ lines = 1 }) => (
  <div className={styles.skeletonWrapper}>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className={styles.skeletonLine} />
    ))}
  </div>
);
/* ─────────────────────────────────────────────── */

export default function CategoryList() {
  const [recent, setRecent] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);

  const page = parseInt(useSearchParams().get("page") || "1", 10);

  /* ───────── Fetch “More Recent” ───────── */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/moreRecent_articles?page=${page}`);
        const data = await res.json();
        if (Array.isArray(data)) setRecent(data);
      } catch (e) {
        console.error("recent fetch fail:", e);
      } finally {
        setLoadingRecent(false);
      }
    })();
  }, [page]);

  /* ───────── Fetch “Most Popular” ───────── */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/categories?page=${page}`);
        const data = await res.json();
        if (Array.isArray(data)) setPopular(data);
      } catch (e) {
        console.error("popular fetch fail:", e);
      } finally {
        setLoadingPopular(false);
      }
    })();
  }, [page]);

  return (
    <section className={styles.listWrapper}>
      {/* LEFT COLUMN – MORE RECENT */}
      <aside className={styles.leftCol}>
        <h2 className={styles.sectionTitle}>More Recent Articles</h2>

        {loadingRecent && <Skeleton lines={5} />}

        {!loadingRecent && recent.length === 0 && (
          <p className={styles.emptyText}>No articles found.</p>
        )}

        <ul className={styles.cardList}>
          {recent.map((a) => (
            <li key={a._id || a.id} className={styles.card}>
              {/* thumbnail (if any) */}
              <div className={styles.thumbWrapper}>
                <Image
                  src={a.filtered_images?.[0] || a.image || "/azbyte.jpeg"}
                  alt={a.title}
                  fill
                  sizes="80px"
                  className={styles.thumb}
                />
              </div>

              <div className={styles.cardMeta}>
                <Link
                  href={`/article_details/${a._id || a.id}`}
                  className={styles.cardTitle}
                >
                  {a.title}
                </Link>
                <span className={styles.metaLine}>
                  {a.author} • {new Date(a.date).toLocaleDateString("en-US")}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </aside>

      {/* RIGHT COLUMN – POPULAR + TOPICS */}
      <aside className={styles.rightCol}>
        <h2 className={styles.sectionTitle}>Most Popular</h2>

        {loadingPopular && <Skeleton lines={4} />}

        {!loadingPopular && popular.length === 0 && (
          <p className={styles.emptyText}>Nothing popular yet.</p>
        )}

        <div className={styles.popularGrid}>
          {popular.map((p) => (
            <MenuPostCard
              key={p._id}
              withImage
              topic={p.topic}
              title={p.title}
              author={p.author}
              date={p.date}
              image={p.filtered_images?.[0] || p.image || "/azbyte.jpeg"}
            />
          ))}
        </div>

        <h3 className={styles.topicsHeading}>Discover by Topics</h3>
        <MenuCategories />
      </aside>
    </section>
  );
}
