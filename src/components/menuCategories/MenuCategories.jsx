import Link from "next/link";
import React from "react";
import styles from "./menuCategories.module.css";
const MenuCategories = () => {
  return (
    <div className={styles.categoryList}>
      <Link
        href="/blog?cat=style"
        className={`${styles.categoryItem}${styles.style}`}
      >
        Data Science
      </Link>
      <Link
        href="/blog?cat=travel"
        className={`${styles.categoryItem}${styles.travel}`}
      >
        NLP
      </Link>
      <Link
        href="/blog?cat=fashion"
        className={`${styles.categoryItem}${styles.fashion}`}
      >
        SQL
      </Link>
      <Link
        href="/blog?cat=culture"
        className={`${styles.categoryItem}${styles.culture}`}
      >
        Python
      </Link>
      <Link
        href="/blog?cat=coding"
        className={`${styles.categoryItem}${styles.coding}`}
      >
        Coding
      </Link>
      <Link
        href="/blog?cat=food"
        className={`${styles.categoryItem}${styles.food}`}
      >
        AI
      </Link>
    </div>
  );
};

export default MenuCategories;
