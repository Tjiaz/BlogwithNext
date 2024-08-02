import React from "react";
import styles from "./featured.module.css";
import Image from "next/image";
import Link from "next/link";
import { MdSearch } from "react-icons/md";
import { FaFacebookSquare } from "react-icons/fa";
import { FaTwitterSquare } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { FaRedditSquare } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { MdOutlineAddBox } from "react-icons/md";



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
      
      <h3>Latest Posts</h3>
      <div style={{ display: 'flex', width: '100%' }}>
        <div style={{ flex: '0 0 25%', borderBottom: '3px solid #0B73B1' }}></div>
        <div style={{ flex: '1', borderBottom: '2px solid #0B73B1' }}></div>
      </div>
      <div className={styles.postItem}>
            <div className={styles.postImage}>
              <Image src="/dummy_img.png" alt="History and Future of LLMs" width={100} height={100} className={styles.image} />
            </div>
            <div className={styles.postContent}>
              <h1 className={styles.postTitle}>History and Future of LLMs</h1>
              <p className={styles.postDesc}>Check out this concise history and future of large language models.</p>
              <div className={styles.author}>
                By <strong>
                  <Link href="/" title="posted by author" rel="author"> Kevin Vu </Link>
                </strong>
                Exxact Corp on August 2, 2024 in <strong><Link href="/">Language Models</Link></strong>
              </div>
            </div>
          </div>
      <div className={styles.postItem}>
            <div className={styles.postImage}>
              <Image src="/dummy_img.png" alt="Organize, Search, and Back Up Files with Python’s Pathlib" width={100} height={100} className={styles.image} />
            </div>
            <div className={styles.postContent}>
              <h1 className={styles.postTitle}>Organize, Search, and Back Up Files with Python’s Pathlib</h1>
              <p className={styles.postDesc}>This tutorial will teach you how to simplify your file management tasks, from organization to backup, using Python’s pathlib module.</p>
              <div className={styles.author}>
                By <strong>
                  <Link href="/" title="posted by author" rel="author"> Bala Priya C </Link>
                </strong>
                KDnuggets Contributing Editor & Technical Content Specialist on August 2, 2024 in <strong><Link href="/">Python</Link></strong>
              </div>
            </div>
          </div>
          
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
