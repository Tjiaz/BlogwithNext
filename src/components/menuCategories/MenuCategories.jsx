import Link from "next/link";
import React from "react";
import styles from "./menuCategories.module.css";

const MenuCategories = () => {
  return (
    <div className={styles.categoryList}>
      <Link
        href="/blog?cat=data"
        className={`${styles.categoryItem} ${styles.data}`}
      >
        Data Science
      </Link>
      <Link
        href="/blog?cat=nlp"
        className={`${styles.categoryItem} ${styles.nlp}`}
      >
        NLP
      </Link>
      <Link
        href="/blog?cat=sql"
        className={`${styles.categoryItem} ${styles.sql}`}
      >
        SQL
      </Link>
      <Link
        href="/blog?cat=python"
        className={`${styles.categoryItem} ${styles.python}`}
      >
        Python
      </Link>
      <Link
        href="/blog?cat=coding"
        className={`${styles.categoryItem} ${styles.coding}`}
      >
        Coding
      </Link>
      <Link
        href="/blog?cat=ai"
        className={`${styles.categoryItem} ${styles.ai}`}
      >
        AI
      </Link>
    </div>
  );
};

export default MenuCategories;
