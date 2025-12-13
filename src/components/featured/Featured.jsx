"use client";
import React, { useState, useEffect, Suspense } from "react";
import styles from "./featured.module.css";
import Image from "next/image";
import Link from "next/link";
import { MdSearch } from "react-icons/md";
import FeaturedCard from "./FeaturedCard";
import Pagination from "../pagination/Pagination";
import { useSearchParams } from "next/navigation";
import LoadingPlaceholder from "./LoadingPlaceholder";
import {
  fetchWithCache,
  getCachedData,
  getCacheKey,
  clearCache,
} from "@/utils/cache";

const POSTS_PER_PAGE = 8;

const extractImageFromContent = (content) => {
  try {
    // If content is a string or array
    const imageRegexes = [
      /!\[.*?\]\((.*?)\)/, // Markdown image syntax
      /<img[^>]+src=["']([^"'>]+)["'][^>]*>/i, // HTML img tag
      /https?:\/\/\S+\.(?:jpg|jpeg|gif|png|webp)/i, // Direct image URLs
    ];

    // Handle different content types
    const contentString =
      typeof content === "string"
        ? content
        : Array.isArray(content)
        ? content
            .map((section) =>
              section.paragraphs ? section.paragraphs.join(" ") : ""
            )
            .join(" ")
        : "";

    for (let regex of imageRegexes) {
      const match = contentString.match(regex);
      if (match && match[1]) {
        const imageUrl = match[1];

        // Reject base64 data URIs that are too long (they cause 414 errors)
        if (imageUrl.startsWith("data:image")) {
          if (imageUrl.length > 2000000) {
            console.warn("Base64 image too large, skipping");
            continue; // Skip this image, try next one
          }
          // For valid base64, return as is (don't normalize)
          return imageUrl;
        }

        // Normalize regular URLs
        const normalizedUrl = imageUrl.startsWith("/")
          ? `${
              process.env.NEXT_PUBLIC_SITE_URL || "https://azbytegems.com"
            }${imageUrl}`
          : imageUrl;
        return normalizedUrl;
      }
    }

    return null;
  } catch (error) {
    console.error("Error extracting image from content:", error);
    return null;
  }
};

const Featured = () => {
  // Get the page from query params
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const page = parseInt(pageParam, 10) || 1;

  // Load cached data immediately on mount for instant display
  const [state, setState] = useState(() => {
    if (typeof window === "undefined") {
      return { latestPosts: [], topPosts: [], rssPosts: [], loading: true };
    }

    try {
      // Use page 1 for initial cache load (most common case)
      const initialPage = 1;
      const latestCache = getCachedData(
        getCacheKey(`/api/latest_articles`, { page: initialPage })
      );
      const topPostsCache = getCachedData(
        getCacheKey(`/api/topArticles`, { page: 1 })
      );
      const rssCache = getCachedData(getCacheKey(`/api/rss`, {}));

      // Handle both optimized (array) and full (object with articles) formats
      let latestArticles = [];
      if (Array.isArray(latestCache)) {
        latestArticles = latestCache;
      } else if (latestCache?.articles && Array.isArray(latestCache.articles)) {
        latestArticles = latestCache.articles;
      } else if (latestCache && typeof latestCache === "object") {
        // Try to extract articles from any object structure
        console.warn(
          "Unexpected cache format, attempting to extract articles:",
          Object.keys(latestCache)
        );
        latestArticles = [];
      }

      const topPostsArray = Array.isArray(topPostsCache) ? topPostsCache : [];
      const rssArray = Array.isArray(rssCache) ? rssCache : [];

      const hasCache = latestArticles.length > 0 || topPostsArray.length > 0;

      return {
        latestPosts: latestArticles,
        topPosts: topPostsArray.slice(0, 7),
        rssPosts: rssArray,
        loading: !hasCache, // Only show loading if no cache at all
      };
    } catch (error) {
      console.warn("Error loading cache:", error);
      return { latestPosts: [], topPosts: [], rssPosts: [], loading: true };
    }
  });

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Load cache immediately on mount if not already loaded
  useEffect(() => {
    // Only fetch if we don't have cached data already displayed
    if (state.latestPosts.length > 0 || state.topPosts.length > 0) {
      // We already have cache, just refresh in background
      return;
    }
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Use cached fetch for better performance
        const [mongoResult, rssResult, topPostsResult] = await Promise.all([
          fetchWithCache(
            `/api/latest_articles`,
            { params: { page } },
            5 * 60 * 1000
          ), // 5 min cache
          fetchWithCache(`/api/rss`, {}, 10 * 60 * 1000), // 10 min cache for RSS
          fetchWithCache(
            `/api/topArticles`,
            { params: { page: 1 } },
            5 * 60 * 1000
          ), // 5 min cache
        ]);

        // Log cache hits for debugging
        if (mongoResult.fromCache) {
          console.log("Latest articles loaded from cache (async)");
        } else {
          console.log("Latest articles fetched fresh");
        }
        if (topPostsResult.fromCache) {
          console.log("Top posts loaded from cache (async)");
        } else {
          console.log("Top posts fetched fresh");
        }

        const mongoData = mongoResult.data;
        const rssData = rssResult.data || [];
        const topPostsData = topPostsResult.data || [];

        // Debug logging
        console.log("Latest articles API response:", {
          isArray: Array.isArray(mongoData),
          hasArticles: mongoData?.articles,
          dataKeys: mongoData ? Object.keys(mongoData) : [],
          dataLength: Array.isArray(mongoData)
            ? mongoData.length
            : mongoData?.articles?.length || 0,
          sample: Array.isArray(mongoData)
            ? mongoData[0]
            : mongoData?.articles?.[0],
        });

        // Handle new API response format (object with articles array) or old format (direct array)
        let mongoArticles = [];
        if (Array.isArray(mongoData)) {
          // Direct array format
          mongoArticles = mongoData;
        } else if (mongoData && typeof mongoData === "object") {
          // Object format - try to extract articles
          if (mongoData.articles && Array.isArray(mongoData.articles)) {
            mongoArticles = mongoData.articles;
          } else {
            // If it's an object but no articles property, check if it's an array-like object
            console.warn(
              "API returned object but no articles property. Keys:",
              Object.keys(mongoData)
            );
            // Try to find any array property
            for (const key in mongoData) {
              if (Array.isArray(mongoData[key])) {
                console.log(
                  `Found array in key "${key}", using it as articles`
                );
                mongoArticles = mongoData[key];
                break;
              }
            }
          }
        }

        console.log("Processed mongoArticles:", mongoArticles.length);
        if (mongoArticles.length === 0 && mongoData) {
          console.error("Failed to extract articles from response:", mongoData);
          // Clear cache if data is malformed
          if (mongoResult.fromCache) {
            console.log("Clearing potentially corrupted cache...");
            clearCache(getCacheKey(`/api/latest_articles`, { page }));
          }
        }

        const getFirstImageFromContent = (content) => {
          if (!content) return null;
          const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
          return imgMatch ? imgMatch[1] : null;
        };

        // Ensure rssData is an array
        const rssDataArray = Array.isArray(rssData) ? rssData : [];
        const transformedRssData = rssDataArray.map((item) => ({
          ...item,
          id: item.guid,
          title: item.title?.trim(),
          description: item.contentSnippet || item.description || "",
          date: item.isoDate || item.pubDate,
          author: item.author?.trim().replace(/\n/g, "") || "RSS Feed",
          link: item.link?.trim(),
          topic: "RSS Feed",
          img:
            item.enclosure?.url ||
            item.image ||
            getFirstImageFromContent(item.content) ||
            "/azbyte.jpeg",
          isRssPost: true,
        }));

        // Create a Set to track unique articles by ID
        const uniquePosts = new Set();

        // Add MongoDB posts
        if (Array.isArray(mongoArticles)) {
          mongoArticles.forEach((post) => {
            uniquePosts.add(post.id || post._id);
          });
        }

        // Add RSS posts, avoiding duplicates
        const uniqueRssPosts = transformedRssData.filter((post) => {
          if (!uniquePosts.has(post.guid || post.id)) {
            uniquePosts.add(post.guid || post.id);
            return true;
          }
          return false;
        });

        // MongoDB posts are already paginated by the API, so use them directly
        // Ensure topPostsData is an array
        const topPostsArray = Array.isArray(topPostsData) ? topPostsData : [];

        // Only update state if data has changed or we're loading fresh data
        setState((prevState) => {
          // Check if data actually changed to avoid unnecessary re-renders
          const latestChanged =
            JSON.stringify(prevState.latestPosts) !==
            JSON.stringify(mongoArticles);
          const topChanged =
            JSON.stringify(prevState.topPosts) !==
            JSON.stringify(topPostsArray.slice(0, 7));
          const rssChanged =
            JSON.stringify(prevState.rssPosts) !==
            JSON.stringify(transformedRssData);

          if (latestChanged || topChanged || rssChanged || prevState.loading) {
            return {
              latestPosts: mongoArticles, // Already paginated by API
              topPosts: topPostsArray.slice(0, 7),
              rssPosts: Array.isArray(transformedRssData)
                ? transformedRssData
                : [],
              loading: false,
            };
          }

          // Data hasn't changed, just update loading state
          return { ...prevState, loading: false };
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setState({
          latestPosts: [],
          topPosts: [],
          rssPosts: [],
          loading: false,
        });
      }
    };

    fetchAllData();
  }, [page]);

  if (state.loading) {
    return <div className={styles.spinner}></div>;
  }

  const hasPrev = page > 1;
  // Check if there are more posts (if we got a full page, there might be more)
  const hasNext = state.latestPosts.length >= POSTS_PER_PAGE;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  const filteredPosts = state.latestPosts.filter((post) =>
    post?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.advertsContainer}>
        <div className={styles.imageadvert}>
          <Image src="/ads.gif" alt="advert" fill className={styles.image} />
        </div>
        <Link href="/" className={styles.advert}>
          Google-bigquery
        </Link>
      </div>
      <div className={styles.post}>
        <div className={styles.textContainer1}>
          <h2 className={styles.latestPostsTitle}>Latest Articles</h2>
          <Suspense fallback={<LoadingPlaceholder count={8} />}>
            {filteredPosts && filteredPosts.length > 0 ? (
              filteredPosts.map((post, index) => {
                // Get image, filtering out invalid base64 URIs
                let imageToUse = "/azbyte.jpeg";
                if (post.filtered_images && post.filtered_images.length > 0) {
                  const firstImage = post.filtered_images[0];
                  // Reject base64 data URIs that are too long
                  if (firstImage && firstImage.startsWith("data:image")) {
                    if (firstImage.length <= 2000000) {
                      imageToUse = firstImage;
                    }
                  } else if (firstImage) {
                    imageToUse = firstImage;
                  }
                } else if (post.content) {
                  const extracted = extractImageFromContent(post.content);
                  if (extracted) {
                    imageToUse = extracted;
                  }
                }

                return (
                  <React.Fragment key={post._id || post.id}>
                    <FeaturedCard
                      postImg={imageToUse}
                      postTitle={post.title}
                      postDesc={
                        post.description ||
                        post.desc ||
                        "No description available"
                      }
                      postAuthor={post.author}
                      postDate={post.date}
                      postTopic={post.topic}
                      postId={post.id || post._id}
                    />
                    {/* Insert ad between 3rd and 4th article */}
                    {index === 2 && (
                      <div className={styles.inlineAdContainer}>
                        <div className={styles.inlineAdImage}>
                          <Image
                            src="/ads2.gif"
                            alt="advertisement"
                            width={728}
                            height={90}
                            className={styles.inlineAdImg}
                          />
                        </div>
                        <Link href="/" className={styles.inlineAdLink}>
                          Google-bigquery
                        </Link>
                      </div>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <div>No articles found.</div>
            )}
          </Suspense>

          <Pagination page={page} hasPrev={hasPrev} hasNext={hasNext} />
        </div>

        <div className={styles.textContainer2}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search AzByteGems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <MdSearch className={styles.searchIcon} />
          </div>
          <div className={styles.advertImgContainer}>
            <Image
              src="/ads2.gif"
              alt="advert"
              width={100}
              height={100}
              className={styles.advertImg}
            />
            <Link className={styles.ads_name} href="/">
              Google-bigquery
            </Link>
          </div>
          <div>
            <h3>Top Posts</h3>
          </div>
          <div className={styles.topPosts}>
            <ol className={styles.noListStyle}>
              {state.topPosts && state.topPosts.length > 0 ? (
                state.topPosts.map((post) => (
                  <li key={post.id} className={styles.listItem}>
                    <Link href={`/article_details/${post.id}`}>
                      {post.title}
                    </Link>
                  </li>
                ))
              ) : (
                <li>No top posts found.</li>
              )}
            </ol>
          </div>
          <div className={styles.advertImgContainer}>
            <Image
              src="/ads2.gif"
              alt="advert"
              width={100}
              height={100}
              className={styles.advertImg}
            />
            <Link className={styles.ads_name} href="/">
              Google-bigquery
            </Link>
          </div>
          <div className={styles.signupContainer}>
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                className={styles.searchInput}
                value={email}
                placeholder="Your Email"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "#0B73B1",
                  color: "#fff",
                  border: "none",
                  fontWeight: "bold",
                  cursor: "pointer",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                sign up
              </button>
            </form>
            {status === "success" && (
              <p style={{ color: "green", marginTop: "10px" }}>
                Thank you for subscribing!
              </p>
            )}
            {status === "error" && (
              <p style={{ color: "red", marginTop: "10px" }}>
                Something went wrong. Please try again.
              </p>
            )}
            <p
              style={{
                fontSize: "12px",
                marginTop: "10px",
                color: "#555",
                textAlign: "center",
              }}
            >
              By subscribing you accept our{" "}
              <a href="/privacy-policy" style={{ color: "#0B73B1" }}>
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Featured;
