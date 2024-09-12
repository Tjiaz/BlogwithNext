"use client"
import React, { useState, useEffect } from "react";
import styles from "./article.module.css";
import Image from "next/image";
import Link from "next/link";
import { MdSearch } from "react-icons/md";
import ArticleCard from "./ArticleCard";





const ArticlePage = ({params}) => {
    const {slug} = params // Destructure slug from params
    const [articles, setArticles] = useState(null);
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const response = await fetch(`/api/articles/${slug}`);
        const data = await response.json();
        console.log("Fetched data:", data);
        // setArticle(data);
      } catch (error) {
        console.error("Failed to fetch articles", error);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, [slug]);
  
  

  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!articles) {
    return <div>Article not found</div>;
  }

  
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
      
      <h2>{slug}</h2>
      <div style={{ display: 'flex', width: '100%' }}>
        <div style={{ flex: '0 0 25%', borderBottom: '3px solid #0B73B1' }}></div>
        <div style={{ flex: '1', borderBottom: '2px solid #0B73B1' }}></div>
      </div>
     
      {articles.map((post) => ( 
        <div className={styles.postItem} key={post.id}>
       
      <ArticleCard  
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

export default ArticlePage;
