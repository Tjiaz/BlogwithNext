"use client";
import React, { useState, useEffect, Suspense } from "react";
import styles from "./featured.module.css";
import Image from "next/image";
import Link from "next/link";
import { MdSearch } from "react-icons/md";
import FeaturedCard from "./FeaturedCard";
import Pagination from "../pagination/Pagination";
import { useSearchParams } from "next/navigation";
import SubscribeModal from "../subscribeModal/SubscribeModal";
import LoadingPlaceholder from "./LoadingPlaceholder";
import { getCurrentAdvert } from "@/utils/advert";

const POSTS_PER_PAGE = 8;

const extractImageFromContent = (content) => {
  try {
    if (!content) return null;

    const contentString =
      typeof content === "string" ? content : JSON.stringify(content);

    const imgTagMatch = contentString.match(/<img[^>]+src="([^">]+)"/);
    if (imgTagMatch && imgTagMatch[1]) {
      return imgTagMatch[1];
    }

    const otherPatterns = [
      /https?:\/\/\S+\.(?:jpg|jpeg|gif|png|webp)/, // Direct URLs
    ];

    for (const pattern of otherPatterns) {
      const match = contentString.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  } catch (error) {
    console.error("Error extracting image from content:", error);
    return null;
  }
};

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

const Featured = ({
  page,
  initialAllPosts,
  initialLatestPosts,
  initialTopPosts,
  initialHasNext,
}) => {
  const [state, setState] = useState({
    allPosts: initialAllPosts || [],
    latestPosts: initialLatestPosts || [],
    topPosts: initialTopPosts || [],
  });

  const [hasNext, setHasNext] = useState(initialHasNext ?? false);

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);

  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const currentPage = parseInt(pageParam, 10) || page || 1;

  // Check for first visit using localStorage
  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");
    if (!hasVisited) {
      setShowModal(true);
      localStorage.setItem("hasVisited", "true");
    }
  }, []);

  // Handle search / pagination on the client
  useEffect(() => {
    if (debouncedSearch.trim().length > 0) {
      const filtered = state.allPosts.filter((post) =>
        post?.title?.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
      setState((prev) => ({
        ...prev,
        latestPosts: filtered,
      }));
      // When searching, we don't really paginate across pages,
      // so hasNext can be false during search if you want
      setHasNext(false);
    } else {
      const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
      const endIndex = startIndex + POSTS_PER_PAGE;
      setState((prev) => ({
        ...prev,
        latestPosts: prev.allPosts.slice(startIndex, endIndex),
      }));
      setHasNext(initialHasNext);
    }
  }, [debouncedSearch, currentPage, state.allPosts, initialHasNext]);

  const hasPrev = currentPage > 1;

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

  const currentAdvert = getCurrentAdvert();

  return (
    <div className={styles.container}>
      <div className={styles.advertsContainer}>
        <div className={styles.imageadvert}>
          <Image
            src={currentAdvert.gif1}
            alt="advert"
            fill
            className={styles.image}
          />
        </div>
        <Link href={currentAdvert.link} className={styles.advert}>
          {currentAdvert.name}
        </Link>
      </div>
      <div className={styles.post}>
        <div className={styles.textContainer1}>
          <h2 className={styles.latestPostsTitle}>Latest Articles</h2>
          <div className={styles.responsiveDivider}>
            <div className={styles.line}></div>
            <span className={styles.dividerIcon}>✦</span>
            <div className={styles.line}></div>
          </div>
          <Suspense fallback={<LoadingPlaceholder count={8} />}>
            {filteredPosts && filteredPosts.length > 0 ? (
              filteredPosts.map((post, index) => {
                const first =
                  Array.isArray(post.filtered_images) &&
                  post.filtered_images.length
                    ? post.filtered_images[0]
                    : null;

                const filteredUrl =
                  typeof first === "string"
                    ? first
                    : first?.url || first?.src || null;

                const imageFromContent = extractImageFromContent(post.content);

                const imageToUse =
                  filteredUrl ||
                  imageFromContent ||
                  post.image ||
                  "/azbyte.jpeg";

                const postDate = post.isRssPost
                  ? post.isoDate || post.pubDate || post.date
                  : post.date;

                return (
                  <React.Fragment key={post.isRssPost ? post.guid : post._id}>
                    <FeaturedCard
                      postImg={imageToUse}
                      postTitle={post.title}
                      postDesc={
                        post.description ||
                        post.desc ||
                        "No description available"
                      }
                      postAuthor={post.author}
                      postDate={postDate}
                      postTopic={post.isRssPost ? "RSS Feed" : post.topic}
                      postId={post.isRssPost ? post.guid : post.id}
                      isRssPost={post.isRssPost}
                      rssLink={post.isRssPost ? post.link : null}
                    />

                    {index === 3 && currentAdvert && (
                      <div className={styles.middleAdContainer}>
                        <Link href={currentAdvert.link}>
                          <Image
                            src={currentAdvert.gif1}
                            alt={currentAdvert.name}
                            width={0}
                            height={0}
                            sizes="100vw"
                            className={styles.middleAdImage}
                          />
                        </Link>
                        <div className={styles.middleAdText}>
                          {currentAdvert.name}
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <div>No articles found.</div>
            )}
          </Suspense>

          <Pagination page={currentPage} hasPrev={hasPrev} hasNext={hasNext} />
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
              src={currentAdvert.gif2}
              alt="advert"
              width={100}
              height={100}
              className={styles.advertImg}
            />
            <Link className={styles.ads_name} href={currentAdvert.link}>
              {currentAdvert.name}
            </Link>
          </div>
          <div>
            <h3>Top Articles</h3>
            <div style={{ display: "flex", width: "100%" }}>
              <div
                style={{
                  flex: "0 0 25%",
                  borderBottom: "3px solid #0B73B1",
                }}
              ></div>
              <div
                style={{ flex: "1", borderBottom: "2px solid #0B73B1" }}
              ></div>
            </div>
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
                <li>No top articles found.</li>
              )}
            </ol>
          </div>
          <div className={styles.advertImgContainer}>
            <Image
              src={currentAdvert.gif3}
              alt="advert"
              width={100}
              height={100}
              className={styles.advertImg}
            />
            <Link className={styles.ads_name} href={currentAdvert.link}>
              {currentAdvert.name}
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
          <div className={styles.advertImgContainer}>
            <Image
              src={currentAdvert.gif2}
              alt="advert"
              width={100}
              height={100}
              className={styles.advertImg}
            />
            <Link className={styles.ads_name} href={currentAdvert.link}>
              {currentAdvert.name}
            </Link>
          </div>
        </div>
      </div>
      <div>
        <SubscribeModal show={showModal} onClose={() => setShowModal(false)} />
      </div>
    </div>
  );
};

export default Featured;
