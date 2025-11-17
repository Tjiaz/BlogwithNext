"use client";
import React, { useState, useEffect } from "react";
import styles from "./featured.module.css";
import Image from "next/image";
import Link from "next/link";
import {
  RiRssFill,
  RiTwitterXFill,
  RiFacebookFill,
  RiLinkedinFill,
} from "react-icons/ri";
import toast from "react-hot-toast";

const shareToSocial = async (platform) => {
  setIsSharing(true);
  try {
    // Use clean URL without /article_details
    const articleUrl = `${process.env.NEXT_PUBLIC_DOMAIN}/${article.id}`;

    // Get the first available image
    const imageUrl =
      article.filtered_images?.[0] || article.image || "/azbyte.jpeg";
    const fullImageUrl = imageUrl.startsWith("http")
      ? imageUrl
      : `${process.env.NEXT_PUBLIC_DOMAIN}${imageUrl}`;

    const response = await fetch("/api/social-share", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: article.title,
        link: articleUrl,
        author: article.author,
        description: article.description || article.title,
        image: fullImageUrl,
        platform: platform,
      }),
    });

    if (!response.ok) {
      // Fallback to direct sharing
      let shareUrl;
      switch (platform) {
        case "facebook":
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`;
          break;
        case "twitter":
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            `${article.title}\n\nazbytegems.com`
          )}&url=${encodeURIComponent(articleUrl)}`;
          break;
        case "linkedin":
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`;
          break;
      }
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  } catch (error) {
    console.error("Failed to share:", error);
    alert(`Failed to share to ${platform}. Please try again.`);
  } finally {
    setIsSharing(false);
  }
};

const SafeImage = ({ src, alt, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src || "/azbyte.jpeg");

  useEffect(() => {
    setImgSrc(src || "/azbyte.jpeg");
  }, [src]);

  return (
    <Image
      src={imgSrc || "/azbyte.jpeg"}
      alt={alt || "Article image"}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className={styles.image}
      style={{ objectFit: "cover" }}
      onError={() => {
        // Only fall back if the real image fails
        setImgSrc("/azbyte.jpeg");
      }}
      // If your images are on external domains not added to next.config.js,
      // temporarily uncomment the next line:
      // unoptimized
      {...props}
    />
  );
};

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
  const [isSharingLinkedIn, setIsSharingLinkedIn] = useState(false);

  const articleUrl = (fallbackId) =>
    isRssPost
      ? rssLink
      : `${process.env.NEXT_PUBLIC_DOMAIN || "https://azbytegems.com"}/article_details/${fallbackId}`;

  const shareToTwitter = async () => {
    setIsSharingTwitter(true);
    try {
      const url = articleUrl(postId);
      const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        `${postTitle}\n\nazbytegems.com`
      )}&url=${encodeURIComponent(url)}`;
      window.open(shareUrl, "_blank", "width=600,height=400");
    } finally {
      setIsSharingTwitter(false);
    }
  };

  const shareToFacebook = async () => {
    setIsSharingFacebook(true);
    try {
      const url = articleUrl(postId);
      const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url
      )}&quote=${encodeURIComponent(postTitle)}`;
      window.open(shareUrl, "facebook-share", "width=626,height=436");
    } finally {
      setIsSharingFacebook(false);
    }
  };

  const shareToLinkedIn = async () => {
    setIsSharingLinkedIn(true);
    try {
      const url = articleUrl(postId);
      const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        url
      )}`;
      window.open(shareUrl, "linkedin-share", "width=626,height=436");
    } finally {
      setIsSharingLinkedIn(false);
    }
  };

  /* --------------------------------------------------------------
   *  Date formatting helper
   * -------------------------------------------------------------- */
  const formatDate = (dateString) => {
    try {
      if (!dateString) return "No date";
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  /* --------------------------------------------------------------
   *  Link wrapper (RSS vs internal)
   * -------------------------------------------------------------- */
  const PostLink = ({ children }) =>
    isRssPost ? (
      <a
        href={rssLink}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.postTitle}
      >
        {children}
      </a>
    ) : (
      <Link href={`/article_details/${postId}`} className={styles.postTitle}>
        {children}
      </Link>
    );

  return (
    <div className={styles.articleCard}>
      {/* ---------- IMAGE ---------- */}
      <div className={styles.postImage}>
        <SafeImage
          src={postImg || "/azbyte.jpeg"}
          alt={postTitle}
          priority={false}
          placeholder="blur"
          blurDataURL="/azbyte.jpeg"
        />
      </div>
      {/* ---------- CONTENT ---------- */}
      <div className={styles.postContent}>
        <PostLink>
          <h4 className={styles.postTitle}>{postTitle}</h4>
        </PostLink>
        <p className={styles.postDesc}>{postDesc}</p>

        {/* ---------- AUTHOR INFO ---------- */}
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

          {/* ---------- SHARE BUTTONS (ICON ONLY) ---------- */}

          <div className={styles.shareButtons}>
            <button
              onClick={shareToTwitter}
              disabled={isSharingTwitter}
              className={`${styles.shareButton} ${styles.twitterButton}`}
              title="Share on X (Twitter)"
            >
              <RiTwitterXFill />
            </button>

            <button
              onClick={shareToFacebook}
              disabled={isSharingFacebook}
              className={`${styles.shareButton} ${styles.facebookButton}`}
              title="Share on Facebook"
            >
              <RiFacebookFill />
            </button>

            <button
              onClick={shareToLinkedIn}
              disabled={isSharingLinkedIn}
              className={`${styles.shareButton} ${styles.linkedinButton}`}
              title="Share on LinkedIn"
            >
              <RiLinkedinFill />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCard;
