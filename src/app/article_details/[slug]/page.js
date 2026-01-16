"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./article_details.module.css";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { MdFacebook, MdSearch, MdShare, MdBookmarkBorder, MdBookmark } from "react-icons/md";
import { FaLinkedinIn } from "react-icons/fa";
import { BsTwitterX, BsClock } from "react-icons/bs";
import { formatTopic } from "@/utils/formatTopic";

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

  const router = useRouter();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState(null);
  const [latestPosts, setLatestPosts] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
          setLoading(true);
          const data = await getTopicDetails(slug); // Fetch article details
          setArticle(data); // Set article state
          
          // Check if article is bookmarked
          const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
          setIsBookmarked(bookmarks.includes(data.id));

          // Fetch related articles after article is loaded
          if (data.id) {
            setLoadingRelated(true);
            try {
              const relatedResponse = await fetch(`/api/related_articles/${data.id}`);
              if (relatedResponse.ok) {
                const relatedData = await relatedResponse.json();
                setRelatedArticles(Array.isArray(relatedData) ? relatedData : []);
              }
            } catch (relatedError) {
              console.error("Failed to fetch related articles:", relatedError);
            } finally {
              setLoadingRelated(false);
            }
          }
        } catch (error) {
          setError(error.message); // Set error state
        } finally {
          setLoading(false);
        }
      };

      fetchArticle(); // Call the async function when id is available
    }
  }, [slug]);
  
  // Scroll detection for social icons
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY || window.pageYOffset;
      // Show vertical icons when scrolled past 300px, hide when back at top
      setIsScrolled(scrollPosition > 300);
    };

    // Check initial scroll position
    handleScroll();
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate reading time
  const calculateReadingTime = (content) => {
    if (!content) return 0;
    const text = typeof content === "string" 
      ? content.replace(/<[^>]*>/g, "") 
      : JSON.stringify(content);
    const words = text.split(/\s+/).length;
    const readingTime = Math.ceil(words / 200); // Average reading speed: 200 words per minute
    return readingTime;
  };
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  // Toggle bookmark
  const toggleBookmark = () => {
    if (!article) return;
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    if (isBookmarked) {
      const updated = bookmarks.filter((id) => id !== article.id);
      localStorage.setItem("bookmarks", JSON.stringify(updated));
      setIsBookmarked(false);
    } else {
      bookmarks.push(article.id);
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
      setIsBookmarked(true);
    }
  };
  
  // Copy link to clipboard
  const copyToClipboard = async () => {
    if (!article) return;
    const articleUrl = `${window.location.origin}/article_details/${article.id}`;
    try {
      await navigator.clipboard.writeText(articleUrl);
      alert("Link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const shareToSocial = async (platform) => {
    setIsSharing(true);
    try {
      const articleUrl = `${window.location.origin}/article_details/${article.id}`;

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
          {/* Topic Badge */}
          {article.topic && (
            <Link href={`/articles/${article.topic.toLowerCase().replace(/\s+/g, "_")}`} className={styles.topicBadge}>
              {formatTopic(article.topic)}
            </Link>
          )}
          
          <h1>{article.title}</h1>
          
          {/* Article Meta */}
          <div className={styles.metaContainer}>
            <p className={styles.meta}>
              By <span className={styles.author}>{article.author || "Anonymous"}</span>
              {(article.date || article.published_at) && (
                <>
                  {" • "}
                  <span className={styles.date}>{new Date(article.published_at || article.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}</span>
                </>
              )}
              {" • "}
              <span className={styles.readingTime}>
                <BsClock /> {calculateReadingTime(article.content)} min read
              </span>
            </p>
          </div>
          
          {/* Hero Image */}
          {(article.hero_image || article.filtered_images?.[0]) && (
            <div className={styles.heroImageContainer}>
              <Image
                src={article.hero_image || article.filtered_images[0] || "/azbyte.jpeg"}
                alt={article.title}
                width={1200}
                height={675}
                className={styles.heroImage}
                priority
                sizes="(max-width: 768px) 100vw, 1200px"
              />
            </div>
          )}
          
          {/* Action Buttons - Horizontal (shown at top) */}
          <div className={`${styles.actionBar} ${isScrolled ? styles.actionBarHidden : ""}`}>
            <div className={styles.socialLink}>
              <button
                onClick={() => shareToSocial("facebook")}
                className={styles.socialButton}
                disabled={isSharing}
                aria-label="Share on Facebook"
              >
                <MdFacebook className={styles.facebookIcon} />
              </button>
              <button
                onClick={() => shareToSocial("linkedin")}
                className={styles.socialButton}
                disabled={isSharing}
                aria-label="Share on LinkedIn"
              >
                <FaLinkedinIn className={styles.linkedIcon} />
              </button>
              <button
                onClick={() => shareToSocial("twitter")}
                className={styles.socialButton}
                disabled={isSharing}
                aria-label="Share on Twitter"
              >
                <BsTwitterX className={styles.xIcon} />
              </button>
              <button
                onClick={copyToClipboard}
                className={styles.socialButton}
                aria-label="Copy link"
              >
                <MdShare />
              </button>
            </div>
            <button
              onClick={toggleBookmark}
              className={styles.bookmarkButton}
              aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
            >
              {isBookmarked ? <MdBookmark /> : <MdBookmarkBorder />}
            </button>
          </div>
          
          {/* Vertical Social Icons (static on left when scrolled) */}
          <div className={`${styles.verticalSocialIcons} ${isScrolled ? styles.verticalSocialIconsVisible : ""}`}>
            <button
              onClick={() => shareToSocial("facebook")}
              className={styles.verticalSocialButton}
              disabled={isSharing}
              aria-label="Share on Facebook"
            >
              <MdFacebook className={styles.facebookIcon} />
            </button>
            <button
              onClick={() => shareToSocial("linkedin")}
              className={styles.verticalSocialButton}
              disabled={isSharing}
              aria-label="Share on LinkedIn"
            >
              <FaLinkedinIn className={styles.linkedIcon} />
            </button>
            <button
              onClick={() => shareToSocial("twitter")}
              className={styles.verticalSocialButton}
              disabled={isSharing}
              aria-label="Share on Twitter"
            >
              <BsTwitterX className={styles.xIcon} />
            </button>
            <button
              onClick={copyToClipboard}
              className={styles.verticalSocialButton}
              aria-label="Copy link"
            >
              <MdShare />
            </button>
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

          {/* Related Articles Section */}
          {relatedArticles.length > 0 && (
            <div className={styles.relatedArticlesSection}>
              <hr className={styles.divider} />
              <h2 className={styles.relatedArticlesTitle}>Related Articles</h2>
              <div className={styles.relatedArticlesGrid}>
                {relatedArticles.map((relatedArticle) => {
                  // Get image for related article
                  const relatedImage = relatedArticle.hero_image || 
                    (Array.isArray(relatedArticle.filtered_images) && relatedArticle.filtered_images.length > 0 
                      ? relatedArticle.filtered_images[0] 
                      : null) || 
                    "/azbyte.jpeg";
                  
                  return (
                    <Link
                      href={`/article_details/${relatedArticle.id}`}
                      key={relatedArticle.id}
                      className={styles.relatedArticleCard}
                    >
                      <div className={styles.relatedArticleImageContainer}>
                        <Image
                          src={relatedImage}
                          alt={relatedArticle.title}
                          fill
                          className={styles.relatedArticleImage}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      <div className={styles.relatedArticleContent}>
                        <h3 className={styles.relatedArticleTitle}>{relatedArticle.title}</h3>
                        {relatedArticle.description && (
                          <p className={styles.relatedArticleDescription}>
                            {relatedArticle.description.length > 120
                              ? `${relatedArticle.description.substring(0, 120)}...`
                              : relatedArticle.description}
                          </p>
                        )}
                        <div className={styles.relatedArticleMeta}>
                          <span className={styles.relatedArticleAuthor}>
                            {relatedArticle.author || "Anonymous"}
                          </span>
                          {relatedArticle.date && (
                            <>
                              {" • "}
                              <span className={styles.relatedArticleDate}>
                                {new Date(relatedArticle.date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className={styles.textContainer2}>
          <form onSubmit={handleSearch} className={styles.searchContainer}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search AzByteGems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className={styles.searchButton} aria-label="Search">
              <MdSearch className={styles.searchIcon} />
            </button>
          </form>
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
                    href={`/article_details/${post.id || post._id}`}
                    key={post.id || post._id}
                    className={styles.postItem}
                  >
                    <span className={styles.postTitle}>{post.title}</span>
                    {post.date && (
                      <span className={styles.postDate}>
                        {new Date(post.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </Link>
                ))
              ) : (
                <p className={styles.noPosts}>No posts found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
