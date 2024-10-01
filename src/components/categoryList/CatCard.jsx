import React from "react";
import styles from "./categoryList.module.css";
import Image from "next/image";
import Link from "next/link";





const CatCard = ({postImg,postDesc,postTitle,postAuthor,postDate,postTopic}) => { 
  
    return( 
     <div className={styles.cartCard}>

     <div className={styles.topPosts}>
          <ol className={styles.noListStyle}>
          <li className={styles.listItem}>
          <Link href="/" >{postTitle}</Link>
          </li>
          
          </ol>
           
          </div>
    
  </div>)
}



export default CatCard;