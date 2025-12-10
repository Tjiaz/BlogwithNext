import Link from "next/link";
import React from "react";
import styles from "./menuCategories.module.css";

const MenuCategories = () => {
  return (
    <div className={styles.categoryList}>
      <Link
        href="/articles/data_science"
        className={`${styles.categoryItem} ${styles.data}`}
      >
        Data Science
      </Link>
      <Link
        href="/articles/nlp"
        className={`${styles.categoryItem} ${styles.nlp}`}
      >
        NLP
      </Link>
      <Link
        href="/articles/sql"
        className={`${styles.categoryItem} ${styles.sql}`}
      >
        SQL
      </Link>
      <Link
        href="/articles/python"
        className={`${styles.categoryItem} ${styles.python}`}
      >
        Python
      </Link>
      <Link
        href="/articles/programming"
        className={`${styles.categoryItem} ${styles.coding}`}
      >
        Programming
      </Link>
      <Link
        href="/articles/ai"
        className={`${styles.categoryItem} ${styles.ai}`}
      >
        AI
      </Link>
    </div>
  );
};

export default MenuCategories;
