import React from "react";
import styles from "./featured.module.css";
import Image from "next/image";
import Link from "next/link";

const FeaturedCard = ({
  postImg,
  postDesc,
  postTitle,
  postAuthor,
  postDate,
  postTopic,
  postId,
}) => {
  console.log("Post Id:", postId);
  console.log("Post Title:", postTitle);
  return (
    <div className={styles.articleCard}>
      <div className={styles.postImage}>
        <Image
          src={postImg}
          alt={postTitle}
          width={100}
          height={100}
          className={styles.image}
        />
      </div>
      <div className={styles.postContent}>
        <Link href={`/article_details/${postId}`} className={styles.postTitle}>
          <h4>{postTitle}</h4>
        </Link>
        <p className={styles.postDesc}>{postDesc}</p>
        <div className={styles.author}>
          By{" "}
          <strong>
            <Link href="/" title="posted by author" rel="author">
              {" "}
              {postAuthor}{" "}
            </Link>
          </strong>
          on {postDate} in{" "}
          <strong>
            <Link href={`/articles/${postTopic}`}>{postTopic}</Link>
          </strong>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCard;
