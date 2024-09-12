import React from "react";
import styles from "./article.module.css";
import Image from "next/image";
import Link from "next/link";





const ArticleCard = ({postImg,postDesc,postTitle,postAuthor,postDate,postTopics}) => { 
  
    return( 
     <>
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
        Exxact Corp on {postDate} in <strong><Link href="/">{postTopics}</Link></strong>
      </div>
    </div>
  </>)
}



export default ArticleCard;