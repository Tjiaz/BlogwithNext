"use client";
import React, { useEffect, useState } from "react";
import styles from "./datasets.module.css";
import Image from "next/image";
import Link from "next/link";
import { MdSearch } from "react-icons/md";
import datasets from "@/Data2";

const DatasetPage = () => {
  const [latestPosts, setLatestPosts] = useState([]);

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
          <h1 className={styles.head}>
            Datasets for Data Science, Machine Learning, AI & Analytics
          </h1>

          <div className={styles.socialmedialinks}>
            <a href="#">
              <img src="/facebook.png" alt="" className={styles.socialmedia} />
            </a>
            <a href="#">
              <img src="/twitter.png" alt="" className={styles.socialmedia} />
            </a>
            <a href="#">
              <img src="/instagram.png" alt="" className={styles.socialmedia} />
            </a>
            <a href="#">
              <img src="/youtube.png" alt="" className={styles.socialmedia} />
            </a>
            <a href="#">
              <img src="/reddit.png" alt="" className={styles.socialmedia} />
            </a>
          </div>
          <hr style={{ color: "#bbbbbb" }} />
          <h2 className={styles.lightText}>
            <strong className={styles.boldText}>AzByteGems</strong> subscribers
            have access to the{" "}
            <strong className={styles.boldText}>WorldData.AI Partners</strong>{" "}
            Check out the world’s largest external curated data platform,
            integrating data from all leading global sources.
          </h2>

          <h2 style={{ textAlign: "center" }}>Data Repositories</h2>
          <div style={{ display: "flex", width: "100%" }}>
            <div
              style={{ flex: "0 0 25%", borderBottom: "2.5px solid #0B73B1" }}
            ></div>
            <div style={{ flex: "1", borderBottom: "2px solid #0B73B1" }}></div>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          ></div>
          {datasets.map((dataset) => (
            <div
              key={dataset.id}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "20px",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            >
              <div key={dataset.id}>
                <a
                  href={dataset.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  <h3
                    style={{
                      margin: "0 0 10px",
                      color: "#0B73B1",
                      cursor: "pointer",
                    }}
                  >
                    {dataset.name}
                  </h3>
                </a>
                <p style={{ margin: "0 0 10px", color: "#555" }}>
                  {dataset.description}
                </p>
              </div>
            </div>
          ))}
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

export default DatasetPage;
