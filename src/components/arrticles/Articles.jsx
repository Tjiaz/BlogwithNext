"use client"
import React, { useState, useEffect } from "react";
import styles from "./featured.module.css";
import Image from "next/image";
import Link from "next/link";
import { MdSearch } from "react-icons/md";
import FeaturedCard from "./FeaturedCard";
import Pagination from "../pagination/Pagination"


const POSTS_PER_PAGE = 6

const Articles = ({}) => {
  
  
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
     
      {paginatedPosts.map((post) => ( 
        <div className={styles.postItem} key={post.id}>
       
      <FeaturedCard  
      id={post.id} 
      postImg={post.image_url} 
      postTitle={post.title}
      postDesc={post.description} 
      postAuthor={post.author} 
      postDate={post.published_at} 
      postTopics={post.topics} 
      />
        </div>
      ))
     
    }
    <Pagination page={page} hasPrev={hasPrev} hasNext={hasNext} />
       
      </div>
      
        <div className={styles.textContainer2}>
         
          <div className={styles.searchContainer}>
          <input type="text" className={styles.searchInput} placeholder="Search AzByteGems..." />
          <MdSearch className={styles.searchIcon} />
         </div>
         <div className={styles.advertImgContainer}>
              <Image src="/dummy_img.png" alt="advert" width={100} height={100} className={styles.advertImg} />
              <Link href="/" >Adverts</Link>
            </div>
          <div>
          <h3>Top Posts</h3>
          <div style={{ display: 'flex', width: '100%' }}>
          <div style={{ flex: '0 0 25%', borderBottom: '3px solid #0B73B1' }}></div>
          <div style={{ flex: '1', borderBottom: '2px solid #0B73B1' }}></div>
       </div>
          </div>
          <div className={styles.topPosts}>
          <ol className={styles.noListStyle}>
          <li className={styles.listItem}>
          <Link href="/" >Building Data Science Pipelines Using Pandas</Link>
          </li>
          <li className={styles.listItem}>
           <Link href="/" >Building Data Science Pipelines Using Pandas</Link>
           </li>
           <li className={styles.listItem}>
           <Link href="/" >Building Data Science Pipelines Using Pandas</Link>
           </li>
           <li className={styles.listItem}>
           <Link href="/" >Building Data Science Pipelines Using Pandas</Link>
           </li>
           <li className={styles.listItem}>
           <Link href="/" >Building Data Science Pipelines Using Pandas</Link>
           </li>
          </ol>
           
          </div>
          <div className={styles.advertImgContainer}>
              <Image src="/dummy_img.png" alt="advert" width={100} height={100} className={styles.advertImg} />
              <Link href="/" >Adverts</Link>
            </div>
          <div className={styles.signupContainer}>
          <input type="text" className={styles.searchInput} placeholder="Your Email" />
          <button href="/" className={styles.signupbutton}>sign up</button>
         </div>
        
         
        </div>
      </div>
    </div>
  );
};

export default Articles;