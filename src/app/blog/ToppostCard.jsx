import React from "react";
import styles from "./blogPage.module.css";
import Image from "next/image";
import Link from "next/link";

const ToppostCard = ({ postTitle }) => {
  return (
    <div className={styles.articleCard}>
      <div className={styles.postContent}>
        <h1 className={styles.postTitle}>{postTitle}</h1>
      </div>
    </div>
  );
};

export default ToppostCard;
