// app/rss/[topic]/page.js
"use client";
import { useEffect, useState } from "react";
import styles from "./rssfeed.module.css";
import Link from "next/link";
import Image from "next/image";
import { MdSearch } from "react-icons/md";

export default function RssFeedPage({ params }) {
  const [rssData, setRssData] = useState([]);
  const [topPosts, setTopPosts] = useState([]);

  useEffect(() => {
    // Retrieve the data from session storage
    const data = sessionStorage.getItem("rssData");
    if (data) {
      setRssData(JSON.parse(data));
    }
  }, []);

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
      }
    }
    fetchTopPosts();
  }, []); // Empty dependency array to run once on component mount

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
          <h1 className={styles.pageTitle}>
            RSS Feed: {decodeURIComponent(params.topic)}
          </h1>
          <div style={{ display: "flex", width: "100%" }}>
            <div
              style={{ flex: "0 0 25%", borderBottom: "3px solid #0B73B1" }}
            ></div>
            <div style={{ flex: "1", borderBottom: "2px solid #0B73B1" }}></div>
          </div>
          <div className={styles.rsspost}>
            <ul className={styles.noListStyle}>
              {rssData.map((item, index) => (
                <li key={index} className={styles.listItem}>
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
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
        </div>
      </div>
    </div>
  );
}
