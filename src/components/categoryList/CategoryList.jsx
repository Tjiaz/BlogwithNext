"use client";
import React from "react";
import styles from "./categoryList.module.css";
import Link from "next/link";
import Image from "next/image";

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

export default function CategoryList({
  page,
  initialRecent = [],
  initialPopular = [],
}) {
  const recent = initialRecent;
  const popular = initialPopular;

  return (
    <section className={styles.listWrapper}>
      {/* LEFT COLUMN – MORE RECENT */}
      <aside className={styles.leftCol}>
        <h2 className={styles.sectionTitle}>More Recent Articles</h2>

        {recent.length === 0 && (
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

        {popular.length === 0 && (
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
