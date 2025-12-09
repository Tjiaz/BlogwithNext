"use client";
import React, { useState, useEffect } from "react";
import styles from "./contact.module.css";
import {
  FaFacebookF,
  FaTwitter,
  FaYoutube,
  FaReddit,
  FaLinkedin,
} from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { MdSearch } from "react-icons/md";

const Page = () => {
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
          <Image src="/ads.gif" alt="" fill className={styles.image} />
        </div>
        <Link href="/" className={styles.advert}>
          Google-bigquery
        </Link>
      </div>
      <div className={styles.post}>
        <div className={styles.textContainer1}>
          <h1 className={styles.head}>Contact</h1>

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
              href="https://linkedin.com/azbytegems"
              className={`${styles.socialmedia} ${styles.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <FaLinkedin />
            </a>
            <a
              href="#"
              className={`${styles.socialmedia} ${styles.youtube}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <FaYoutube />
            </a>
            <a
              href="#"
              className={`${styles.socialmedia} ${styles.reddit}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Reddit"
            >
              <FaReddit />
            </a>
          </div>
          <hr style={{ borderColor: "rgba(0, 0, 0, 0.1)", margin: "20px 0" }} />
          <div>
            <h2>Ads, Email Blasts, and Promotions</h2>
            <p>
              For rates on banners, email blasts, or other promotions please
              contact{" "}
              <a href="mailto:info@azbytegems.com">info@azbytegems.com</a>.
            </p>
            <h2>Job Ads</h2>
            <p>To place a free short job listing, see KDnuggets Jobs page.</p>
            <h2>Guest Blogs</h2>
            <p>
              We write about AI, Analytics, Big Data, Data Science, and Machine
              Learning, and welcome high quality blogs to bring to our hundreds
              of thousands monthly visitors and subscribers and followers on
              social media.
            </p>
            <p>Please follow submission guidelines.</p>
            <h2>About Azbyte Gems</h2>
            <p>
              Azbyte Gems™️ is a leading site on AI, Analytics, Big Data, Data
              Mining, Data Science, and Machine Learning.
            </p>
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
          <div className={styles.advertImageContainer}>
            <Image
              src="/ads2.gif"
              alt="advert"
              width={300}
              height={250}
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
          <div className={styles.advertImageContainer}>
            <Image
              src="/ads2.gif"
              alt="advert"
              width={300}
              height={250}
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
