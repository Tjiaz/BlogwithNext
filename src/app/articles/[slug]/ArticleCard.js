import React from "react";
import styles from "./article.module.css";
import Image from "next/image";
import Link from "next/link";





const ArticleCard = ({postImg,postDesc,postTitle,postAuthor,postDate}) => { 
  
    return( 
     <div className={styles.articleCard}>
    <div className={styles.postImage}>
      <Image src={postImg} alt={postTitle} width={100} height={100} className={styles.image} />
    </div>
    <div className={styles.postContent}>
      <h1 className={styles.postTitle}>{postTitle}</h1>
      <p className={styles.postDesc}>{postDesc}</p>
      <div className={styles.author}>
        By <strong>
          <Link href="/" title="posted by author" rel="author"> {postAuthor} </Link>
        </strong>
        on {postDate} 
      </div>
    </div>
  </div>)
}



export default ArticleCard;