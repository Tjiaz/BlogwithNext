"use client";
import React, { useState, useEffect } from "react";
import styles from "./blogPage.module.css";
import Image from "next/image";
import Link from "next/link";
import { MdSearch } from "react-icons/md";
import ToppostCard from "./ToppostCard";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaRedditSquare,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";

const BlogPage = () => {
  const [loading, setLoading] = useState(true);
  const [topPosts, setTopPosts] = useState([]);
  const [latestPosts, setLatestPosts] = useState([]);
  const [yearPosts, setYearPosts] = useState([]);

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
        setLoading(false);
      }
    }
    fetchTopPosts();
  }, []); // Empty dependency array to run once on component mount

  useEffect(() => {
    async function fetchArticles() {
      try {
        const response = await fetch(`/api/latest_articles`);
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
  }, []);

  useEffect(() => {
    async function fetchYearlyArticles() {
      try {
        const response = await fetch(`/api/top_post_years`);
        const data = await response.json();

        if (Array.isArray(data)) {
          setYearPosts(data); // If already an array, use it directly
        } else {
          console.error("Unexpected data format", data);
        }
      } catch (error) {
        console.error("Failed to fetch articles", error);
      } finally {
        setLoading(false);
      }
    }
    fetchYearlyArticles();
  }, []);

  return loading ? (
    <div className={styles.spinner}></div>
  ) : !topPosts ? (
    <div>top posts not found</div>
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
      <div className={styles.post}>
        <div className={styles.textContainer1}>
          <h1 className={styles.head}>Top posts</h1>

          <div className={styles.socialmedialinks}>
            <a href="#" className={styles.socialmedia}>
              <FaFacebookF />
            </a>
            <a href="#" className={styles.socialmedia}>
              <FaTwitter />
            </a>
            <a href="#" className={styles.socialmedia}>
              <FaLinkedinIn />
            </a>
            <a href="#" className={styles.socialmedia}>
              <FaYoutube />
            </a>
            <a href="#" className={styles.socialmedia}>
              <FaRedditSquare />
            </a>
          </div>
          <hr />
          <h2 style={{ textAlign: "center" }}>Current Top Posts</h2>
          <div style={{ display: "flex", width: "100%" }}>
            <div
              style={{ flex: "0 0 25%", borderBottom: "2.5px solid #0B73B1" }}
            ></div>
            <div style={{ flex: "1", borderBottom: "2px solid #0B73B1" }}></div>
          </div>
          <div className={styles.postItem}>
            {topPosts && topPosts.length > 0 ? (
              topPosts.map((post) => (
                <div key={post.id}>
                  {/* Display the article using ArticleCard */}
                  <ToppostCard
                    key={post.id}
                    postTitle={
                      <Link href={`/article_details/${post.id}`}>
                        {post.title}
                      </Link>
                    }
                  />
                </div>
              ))
            ) : (
              <div>No articles found.</div>
            )}
          </div>
          <div className={styles.postbyyear}>
            <h2 style={{ textAlign: "center", marginBottom: "0.5rem" }}>
              Top Posts By Year
            </h2>
            <div style={{ display: "flex", width: "100%" }}>
              <div
                style={{ flex: "0 0 25%", borderBottom: "2.5px solid #0B73B1" }}
              ></div>
              <div
                style={{
                  flex: "1",
                  borderBottom: "2px solid #0B73B1",
                }}
              ></div>
            </div>

            {yearPosts.map((yearData) => (
              <div
                key={yearData.year}
                style={{ marginBottom: "2rem" }}
                className={styles.yearlyArticle}
              >
                <h3>Top Posts of {yearData.year}</h3>
                {yearData.articles.length > 0 ? (
                  <ul className={styles.noListStyle}>
                    {yearData.articles.map((article) => (
                      <li
                        key={article.id}
                        style={{ marginBottom: "1rem" }}
                        className={styles.yearlistItem}
                      >
                        <h4>{article.title}</h4>
                        <p>{article.description}</p>
                        <p>
                          <strong>Author:</strong> {article.author}
                        </p>
                        <p>
                          <strong>Date:</strong>{" "}
                          {new Date(article.date).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Topic:</strong> {article.topic}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No articles available for {yearData.year}.</p>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", width: "100%" }}>
            <div
              style={{ flex: "0 0 25%", borderBottom: "2.5px solid #0B73B1" }}
            ></div>
            <div style={{ flex: "1", borderBottom: "2px solid #0B73B1" }}></div>
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
              src="/ads2.gif"
              alt="advert"
              width={100}
              height={100}
              className={styles.advertImg}
            />
            <Link href="/">Google-bigquery</Link>
          </div>
          <div>
            <h3>Latest Posts</h3>
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
              {latestPosts && latestPosts.length > 0 ? (
                latestPosts.map((post) => (
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

export default BlogPage;
