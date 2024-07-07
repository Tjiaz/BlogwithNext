import React from "react";
import styles from "./featured.module.css";
import Image from "next/image";
import Link from "next/link";
import { MdSearch } from "react-icons/md";

const Featured = () => {
  return (
    <div className={styles.container}>
     <div className={styles.advertContainer}>
    <div className={styles.imageadvert}>
    <Image src="/p1.jpeg" alt="" fill className={styles.image} />
    </div>
    <Link href="/" className={styles.advert}>adverts link</Link>
    </div>
      <div className={styles.post}>
        <div className={styles.imgContainer}>
          <Image src="/p1.jpeg" alt="" fill className={styles.image} />
        </div>
        <div className={styles.textContainer}>
         
          <div className={styles.searchContainer}>
          <input type="text" className={styles.searchInput} placeholder="Search AzByteGems..." />
          <MdSearch className={styles.searchIcon} />

            
          </div>
          <button className={styles.button}>Read More</button>
        </div>
      </div>
    </div>
  );
};

export default Featured;
