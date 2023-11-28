import React from "react";
import styles from "./featured.module.css";
import Image from "next/image";

const Featured = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        <b>Hello! Welcome to Azcodezone blog!</b> Discover articles and trending
        headlines from the different categories
      </h1>
      <div className={styles.post}>
        <div className={styles.imgContainer}>
          <Image src="/p1.jpeg" alt="" fill className={styles.image} />
        </div>
        <div className={styles.textContainer}>
          <h1 className={styles.postTitle}>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit.{" "}
          </h1>
          <p className={styles.postDec}>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Similique
            praesentium ducimus sed tempora in modi quas aperiam. Quibusdam
            provident laudantium sint ratione eaque aliquam assumenda quam,
            inventore debitis eos est!
          </p>
          <button className={styles.button}>Read More</button>
        </div>
      </div>
    </div>
  );
};

export default Featured;
