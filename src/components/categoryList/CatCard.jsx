import React from "react";
import styles from "./categoryList.module.css";
import Image from "next/image";
import Link from "next/link";

const CatCard = ({ postTitle, postId }) => {
  return (
    <div className={styles.moreCard}>
      <ul className={styles.listStyle}>
        <li className={styles.listItem}>
          <Link href={`/article_details/${postId}`}>{postTitle}</Link>
        </li>
      </ul>
    </div>
  );
};

export default CatCard;
