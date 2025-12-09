"use client";
import React, { useEffect, useState } from "react";
import styles from "./datasets.module.css";
import Image from "next/image";
import Link from "next/link";
import { MdSearch } from "react-icons/md";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaRedditSquare,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import datasets from "@/Data2";

const DatasetPage = () => {
  const [latestPosts, setLatestPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <div className={styles.advertsContainer}>
        <div className={styles.imageadvert}>
          <Image
            src="/Data-science-engineering.jpeg"
            alt=""
            fill
            className={styles.image}
          />
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
            <a
              href="https://www.facebook.com/profile.php?id=61572544476793"
              className={`${styles.socialmedia} ${styles.facebook}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://x.com/azbytegems"
              className={`${styles.socialmedia} ${styles.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <FaTwitter />
            </a>
            <a
              href="#"
              className={`${styles.socialmedia} ${styles.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <FaLinkedinIn />
            </a>
            <a
              href="#"
              className={styles.socialmedia}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <FaYoutube />
            </a>
            <a
              href="#"
              className={styles.socialmedia}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Reddit"
            >
              <FaRedditSquare />
            </a>
          </div>
          <hr className={styles.divider} />
          <h2 className={styles.lightText}>
            <strong className={styles.boldText}>AzByteGems</strong> subscribers
            have access to the{" "}
            <strong className={styles.boldText}>WorldData.AI Partners</strong>{" "}
            Check out the world&apos;s largest external curated data platform,
            integrating data from all leading global sources.
          </h2>

          <h2 className={styles.sectionTitle}>Data Repositories</h2>
          <div className={styles.titleUnderline}></div>
          <div className={styles.datasetsContainer}>
            {datasets.map((dataset) => (
              <div key={dataset.id} className={styles.datasetCard}>
                <a
                  href={dataset.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  <h3 className={styles.datasetTitle}>{dataset.name}</h3>
                </a>
                <p className={styles.datasetDescription}>
                  {dataset.description}
                </p>
              </div>
            ))}
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
              width={300}
              height={250}
              className={styles.advertImg}
            />
            <Link href="/">Adverts</Link>
          </div>
          <div>
            <h3 className={styles.latestPostsTitle}>Latest Posts</h3>
            <div className={styles.titleUnderline}></div>
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
              src="/ads2.gif"
              alt="advert"
              width={300}
              height={250}
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
