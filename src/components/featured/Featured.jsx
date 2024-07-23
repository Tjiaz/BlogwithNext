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
      <div className={styles.textContainer1}>
      <h1 className={styles.postTitle}>LLM Portfolio Projects Ideas to Wow Employers</h1>
      <p className={styles.postDesc}>Build interesting AI projects using LangChain, VectorDB, FastAPI, OpenAI API, Zyte, Ollama, and Hugging Face.</p>
      <div className={styles.author}>
      By <strong>
      <Link href="/" title="posted by author" rel="author"> Name </Link></strong>
         KDnuggets Assistant Editor on June 26, 2024 in <Link href="/">Language Models</Link>
      </div>
      <Link href="/">
        <Link  href="/" className={styles.readMore}>Read More</Link>
      </Link>
    </div>
        <div className={styles.textContainer2}>
         
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
