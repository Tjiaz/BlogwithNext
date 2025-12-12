"use client";
import React, { useState, useEffect } from "react";
import styles from "./featured.module.css";
import Image from "next/image";
import Link from "next/link";
import { BsTwitterX, BsFacebook, BsLinkedin } from "react-icons/bs";
import toast from "react-hot-toast";

const useLinkedInShare = (isProcessingLinkedIn, setIsProcessingLinkedIn) => {
  useEffect(() => {
    const handleLinkedInCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const linkedinSuccess = params.get("linkedin_success");
      const accessToken = params.get("access_token");
      const error = params.get("error");

      if (linkedinSuccess === "true" && accessToken && !isProcessingLinkedIn) {
        setIsProcessingLinkedIn(true);
      }
    };

    handleLinkedInCallback();
  }, [isProcessingLinkedIn, setIsProcessingLinkedIn]);
};

const SafeImage = ({ src, alt, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [error, setError] = useState(false);

  useEffect(() => {
    // If no src is provided, set to default
    if (!src) {
      setImgSrc("/azbyte.jpeg");
      return;
    }

    // Normalize the URL
    const normalizeUrl = (url) => {
      // Reject base64 data URIs that are too long (they cause 414 errors)
      if (url && url.startsWith("data:image")) {
        // Base64 data URIs should be under 2MB (roughly 2.6M characters)
        // If longer, reject it to avoid 414 URI Too Long errors
        if (url.length > 2000000) {
          console.warn("Base64 image too large, using default image");
          return "/azbyte.jpeg";
        }
        // For valid base64, return as is (don't prepend site URL)
        return url;
      }

      // If it's an absolute URL, return as is
      if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
        return url;
      }

      // If it's a relative URL, prepend the site URL
      if (url && url.startsWith("/")) {
        return `${process.env.NEXT_PUBLIC_SITE_URL || "https://azbytegems.com"}${url}`;
      }

      // Invalid URL, return default
      return "/azbyte.jpeg";
    };

    // Try to validate the image
    const validateImage = async () => {
      try {
        const normalizedSrc = normalizeUrl(src);

        // Create an image element to check if it loads
        const img = document.createElement("img");
        img.onload = () => {
          setImgSrc(normalizedSrc);
        };
        img.onerror = () => {
          console.warn(`Image failed to load: ${normalizedSrc}`);
          setImgSrc("/azbyte.jpeg");
          setError(true);
        };
        img.src = normalizedSrc;
      } catch (error) {
        console.error("Image validation error:", error);
        setImgSrc("/azbyte.jpeg");
        setError(true);
      }
    };

    validateImage();
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
        setImgSrc("/azbyte.jpeg");
        setError(true);
      }}
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
}) => {
  const [isSharingTwitter, setIsSharingTwitter] = useState(false);
  const [isSharingFacebook, setIsSharingFacebook] = useState(false);
  const [isSharingLinkedIn, setIsSharingLinkedIn] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isProcessingLinkedIn, setIsProcessingLinkedIn] = useState(false);

  useEffect(() => {
    const handleLinkedInCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const linkedinSuccess = params.get("linkedin_success");
      const accessToken = params.get("access_token");
      const error = params.get("error");

      if (linkedinSuccess === "true" && accessToken) {
        try {
          const storedData = localStorage.getItem("linkedin_share_data");
          if (!storedData) {
            throw new Error("No share data found");
          }

          const shareData = JSON.parse(storedData);

          const response = await fetch("/api/social_share", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "linkedin-access-token": accessToken,
            },
            body: JSON.stringify({
              ...shareData,
              platform: "linkedin",
            }),
          });

          const data = await response.json();

          if (data.success) {
            toast.success("Successfully shared to LinkedIn!");
          } else {
            throw new Error(data.error || "Failed to share to LinkedIn");
          }
        } catch (error) {
          console.error("LinkedIn share error:", error);
          toast.error(`Failed to share to LinkedIn: ${error.message}`);
        } finally {
          localStorage.removeItem("linkedin_share_data");
          window.history.replaceState({}, "", window.location.pathname);
        }
      } else if (error) {
        toast.error(`LinkedIn Error: ${error}`);
        localStorage.removeItem("linkedin_share_data");
        window.history.replaceState({}, "", window.location.pathname);
      }
    };

    handleLinkedInCallback();
  }, []);

  const shareToTwitter = async () => {
    setIsSharingTwitter(true);
    try {
      const articleUrl = `${
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
          platform: "twitter",
        }),
      });

      const data = await response.json();
      console.log("Twitter share response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to share to Twitter");
      }

      toast.success("Successfully shared to X!");
    } catch (error) {
      console.error("Twitter share error:", error);
      toast.error("Failed to share to X. Please try again.");
    } finally {
      setIsSharingTwitter(false);
    }
  };

  const shareToFacebook = async () => {
    setIsSharingFacebook(true);
    try {
      const articleUrl = `${
        process.env.NEXT_PUBLIC_DOMAIN || "https://azbytegems.com"
      }/article_details/${postId}`;

      const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        articleUrl
      )}&quote=${encodeURIComponent(postTitle)}`;

      // Open Facebook share dialog
      window.open(
        facebookShareUrl,
        "facebook-share-dialog",
        "width=626,height=436"
      );

      toast.success("Opening Facebook sharing dialog");
    } catch (error) {
      console.error("Facebook share error:", error);
      toast.error(`Failed to share to Facebook: ${error.message}`);
    } finally {
      setIsSharingFacebook(false);
    }
  };

  const shareToLinkedIn = async () => {
    try {
      const articleUrl = `${
        process.env.NEXT_PUBLIC_DOMAIN || "https://azbytegems.com"
      }/article_details/${postId}`;

      // Create LinkedIn share URL
      const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        articleUrl
      )}`;

      // Open LinkedIn share dialog
      window.open(
        linkedInShareUrl,
        "linkedin-share-dialog",
        "width=626,height=436"
      );

      toast.success("Opening LinkedIn sharing dialog");
    } catch (error) {
      console.error("LinkedIn share error:", error);
      toast.error(`Failed to share to LinkedIn: ${error.message}`);
    } finally {
      setIsSharingLinkedIn(false);
    }
  };

  useLinkedInShare(isProcessingLinkedIn, setIsProcessingLinkedIn);

  // Format the date
  const formatDate = (dateString) => {
    try {
      if (!dateString) {
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

  // Post link component
  const PostLink = ({ children }) => {
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
          src={postImg || "/azbyte.jpeg"}
          alt={postTitle}
          priority={false}
          placeholder="blur"
          blurDataURL="/azbyte.jpeg"
        />
      </div>
      <div className={styles.postContent}>
        <PostLink>
          <h4 className={styles.postTitle}>{postTitle}</h4>
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
              <Link href={`/articles/${postTopic}`}>{postTopic}</Link>
            </strong>
          </div>
          <div className={styles.badgeAndShare}>
            <div className={styles.shareButtons}>
              <button
                onClick={shareToTwitter}
                disabled={isSharingTwitter}
                className={`${styles.shareButton} ${styles.twitterButton}`}
                aria-label="Share to X"
                title="Share to X"
              >
                {isSharingTwitter ? (
                  <span className={styles.loadingSpinner}>...</span>
                ) : (
                  <BsTwitterX className={styles.shareIcon} />
                )}
              </button>
              <button
                onClick={shareToFacebook}
                disabled={isSharingFacebook}
                className={`${styles.shareButton} ${styles.facebookButton}`}
                aria-label="Share to Facebook"
                title="Share to Facebook"
              >
                {isSharingFacebook ? (
                  <span className={styles.loadingSpinner}>...</span>
                ) : (
                  <BsFacebook className={styles.shareIcon} />
                )}
              </button>
              <button
                onClick={shareToLinkedIn}
                disabled={isSharingLinkedIn}
                className={`${styles.shareButton} ${styles.linkedinButton}`}
                aria-label="Share to LinkedIn"
                title="Share to LinkedIn"
              >
                {isSharingLinkedIn ? (
                  <span className={styles.loadingSpinner}>...</span>
                ) : (
                  <BsLinkedin className={styles.shareIcon} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCard;
