"use client";
import React, { useState, useEffect } from "react";
import styles from "../resources.module.css";

import Image from "next/image";
import Link from "next/link";
import { MdSearch } from "react-icons/md";
import {
  FaFacebookF,
  FaFilePdf,
  FaLinkedinIn,
  FaRedditSquare,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";

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
      }
    }
    fetchArticles();
  }, []);
  return (
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
          <h1 className={styles.head}>Cheat Sheets</h1>

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
          <hr style={{ color: "#bbbbbb" }} />
          <div className={styles.cheatsheetContainer}>
            <div className={styles.cheatsheetGrid}>
              <div className={styles.cheatsheetCard}>
                <FaFilePdf size={40} />
                <h3>Python Cheatsheet</h3>
                <p>Complete Python programming reference guide</p>
                <a
                  href="/cheatsheets/python.pdf"
                  download
                  className={styles.downloadBtn}
                >
                  Download PDF
                </a>
              </div>

              <div className={styles.cheatsheetCard}>
                <FaFilePdf size={40} />
                <h3>Bash Cheatsheet</h3>
                <p>Essential Bash commands and syntax</p>
                <a
                  href="/cheatsheets/bash.pdf"
                  download
                  className={styles.downloadBtn}
                >
                  Download PDF
                </a>
              </div>

              <div className={styles.cheatsheetCard}>
                <FaFilePdf size={40} />
                <h3>Git Cheatsheet</h3>
                <p>Common Git commands and workflows</p>
                <a
                  href="/cheatsheets/git.pdf"
                  download
                  className={styles.downloadBtn}
                >
                  Download PDF
                </a>
              </div>

              <div className={styles.cheatsheetCard}>
                <FaFilePdf size={40} />
                <h3>Grep Cheatsheet</h3>
                <p>Key concepts and formulas for grep</p>
                <a
                  href="/cheatsheets/grep.pdf"
                  download
                  className={styles.downloadBtn}
                >
                  Download PDF
                </a>
              </div>
            </div>
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
