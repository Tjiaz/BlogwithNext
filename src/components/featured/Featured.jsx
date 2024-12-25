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
  const [loadingTopPosts, setLoadingTopPosts] = useState(true);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

  // Fetch top 5 articles for the topPosts section
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
    return <div>Loading...</div>;
  }

  const hasPrev = page > 1;
  const hasNext = latestPosts.length === POSTS_PER_PAGE;

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

  return (
    <div className={styles.container}>
      <div className={styles.advertContainer}>
        <div className={styles.imageadvert}>
          <Image src="/p1.jpeg" alt="" fill className={styles.image} />
        </div>
        <Link href="/" className={styles.advert}>
          adverts link
        </Link>
      </div>
      <div className={styles.post}>
        <div className={styles.textContainer1}>
          <h3>Latest Posts</h3>
          <div style={{ display: "flex", width: "100%" }}>
            <div
              style={{ flex: "0 0 25%", borderBottom: "3px solid #0B73B1" }}
            ></div>
            <div style={{ flex: "1", borderBottom: "2px solid #0B73B1" }}></div>
          </div>

          {latestPosts && latestPosts.length > 0 ? (
            latestPosts.map((post) => (
              <FeaturedCard
                key={post._id} // Use post._id for unique key
                postImg={
                  post.filtered_images && post.filtered_images.length > 0
                    ? post.filtered_images[0]
                    : "/default-image.png"
                }
                postTitle={post.title}
                postDesc={post.description}
                postAuthor={post.author}
                postDate={post.date}
                postTopic={post.topic}
                postId={post.id}
              />
            ))
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
              src="/dummy_img.png"
              alt="advert"
              width={100}
              height={100}
              className={styles.advertImg}
            />
            <Link href="/">Adverts</Link>
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
                  <li key={post._id} className={styles.listItem}>
                    <Link href={`/post/${post._id}`}>{post.title}</Link>
                  </li>
                ))
              ) : (
                <li>No top posts found.</li>
              )}
            </ol>
          </div>
          <div className={styles.advertImgContainer}>
            <Image
              src="/dummy_img.png"
              alt="advert"
              width={100}
              height={100}
              className={styles.advertImg}
            />
            <Link href="/">Adverts</Link>
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
        {/* Your existing page content */}
        <h1>Welcome to AzByteGems</h1>

        {/* Modal */}
        <SubscribeModal show={showModal} onClose={() => setShowModal(false)} />
      </div>
    </div>
  );
};

export default Featured;
