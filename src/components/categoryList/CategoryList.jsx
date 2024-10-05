"use client"
import React, { useState,useEffect } from "react";
import styles from "./categoryList.module.css";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import CatCard from "./CatCard";
import MenuCategories from "../menuCategories/MenuCategories";
import MenuPosts from "../menuPosts/MenuPosts";



const CategoryList =  () => {
    const [moreRecentPosts,setMoreRecentPosts] = useState([])
    const searchParam = useSearchParams()
    const moreParam= searchParam.get('page')
    const page = parseInt(moreParam, ) || 1;


    useEffect(()=> {
      async function fetchRecentPosts(){
        try{
          const response = await fetch(`/api/moreRecent_articles?page=${page}`);
          const data = await response.json();
          console.log("Fetched data:", data);
          if(Array.isArray(data)){ 
             setMoreRecentPosts(data);// If already an array, use it directly
          }
         else {
          console.error("Unexpected data format", data);
        }
   }
         

        catch(error){ 
          console.error("Failed to fetch more recent articles", error);
        }
        
      
      }
      fetchRecentPosts()
    },[page])

  return (
    <div className={styles.container}>
      
      <div className={styles.recentContainer1}>
     
      <div className={styles.categories}>
      <h3 className={styles.title}>More Recent Posts</h3>
        {moreRecentPosts.length > 0 ? (
          moreRecentPosts.map((item) => (
            <CatCard key={item._id} postTitle={<Link href={`/articles/${item._id}`}>{item.title}</Link>} />
        ))
        ) : (
          <p>No categories available at the moment.</p>
        )}
      </div>
      </div>
     <div className={styles.recentContainer2}>

      <div className={styles.menuContainer}>
      <h2>Most Popular</h2>
      <MenuPosts withImage={false} />
      <h2 className={styles.subtitle}>Discover by topics</h2>
      <MenuCategories />
     </div>
     </div>
    </div>
  );
};

export default CategoryList;
