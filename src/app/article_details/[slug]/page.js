"use client";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import styles from "./article_details.module.css";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { MdFacebook, MdSearch } from "react-icons/md";
import Head from "next/head";

import { FaLinkedinIn } from "react-icons/fa";
import { BsEnvelope, BsMailbox, BsMessenger, BsTwitterX } from "react-icons/bs";
import Comments from "@/components/comments/Comments";
import { getCurrentAdvert } from "@/utils/advert";

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
  const [isScrolled, setIsScrolled] = useState(false);

  const articleRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (articleRef.current) {
        const { top } = articleRef.current.getBoundingClientRect();
        setIsScrolled(top < -100); // Adjust this value as needed
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  <Head>
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@azbytegems" />
    <meta
      name="twitter:title"
      content={article?.title || "AzByteGems Article"}
    />
    <meta name="twitter:description" content={article?.description || ""} />
    <meta
      name="twitter:image"
      content={
        article?.filtered_images?.[0] ||
        article?.content ||
        `${process.env.NEXT_PUBLIC_DOMAIN || "https://azbytegems.com"}/azbyte.jpeg`
      }
    />
    <meta name="twitter:domain" content="azbytegems.com" />
  </Head>;

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

      // Prepare image URL
      const imageUrl =
        article.filtered_images?.[0] || article.image || "/azbyte.jpeg";

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
          image: imageUrl,
          platform: platform,
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

  const currentAdvert = getCurrentAdvert();

  return error ? (
    <div>Error: {error}</div>
  ) : !article ? (
    <div className={styles.spinner}></div>
  ) : (
    <div className={styles.container}>
      <div className={styles.advertContainer}>
        <div className={styles.imageadvert}>
          <Image
            src={currentAdvert.gif1}
            alt=""
            fill
            className={styles.image}
          />
        </div>
        <Link href={currentAdvert.link} className={styles.advert}>
          {currentAdvert.name}
        </Link>
      </div>
      <div className={styles.articleInfo}>
        <div className={styles.textContainer1} ref={articleRef}>
          <h1>{article.title}</h1>
          <p className={styles.meta}>
            By <span className={styles.author}>{article.author}</span> on{" "}
            <span className={styles.date}>{article.date}</span>
          </p>
          <div className={styles.socialLinksWrapper}>
            <div
              className={`${styles.socialLink} ${isScrolled ? styles.vertical : styles.horizontal}`}
            >
              <button
                onClick={() => shareToSocial("facebook")}
                className={`${styles.socialButton} ${styles.facebookButton}`}
                disabled={isSharing}
              >
                <MdFacebook className={styles.facebookIcon} />
              </button>

              <button
                onClick={() => shareToSocial("linkedin")}
                className={`${styles.socialButton} ${styles.linkedinButton}`}
                disabled={isSharing}
              >
                <FaLinkedinIn className={styles.linkedIcon} />
              </button>

              <button
                onClick={() => shareToSocial("twitter")}
                className={`${styles.socialButton} ${styles.xButton}`}
                disabled={isSharing}
              >
                <BsTwitterX className={styles.xIcon} />
              </button>

              <button
                onClick={() => shareToSocial("twitter")}
                className={`${styles.socialButton} ${styles.emailButton}`}
                disabled={isSharing}
              >
                <BsEnvelope className={styles.emailIcon} />
              </button>
            </div>
          </div>
          <hr className={styles.divider} />
          {typeof article.content === "string" ? (
            // For string content (HTML)
            <div
              dangerouslySetInnerHTML={{
                __html: article.content.replace(
                  /<img/g,
                  '<img class="imageResizer" style="max-width:100%; height:auto;"'
                ),
              }}
              className={styles.paragraphs}
            />
          ) : (
            // For array content (old format)
            Array.isArray(article.content) &&
            article.content.map((section, index) => (
              <div key={index}>
                {article.filtered_images &&
                article.filtered_images.length > 0 ? (
                  <div className={styles.imageContainer}>
                    <Image
                      src={
                        article.filtered_images?.[0] ||
                        article.image ||
                        "/default.jpg"
                      }
                      alt="Article image"
                      sizes="(max-width: 768px) 100vw, 800px"
                      width={800}
                      height={600}
                      className={styles.imageResizer}
                      priority={false}
                      quality={75}
                    />
                  </div>
                ) : (
                  <Image
                    src="/azbyte.jpeg"
                    alt="Default image"
                    width={700}
                    height={475}
                    className={styles.imageResizer}
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
              src={currentAdvert.gif2}
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
                    href={`/article_details/${post._id}`}
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

      <Comments />
    </div>
  );
}
