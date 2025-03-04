"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./article_details.module.css";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { MdFacebook, MdSearch, MdYoutubeSearchedFor } from "react-icons/md";
import FeaturedCard from "@/components/featured/FeaturedCard";
import { FaLinkedinIn } from "react-icons/fa";
import { BsTwitterX } from "react-icons/bs";

// Function to fetch article by ID
async function getTopicDetails(slug) {
  const response = await fetch(`/api/article_details/${slug}`);
  if (!response.ok) {
    throw new Error("Failed to fetch article details");
  }
  return response.json();
}

export default function ArticleDetails() {
  const { slug } = useParams();

  const [article, setArticle] = useState(null);
  const [error, setError] = useState(null);
  const [latestPosts, setLatestPosts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);

  // Get the page from query params
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const page = parseInt(pageParam, 10) || 1;

  useEffect(() => {
    async function fetchArticles() {
      try {
        const response = await fetch(`/api/latest_articles?page=${page}`);
        const data = await response.json();

        if (Array.isArray(data)) {
          setLatestPosts(data); // If already an array, use it directly
        } else {
          console.error("Unexpected data format", data);
        }
      } catch (error) {
        console.error("Failed to fetch articles", error);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, [page]);

  useEffect(() => {
    // Make sure the router is ready before accessing query params
    if (slug) {
      console.log("Article slug:", slug);
      const fetchArticle = async () => {
        try {
          const data = await getTopicDetails(slug); // Fetch article details
          setArticle(data); // Set article state
        } catch (error) {
          setError(error.message); // Set error state
        }
      };

      fetchArticle(); // Call the async function when id is available
    }
  }, [slug]);

  const shareToSocial = async (platform) => {
    setIsSharing(true);
    try {
      const articleUrl = `${process.env.NEXT_PUBLIC_DOMAIN}/article_details/${article.id}`;

      await fetch("/api/social-share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: article.title,
          link: articleUrl,
          author: article.author,
          description: article.description,
          platform: platform, // Add platform information
        }),
      });

      // Fallback to Web Share API if social API fails
      if (!response.ok) {
        if (navigator.share) {
          await navigator.share({
            title: article.title,
            text: article.author,
            text: article.description,
            url: articleUrl,
          });
        } else {
          // Fallback to opening platform-specific share URLs
          let shareUrl;
          switch (platform) {
            case "facebook":
              shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                articleUrl
              )}`;
              break;
            case "twitter":
              shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                article.title
              )}&url=${encodeURIComponent(articleUrl)}`;
              break;
            case "linkedin":
              shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                articleUrl
              )}`;
              break;
          }
          if (shareUrl) {
            window.open(shareUrl, "_blank", "width=600,height=400");
          }
        }
      }
    } catch (error) {
      console.error("Failed to share:", error);
      alert(`Failed to share to ${platform}. Please try again.`);
    } finally {
      setIsSharing(false);
    }
  };

  return error ? (
    <div>Error: {error}</div>
  ) : !article ? (
    <div className={styles.spinner}></div>
  ) : (
    <div className={styles.container}>
      <div className={styles.advertContainer}>
        <div className={styles.imageadvert}>
          <Image src="/ads.gif" alt="" fill className={styles.image} />
        </div>
        <Link href="/" className={styles.advert}>
          Google-bigquery
        </Link>
      </div>
      <div className={styles.articleInfo}>
        <div className={styles.textContainer1}>
          <h1>{article.title}</h1>
          <p className={styles.meta}>
            By <span className={styles.author}>{article.author}</span> on{" "}
            <span className={styles.date}>{article.date}</span>
          </p>
          <div className={styles.socialLink}>
            <button
              onClick={() => shareToSocial("facebook")}
              className={styles.socialButton}
              disabled={isSharing}
            >
              <MdFacebook className={styles.facebookIcon} />
            </button>

            <button
              onClick={() => shareToSocial("linkedin")}
              className={styles.socialButton}
              disabled={isSharing}
            >
              <FaLinkedinIn className={styles.linkedIcon} />
            </button>

            <button
              onClick={() => shareToSocial("twitter")}
              className={styles.socialButton}
              disabled={isSharing}
            >
              <BsTwitterX className={styles.xIcon} />
            </button>
          </div>
          <hr className={styles.divider} />
          {typeof article.content === "string" ? (
            // For string content (HTML)
            <div
              dangerouslySetInnerHTML={{ __html: article.content }}
              className={styles.paragraphs}
            />
          ) : (
            // For array content (old format)
            Array.isArray(article.content) &&
            article.content.map((section, index) => (
              <div key={index}>
                {article.filtered_images &&
                article.filtered_images.length > 0 ? (
                  <Image
                    src={article.filtered_images[2]}
                    alt="Article image"
                    layout="responsive"
                    width={700}
                    height={475}
                    className={styles.sectionImage}
                  />
                ) : (
                  <Image
                    src="/azbyte.jpeg"
                    alt="Default image"
                    width={700}
                    height={475}
                  />
                )}

                <h2 className={styles.sectionHeading}>{section.heading}</h2>
                {section.paragraphs.map((para, i) => (
                  <p key={i} className={styles.paragraphs}>
                    {para}
                  </p>
                ))}
              </div>
            ))
          )}
        </div>
        <div className={styles.textContainer2}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search AzByteGems..."
            />
            <MdSearch className={styles.searchIcon} />
          </div>
          <div className={styles.advertImgContainer}>
            <Image
              src="/ads2.gif"
              alt="Advert"
              width={300}
              height={250}
              className={styles.advertImg}
            />
          </div>
          <div className={styles.latestPosts}>
            <h3 className={styles.latestPostsTitle}>Latest Posts</h3>
            <div className={styles.latestPostsList}>
              {latestPosts?.length > 0 ? (
                latestPosts.map((post) => (
                  <Link
                    href={`/post/${post._id}`}
                    key={post._id}
                    className={styles.postItem}
                  >
                    {post.title}
                  </Link>
                ))
              ) : (
                <p>No posts found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
