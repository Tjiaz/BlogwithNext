"use client";
import React, { useState, useEffect } from "react";
import styles from "./featured.module.css";
import Image from "next/image";
import Link from "next/link";
import { MdSearch } from "react-icons/md";
import FeaturedCard from "./FeaturedCard";
import Pagination from "../pagination/Pagination";
import { useSearchParams } from "next/navigation";
import SubscribeModal from "../subscribeModal/SubscribeModal";

const POSTS_PER_PAGE = 8;

const Featured = () => {
  const [latestPosts, setLatestPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topPosts, setTopPosts] = useState([]);
  const [rssPosts, setRssPosts] = useState([]);
  const [loadingTopPosts, setLoadingTopPosts] = useState(true);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  // Get the page from query params
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const page = parseInt(pageParam, 10) || 1;

  // Check for first visit using localStorage
  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");
    if (!hasVisited) {
      setShowModal(true);
      localStorage.setItem("hasVisited", "true");
    }
  }, []);

  // useEffect(() => {
  //   async function fetchArticles() {
  //     try {
  //       const mongoResponse = await fetch(`/api/latest_articles?page=${page}`);
  //       const rssResponse = await fetch("/api/rss");

  //       const [mongoData, rssData] = await Promise.all([
  //         mongoResponse.json(),
  //         rssResponse.json(),
  //       ]);

  //       // Transform RSS data
  //       const transformedRssData = rssData.map((item) => ({
  //         ...item,
  //         id: item.guid,
  //         title: item.title?.trim(),
  //         description: item.contentSnippet || item.description || "",
  //         date: item.isoDate || item.pubDate,
  //         author: item.author?.trim().replace(/\n/g, "") || "RSS Feed",
  //         link: item.link?.trim(),
  //         topic: "RSS Feed",
  //         img: item.image || "/azbyte.jpeg",
  //         isRssPost: true,
  //       }));

  //       // Create a Map to store unique posts by ID
  //       const uniquePosts = new Map();

  //       // Add MongoDB posts
  //       mongoData.forEach((post) => {
  //         const key = post.id || post._id;
  //         uniquePosts.set(key, post);
  //       });

  //       // Add RSS posts, avoiding duplicates
  //       transformedRssData.forEach((post) => {
  //         const key = post.guid || post.id;
  //         if (!uniquePosts.has(key)) {
  //           uniquePosts.set(key, post);
  //         }
  //       });

  //       // Convert Map to array and sort by date
  //       const allPosts = Array.from(uniquePosts.values()).sort((a, b) => {
  //         const dateA = new Date(a.date || a.pubDate || a.isoDate);
  //         const dateB = new Date(b.date || b.pubDate || b.isoDate);
  //         return dateB - dateA;
  //       });

  //       // Paginate the combined, unique posts
  //       const startIndex = (page - 1) * POSTS_PER_PAGE;
  //       const endIndex = startIndex + POSTS_PER_PAGE;
  //       const paginatedPosts = allPosts.slice(startIndex, endIndex);

  //       setLatestPosts(paginatedPosts);
  //       // Store RSS posts separately if needed
  //       setRssPosts(transformedRssData);
  //     } catch (error) {
  //       console.error("Failed to fetch articles:", error);
  //       setLatestPosts([]);
  //       setRssPosts([]);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  //   fetchArticles();
  // }, [page]);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const mongoResponse = await fetch(`/api/latest_articles?page=${page}`);
        const rssResponse = await fetch("/api/rss");

        const [mongoData, rssData] = await Promise.all([
          mongoResponse.json(),
          rssResponse.json(),
        ]);

        const getFirstImageFromContent = (content) => {
          if (!content) return null;
          const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
          return imgMatch ? imgMatch[1] : null;
        };

        const transformedRssData = rssData.map((item) => {
          const imageFromContent = getFirstImageFromContent(item.content);
          console.log("Image from content:", imageFromContent); // Log the extracted image URL
          return {
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
              imageFromContent ||
              "/azbyte.jpeg", // Use image from content if available
            isRssPost: true,
          };
        });

        // Create a Set to track unique articles by ID
        const uniquePosts = new Set();

        // Add MongoDB posts
        mongoData.forEach((post) => {
          uniquePosts.add(post.id || post._id);
        });

        // Add RSS posts, avoiding duplicates
        const uniqueRssPosts = transformedRssData.filter((post) => {
          if (!uniquePosts.has(post.guid || post.id)) {
            uniquePosts.add(post.guid || post.id);
            return true;
          }
          return false;
        });

        // Combine MongoDB and unique RSS posts
        const combinedPosts = [...mongoData, ...uniqueRssPosts];

        // Sort combined posts by date (newest first)
        combinedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Paginate the combined posts
        const startIndex = (page - 1) * POSTS_PER_PAGE;
        const endIndex = startIndex + POSTS_PER_PAGE;
        const paginatedPosts = combinedPosts.slice(startIndex, endIndex);

        setLatestPosts(paginatedPosts);
        setRssPosts(transformedRssData); // Store RSS posts separately if needed
      } catch (error) {
        console.error("Failed to fetch articles:", error);
        setLatestPosts([]);
        setRssPosts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, [page]);

  const extractImageFromContent = (content) => {
    try {
      // Check if content exists and is a string
      if (!content || typeof content !== "string") return null;

      const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
      return imgMatch ? imgMatch[1] : null;
    } catch (error) {
      console.error("Error extracting image from content:", error);
      return null;
    }
  };

  useEffect(() => {
    async function fetchTopPosts() {
      try {
        const response = await fetch(`/api/topArticles?page=1`);
        const data = await response.json();

        if (Array.isArray(data)) {
          setTopPosts(data.slice(0, 7)); // Limit to 5 articles
        } else {
          console.error("Unexpected data format", data);
        }
      } catch (error) {
        console.error("Failed to fetch top posts", error);
      } finally {
        setLoadingTopPosts(false);
      }
    }
    fetchTopPosts();
  }, []); // Empty dependency array to run once on component mount

  if (loading || loadingTopPosts) {
    return <div className={styles.spinner}></div>;
  }

  const hasPrev = page > 1;
  const hasNext = latestPosts.length >= POSTS_PER_PAGE;

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

  // First, ensure both arrays exist and are actually arrays
  // const combinedPosts = () => {
  //   const mongoPosts = Array.isArray(latestPosts) ? latestPosts : [];
  //   const rss = Array.isArray(rssPosts) ? rssPosts : [];

  //   return [...mongoPosts, ...rss].sort((a, b) => {
  //     const dateA = new Date(a.date || a.pubDate);
  //     const dateB = new Date(b.date || b.pubDate);
  //     return dateB - dateA;
  //   });
  // };

  // Then use it in your filter
  const filteredPosts = latestPosts.filter((post) =>
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
          <h2>Current Posts</h2>
          <div style={{ display: "flex", width: "100%" }}>
            <div
              style={{ flex: "0 0 25%", borderBottom: "3px solid #0B73B1" }}
            ></div>
            <div style={{ flex: "1", borderBottom: "2px solid #0B73B1" }}></div>
          </div>

          {filteredPosts && filteredPosts.length > 0 ? (
            filteredPosts.map((post) => {
              // Determine which image to use
              const imageToUse = post.isRssPost
                ? post.img || "/azbyte.jpeg" // RSS posts
                : post.filtered_images && post.filtered_images.length > 0
                ? post.filtered_images[0]
                : post.content && extractImageFromContent(post.content)
                ? extractImageFromContent(post.content)
                : "/azbyte.jpeg";

              // Log the post date information
              console.log("Post date info:", {
                title: post.title,
                isoDate: post.isoDate,
                pubDate: post.pubDate,
                date: post.date,
              });

              // Choose the most appropriate date
              const postDate = post.isRssPost
                ? post.isoDate || post.pubDate || post.date
                : post.date;

              return (
                <FeaturedCard
                  key={post.isRssPost ? post.guid : post._id}
                  postImg={imageToUse}
                  postTitle={post.title}
                  postDesc={post.isRssPost ? post.description : post.desc}
                  postAuthor={post.author}
                  postDate={postDate}
                  postTopic={post.isRssPost ? "RSS Feed" : post.topic}
                  postId={post.isRssPost ? post.guid : post.id}
                  isRssPost={post.isRssPost}
                  rssLink={post.isRssPost ? post.link : null}
                />
              );
            })
          ) : (
            <div>No articles found.</div>
          )}

          <Pagination page={page} hasPrev={hasPrev} hasNext={hasNext} />
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
              alt="advert"
              width={100}
              height={100}
              className={styles.advertImg}
            />
            <Link href="/">Google-bigquery</Link>
          </div>
          <div>
            <h3>Top Posts</h3>
            <div style={{ display: "flex", width: "100%" }}>
              <div
                style={{ flex: "0 0 25%", borderBottom: "3px solid #0B73B1" }}
              ></div>
              <div
                style={{ flex: "1", borderBottom: "2px solid #0B73B1" }}
              ></div>
            </div>
          </div>
          <div className={styles.topPosts}>
            <ol className={styles.noListStyle}>
              {topPosts && topPosts.length > 0 ? (
                topPosts.map((post) => (
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
            <Link href="/">Google-bigquery</Link>
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
                href="/"
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
                // className={styles.signupbutton}
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
      <div>
        {/* Modal */}
        <SubscribeModal show={showModal} onClose={() => setShowModal(false)} />
      </div>
    </div>
  );
};

export default Featured;
