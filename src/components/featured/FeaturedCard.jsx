"use client";
import React, { useState, useEffect } from "react";
import styles from "./featured.module.css";
import Image from "next/image";
import Link from "next/link";
import { RiRssFill } from "react-icons/ri";

const FeaturedCard = ({
  postImg,
  postDesc,
  postTitle,
  postAuthor,
  postDate,
  postTopic,
  postId,
  isRssPost,
  rssLink,
}) => {
  const [isSharingTwitter, setIsSharingTwitter] = useState(false);
  const [isSharingFacebook, setIsSharingFacebook] = useState(false);

  const shareToTwitter = async () => {
    setIsSharingTwitter(true);
    try {
      const articleUrl = isRssPost
        ? rssLink
        : `${
            process.env.NEXT_PUBLIC_DOMAIN || "https://azbytegems.com"
          }/article_details/${postId}`;

      const response = await fetch("/api/social_share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: postTitle,
          link: articleUrl,
          description: postDesc,
          platform: "twitter", // Pass as string, not object
        }),
      });

      const data = await response.json();
      console.log("Twitter share response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to share to Twitter");
      }

      alert("Successfully shared to Twitter!");
    } catch (error) {
      console.error("Twitter share error:", error);
      alert("Failed to share to Twitter. Please try again.");
    } finally {
      setIsSharingTwitter(false);
    }
  };

  const shareToFacebook = async () => {
    setIsSharingFacebook(true);
    try {
      const articleUrl = isRssPost
        ? rssLink
        : `${
            process.env.NEXT_PUBLIC_DOMAIN || "https://azbytegems.com"
          }/article_details/${postId}`;

      const response = await fetch("/api/social_share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: postTitle,
          link: articleUrl,
          description: postDesc,
          platform: "facebook", // Pass as string, not object
        }),
      });

      const data = await response.json();
      console.log("Facebook share response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to share to Facebook");
      }

      alert("Successfully shared to Facebook!");
    } catch (error) {
      console.error("Facebook share error:", error);
      alert("Failed to share to Facebook. Please try again.");
    } finally {
      setIsSharingFacebook(false);
    }
  };

  // Format the date
  const formatDate = (dateString) => {
    try {
      // Log the incoming date string for debugging
      console.log("Formatting date:", dateString);

      if (!dateString) {
        console.log("No date provided");
        return "No date";
      }

      // Try parsing the date
      let date;
      if (dateString.includes("GMT")) {
        // Handle pubDate format (e.g., 'Mon, 20 Apr 2020 17:18:21 GMT')
        date = new Date(dateString);
      } else {
        // Handle isoDate format (e.g., '2020-04-20T17:19:21.000Z')
        date = new Date(dateString);
      }

      // Verify the date is valid
      if (isNaN(date.getTime())) {
        console.log("Invalid date:", dateString);
        return dateString;
      }

      // Format the date
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Date parsing error for:", dateString, error);
      return dateString; // Return the original string if parsing fails
    }
  };

  // Image handling component with error boundary
  const SafeImage = ({ src, alt, ...props }) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [error, setError] = useState(false);

    useEffect(() => {
      // Validate image URL
      const validateImage = async (url) => {
        try {
          const response = await fetch(url, { method: "HEAD" });
          if (
            !response.ok ||
            !response.headers.get("content-type")?.includes("image")
          ) {
            throw new Error("Invalid image");
          }
        } catch {
          setImgSrc("/azbyte.jpeg");
          setError(true);
        }
      };

      if (src && src !== "/azbyte.jpeg") {
        validateImage(src);
      }
    }, [src]);

    if (error || !imgSrc) {
      return <Image src="/azbyte.jpeg" alt={alt} {...props} />;
    }

    return (
      <Image
        src={imgSrc}
        alt={alt}
        {...props}
        onError={() => {
          setImgSrc("/azbyte.jpeg");
          setError(true);
        }}
      />
    );
  };

  // Determine the link based on post type
  const PostLink = ({ children }) => {
    if (isRssPost) {
      return (
        <a
          href={rssLink}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.postTitle}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={`/article_details/${postId}`} className={styles.postTitle}>
        {children}
      </Link>
    );
  };

  return (
    <div className={styles.articleCard}>
      <div className={styles.postImage}>
        <SafeImage
          src={postImg}
          alt={postTitle}
          width={100}
          height={100}
          className={styles.image}
        />
      </div>
      <div className={styles.postContent}>
        <PostLink>
          <h4>{postTitle}</h4>
        </PostLink>
        <p className={styles.postDesc}>{postDesc}</p>
        <div className={styles.author}>
          <div className={styles.postInfo}>
            By{" "}
            <strong>
              <Link href="/" title="posted by author" rel="author">
                {postAuthor}
              </Link>
            </strong>{" "}
            on {formatDate(postDate)} in{" "}
            <strong>
              {isRssPost ? (
                <span>{postTopic}</span>
              ) : (
                <Link href={`/articles/${postTopic}`}>{postTopic}</Link>
              )}
            </strong>
          </div>
          <div className={styles.badgeAndShare}>
            {isRssPost && (
              <span className={styles.sourceTag}>
                <RiRssFill className={styles.rssIcon} />
                External Source
              </span>
            )}
            <div className={styles.shareButtons}>
              <button
                onClick={shareToTwitter}
                disabled={isSharingTwitter}
                className={`${styles.shareButton} ${styles.twitterButton}`}
              >
                {isSharingTwitter ? "..." : "Share to X"}
              </button>
              <button
                onClick={shareToFacebook}
                disabled={isSharingFacebook}
                className={`${styles.shareButton} ${styles.facebookButton}`}
              >
                {isSharingFacebook ? "..." : "Share to FB"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCard;
