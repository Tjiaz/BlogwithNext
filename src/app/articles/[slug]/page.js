"use client";
import React, { useState, useEffect } from "react";
import styles from "./article.module.css";
import Image from "next/image";
import Link from "next/link";
import { MdSearch } from "react-icons/md";
import ArticleCard from "./ArticleCard";

const ArticlePage = ({ params }) => {
  const { slug } = params; // Destructure slug from params
  console.log("Article slug:", slug);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topPosts, setTopPosts] = useState([]);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const response = await fetch(`/api/articles/${slug}`);
        const data = await response.json();
        console.log("Fetched data:", data);

        if (Array.isArray(data)) {
          setArticles(data); // If already an array, use it directly
        } else if (typeof data === "object") {
          setArticles([data]);
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
  }, [slug]);

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
  // Log articles to see its structure before rendering
  console.log("Articles state before rendering:", articles);

  return loading ? (
    <div>Loading...</div>
  ) : !articles ? (
    <div>Article not found</div>
  ) : (
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
          <h2 className={styles.head}>{slug}</h2>
          <div style={{ display: "flex", width: "100%" }}>
            <div
              style={{ flex: "0 0 25%", borderBottom: "3px solid #0B73B1" }}
            ></div>
            <div style={{ flex: "1", borderBottom: "2px solid #0B73B1" }}></div>
          </div>

          <div className={styles.postItem}>
            {articles && articles.length > 0 ? (
              articles.map((article) => (
                <div key={article._id}>
                  {/* Display the article using ArticleCard */}
                  <ArticleCard
                    key={article._id}
                    postImg={
                      article.filtered_images &&
                      article.filtered_images.length > 0
                        ? article.filtered_images[0] // Display the first image
                        : "/default-image.png" // Fallback image if none exists
                    }
                    postTitle={
                      <Link href={`/article_details/${article._id}`}>
                        {article.title}
                      </Link>
                    }
                    postDesc={article.description}
                    postAuthor={article.author}
                    postDate={article.date}
                  />
                </div>
              ))
            ) : (
              <div>No articles found.</div>
            )}
          </div>
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
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Your Email"
            />
            <button href="/" className={styles.signupbutton}>
              sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;
