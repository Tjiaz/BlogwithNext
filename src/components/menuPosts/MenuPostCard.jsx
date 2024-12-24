import Image from "next/image";
import Link from "next/link";
import React from "react";
import styles from "./menusPosts.module.css";

const MenuPostCard = ({ withImage, topic, title, author, date, image }) => {
  return (
    <div className={styles.items}>
      <Link href="/" className={styles.item}>
        {withImage && (
          <div className={styles.imageContainer}>
            <Image src={image} alt="" fill className={styles.image} />
          </div>
        )}
        <div className={styles.textContainer}>
          <span
            className={`${styles.category}${
              styles[topic.toLowerCase().replace(/\s+/g, "_")] || styles.default
            }`}
            style={{
              width: "max-content",
              padding: "3px 8px",
              borderRadius: "10px",
              fontSize: "12px",
            }}
          >
            {topic}
          </span>
          <h3 className={styles.postTitle}>{title}</h3>
          <div className={styles.detail}>
            <span className={styles.username}>{author}</span>
            <span className={styles.date}>{date}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default MenuPostCard;
