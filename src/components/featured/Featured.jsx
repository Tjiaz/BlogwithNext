"use client"
import React, { useState, useEffect } from "react";
import styles from "./featured.module.css";
import Image from "next/image";
import Link from "next/link";
import { MdSearch } from "react-icons/md";
import FeaturedCard from "./FeaturedCard";
import posts from "../../Data";
import { FaFacebookSquare } from "react-icons/fa";
import { FaTwitterSquare } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { FaRedditSquare } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { MdOutlineAddBox } from "react-icons/md";
import Pagination from "../pagination/Pagination"
import { useSearchParams } from "next/navigation";
import Card from "../card/Card";
import Menu from "../menu/Menu";
import useSWR from 'swr'
import { fetchMediumData } from "@/utils/mediumData";

const POSTS_PER_PAGE = 8

const Featured = () => {
  const [latestPosts, setLatestPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get the page from query params
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const page = parseInt(pageParam, 10) || 1;




  useEffect(() => {
    async function fetchArticles() {
      try {
        const response = await fetch(`/api/latest_articles?page=${page}`);
        const data = await response.json();
        console.log("Fetched data:", data);
        
        if(Array.isArray(data)){ 
          setLatestPosts(data);// If already an array, use it directly
        }
       else {
        console.error("Unexpected data format", data);
      }


      } catch (error) {
        console.error("Failed to fetch articles", error);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, [page]);
  
  

  
 
  if (loading) {
    return <div>Loading...</div>;
  }
 
  const hasPrev = page > 1;
  const hasNext = latestPosts.length === POSTS_PER_PAGE;
  
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
     
    
      {latestPosts && latestPosts.length > 0 ? (
        latestPosts.map((post) => (
          <FeaturedCard
            key={post._id} // Use post._id for unique key
            postImg={
              post.filtered_images && post.filtered_images.length > 0
                ? post.filtered_images[0]
                : "/default-image.png"
            }
            postTitle={<Link href={`/articles/${post._id}`}>{post.title}</Link>} // Use post._id here too
            postDesc={post.description}
            postAuthor={post.author}
            postDate={post.date}
            postTopic={post.topic}
          />
        ))
      ) : (
        <div>No articles found.</div>
      )}


      
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

export default Featured;
