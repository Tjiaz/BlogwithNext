import Image from "next/image";
import Link from "next/link";
import React from "react";
import styles from "./menusPosts.module.css";
import { formatTopic } from "@/utils/formatTopic";

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
            className={`${styles.category} ${
              styles[topic.replace(/\s+/g, "_").toLowerCase()]
            }`}
          >
            {formatTopic(topic)}
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
