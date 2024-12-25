import Image from "next/image";
import Link from "next/link";
import React from "react";
import styles from "./menusPosts.module.css";

const MenuPosts = (withImage) => {
  return (
    <div className={styles.items}>
      <Link href="/" className={styles.item}>
        {withImage && (
          <div className={styles.imageContainer}>
            <Image src="/p1.jpeg" alt="" fill className={styles.image} />
          </div>
        )}
        <div className={styles.textContainer}>
          <span
            className={`${styles.category}${styles.travel}`}
            style={{
              backgroundColor: "#57c4ff31",
              width: "max-content",
              padding: "3px 8px",
              borderRadius: "10px",
              fontSize: "12px",
            }}
          >
            Programming
          </span>
          <h3 className={styles.postTitle}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.{" "}
          </h3>
          <div className={styles.detail}>
            <span className={styles.username}>Ola Az</span>
            <span className={styles.date}>22.10.2023</span>
          </div>
        </div>
      </Link>
      <Link href="/" className={styles.item}>
        {withImage && (
          <div className={styles.imageContainer}>
            <Image src="/p1.jpeg" alt="" fill className={styles.image} />
          </div>
        )}
        <div className={styles.textContainer}>
          <span
            className={`${styles.category}${styles.culture}`}
            style={{
              backgroundColor: "#ffb04f45",
              width: "max-content",
              padding: "3px 8px",
              borderRadius: "10px",
              fontSize: "12px",
            }}
          >
            NLP
          </span>
          <h3 className={styles.postTitle}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.{" "}
          </h3>
          <div className={styles.detail}>
            <span className={styles.username}>Ola Az</span>
            <span className={styles.date}>22.10.2023</span>
          </div>
        </div>
      </Link>
      <Link href="/" className={styles.item}>
        {withImage && (
          <div className={styles.imageContainer}>
            <Image src="/p1.jpeg" alt="" fill className={styles.image} />
          </div>
        )}
        <div className={styles.textContainer}>
          <span
            className={`${styles.category}${styles.food}`}
            style={{
              backgroundColor: "#7fb88133",
              width: "max-content",
              padding: "3px 8px",
              borderRadius: "10px",
              fontSize: "12px",
            }}
          >
            Python
          </span>
          <h3 className={styles.postTitle}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.{" "}
          </h3>
          <div className={styles.detail}>
            <span className={styles.username}>Ola Az </span>
            <span className={styles.date}>22.10.2023</span>
          </div>
        </div>
      </Link>
      <Link href="/" className={styles.item}>
        {withImage && (
          <div className={styles.imageContainer}>
            <Image src="/p1.jpeg" alt="" fill className={styles.image} />
          </div>
        )}
        <div className={styles.textContainer}>
          <span
            className={`${styles.category}${styles.fashion}`}
            style={{
              backgroundColor: "#da85c731",
              width: "max-content",
              padding: "3px 8px",
              borderRadius: "10px",
              fontSize: "12px",
            }}
          >
            Data Science
          </span>
          <h3 className={styles.postTitle}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.{" "}
          </h3>
          <div className={styles.detail}>
            <span className={styles.username}>Ola Az </span>
            <span className={styles.date}>22.10.2023</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default MenuPosts;
