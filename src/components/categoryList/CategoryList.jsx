"use client"
import React, { useState,useEffect } from "react";
import styles from "./categoryList.module.css";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import CatCard from "./CatCard";



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
      <h3 className={styles.title}>More Recent Posts</h3>
      
      <div className={styles.categories}>
        {moreRecentPosts.length > 0 ? (
          moreRecentPosts.map((item) => (
            <CatCard key={item._id} postTitle={<Link href={`/articles/${item._id}`}>{item.title}</Link>} />
             
           
          ))
        ) : (
          <p>No categories available at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default CategoryList;
