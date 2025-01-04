"use client";
import React, { useState, useEffect } from "react";
import styles from "../resources.module.css";

import Image from "next/image";
import Link from "next/link";
import { MdSearch } from "react-icons/md";

const Page = () => {
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
          <h1 className={styles.head}>Tech Briefs</h1>

          <div className={styles.socialmedialinks}>
            <a href="#">
              <Image
                src="/facebook.png"
                alt=""
                className={styles.socialmedia}
                width={24}
                height={24}
              />
            </a>
            <a href="#">
              <Image
                src="/twitter.png"
                alt=""
                width={24}
                height={24}
                className={styles.socialmedia}
              />
            </a>
            <a href="#">
              <Image
                src="/instagram.png"
                width={24}
                height={24}
                alt=""
                className={styles.socialmedia}
              />
            </a>
            <a href="#">
              <Image
                src="/youtube.png"
                alt=""
                width={24}
                height={24}
                className={styles.socialmedia}
              />
            </a>
            <a href="#">
              <Image
                src="/reddit.png"
                alt=""
                width={24}
                height={24}
                className={styles.socialmedia}
              />
            </a>
          </div>
          <hr style={{ color: "#bbbbbb" }} />
          <p className={styles.lightText}>
            {" "}
            <Link href="/">
              Everything You Need to Know About MLOps: AzByteGems Tech Brief
            </Link>{" "}
          </p>
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
          <div className={styles.advertImageContainer}>
            <Image
              src="/dummy_Image.png"
              alt="advert"
              width={100}
              height={100}
              className={styles.advertImage}
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
          <div className={styles.advertImageContainer}>
            <Image
              src="/dummy_Image.png"
              alt="advert"
              width={100}
              height={100}
              className={styles.advertImage}
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

export default Page;
