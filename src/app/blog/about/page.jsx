"use client";
import React, { useState, useEffect } from "react";
import styles from "../blogPage.module.css";
import Image from "next/image";
import Link from "next/link";
import { MdSearch } from "react-icons/md";
import profiles from "@/Data";
import {
  FaEnvelope,
  FaFacebookF,
  FaGithubSquare,
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
          <Image src="/ads.gif" alt="advert" fill className={styles.image} />
        </div>
        <Link href="/" className={styles.advert}>
          Google-bigquery
        </Link>
      </div>
      <div className={styles.post}>
        <div className={styles.textContainer1}>
          <h1 className={styles.head}>About AzByteGems</h1>

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
          <h2 className={styles.lightText}>
            <strong className={styles.boldText}>AzByteGems</strong> an emerging
            global brand that focuses on{" "}
            <strong className={styles.boldText}>
              Data Science, Machine Learning, AI, and Analytics.
            </strong>
            Our mission is to create a world where green, sustainable, and
            inclusive practices are valued and encouraged.
          </h2>

          <h2 style={{ textAlign: "center" }}>Our Team</h2>
          <div style={{ display: "flex", width: "100%" }}>
            <div
              style={{ flex: "0 0 25%", borderBottom: "2.5px solid #0B73B1" }}
            ></div>
            <div style={{ flex: "1", borderBottom: "2px solid #0B73B1" }}></div>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {profiles.map((profile) => (
              <div
                key={profile.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "20px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
              >
                {/* Profile Image */}
                <Image
                  src={profile.image}
                  alt={profile.name}
                  width={100}
                  height={100}
                  style={{
                    borderRadius: "50%",
                    marginRight: "20px",
                  }}
                />

                {/* Profile Details */}
                <div>
                  <h3 style={{ margin: "0 0 10px" }}>{profile.name}</h3>
                  <p style={{ margin: "0 0 10px", color: "#555" }}>
                    {profile.description}
                  </p>

                  {/* Social Media Links */}
                  <div style={{ display: "flex", gap: "10px" }}>
                    {profile.socialLinks.linkedIn && (
                      <a
                        href={profile.socialLinks.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaLinkedinIn />
                      </a>
                    )}
                    {profile.socialLinks.twitter && (
                      <a
                        href={profile.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaTwitter />
                      </a>
                    )}
                    {profile.socialLinks.github && (
                      <a
                        href={profile.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaGithubSquare />
                      </a>
                    )}
                    {profile.socialLinks.email && (
                      <a href={profile.socialLinks.email}>
                        <FaEnvelope />
                      </a>
                    )}
                  </div>
                </div>
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
              width={100}
              height={100}
              className={styles.advertImg}
            />
            <Link href="/">Google-advert</Link>
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
            <Link href="/">Google-advert</Link>
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
