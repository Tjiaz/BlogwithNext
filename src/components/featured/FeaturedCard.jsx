"use client";
import React, { useState, useEffect } from "react";
import styles from "./featured.module.css";
import Image from "next/image";
import Link from "next/link";
import { RiRssFill } from "react-icons/ri";
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
    // Validate image URL
    const validateAndSetImage = async (src) => {
      console.log("Image source:", src);
      try {
        // Skip validation for default image
        if (!src || src === "/azbyte.jpeg") return;

        const response = await fetch(src, {
          method: "HEAD",
          mode: "cors",
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        });
        if (!response.ok) {
          console.warn(`Image validation failed: ${src}`);
          setImgSrc("/azbyte.jpeg");
          setError(true);
        }
      } catch (error) {
        console.error("Image Validation Error:", {
          url: src,
          error: error.message,
        });
        setImgSrc("/azbyte.jpeg");
        setError(true);
      }
    };
    validateAndSetImage();
  }, [src]);

  return (
    <Image
      src={imgSrc || "/azbyte.jpeg"}
      alt={alt}
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
  isRssPost,
  rssLink,
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

      toast.success("Successfully shared to Twitter!");
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
          platform: "facebook",
        }),
      });

      const data = await response.json();
      console.log("Facebook share response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to share to Facebook");
      }

      // Ensure shareUrl is present and open the sharing dialog
      if (data.shareUrl) {
        // Optional: Inject Open Graph meta tags dynamically
        if (data.ogMetaTags) {
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = data.ogMetaTags;
          tempDiv.querySelectorAll("meta").forEach((meta) => {
            document.head.appendChild(meta);
          });
        }

        // Open Facebook sharing dialog
        const popup = window.open(
          data.shareUrl,
          "facebook-share-dialog",
          "width=626,height=436"
        );

        // Check if popup was blocked
        if (!popup || popup.closed || typeof popup.closed == "undefined") {
          // Fallback method if popup is blocked
          window.location.href = data.shareUrl;
        } else {
          // Focus on the popup
          popup.focus();
        }

        toast.success("Opening Facebook sharing dialog");
      } else {
        throw new Error("No sharing URL generated");
      }
    } catch (error) {
      console.error("Facebook share error:", error);
      toast.error(`Failed to share to Facebook: ${error.message}`);
    } finally {
      setIsSharingFacebook(false);
    }
  };

  const shareToLinkedIn = async () => {
    setIsSharingLinkedIn(true);
    try {
      // Store the share data before redirect
      const shareData = {
        title: postTitle,
        link: isRssPost
          ? rssLink
          : `${window.location.origin}/article_details/${postId}`,
        description: postDesc,
      };
      localStorage.setItem("linkedin_share_data", JSON.stringify(shareData));
      console.log("Stored share data:", shareData);

      // Get auth URL
      const response = await fetch("/api/linkedin/get-auth-url");
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Redirect to LinkedIn auth
      window.location.href = data.authUrl;
    } catch (error) {
      console.error("LinkedIn share error:", error);
      toast.error("Failed to initialize LinkedIn sharing: " + error.message);
    } finally {
      setIsSharingLinkedIn(false);
    }
  };

  useLinkedInShare(isProcessingLinkedIn, setIsProcessingLinkedIn);

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
              <button
                onClick={shareToLinkedIn}
                disabled={isSharingLinkedIn}
                className={`${styles.shareButton} ${styles.linkedinButton}`}
              >
                {isSharingLinkedIn ? "..." : "Share to LI"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCard;
