"use client";
import React, { useState, useEffect } from "react";
import styles from "../blogPage.module.css";
import Image from "next/image";
import Link from "next/link";
import { MdSearch } from "react-icons/md";
import profiles from "@/Data";
import { getCurrentAdvert } from "@/utils/advert";
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
  const currentAdvert = getCurrentAdvert();

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
      <div className={styles.advertsContainer}>
        <div className={styles.imageadvert}>
          <Image
            src={currentAdvert.gif1}
            alt="advert"
            fill
            className={styles.image}
          />
        </div>
        <Link href={currentAdvert.link} className={styles.advert}>
          {currentAdvert.name}
        </Link>
      </div>
      <div className={styles.post}>
        <div className={styles.textContainer1}>
          <h1 className={styles.head}>About AzByteGems</h1>

          <div className={styles.socialmedialinks}>
            <a
              href="https://www.facebook.com/profile.php?id=61572544476793"
              className={styles.socialmedia}
            >
              <FaFacebookF />
            </a>
            <a href="https://x.com/azbytegems" className={styles.socialmedia}>
              <FaTwitter />
            </a>
            <a
              href="https://www.linkedin.com/company/106269314/admin/dashboard/"
              className={styles.socialmedia}
            >
              <FaLinkedinIn />
            </a>
            <a
              href="https://www.youtube.com/channel/UCAzNdfK8i3WcStsAQjGI9-Q"
              className={styles.socialmedia}
            >
              <FaYoutube />
            </a>
            <a
              href="https://www.reddit.com/user/DinnerDesperate3392/"
              className={styles.socialmedia}
            >
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
          <div style={{ marginTop: "30px" }}>
            <h2 style={{ fontWeight: "bold", marginBottom: "10px" }}>
              Advertising
            </h2>
            <p>
              AzByteGems only accepts advertising relevant to Data Science,
              Machine Learning, AI and Analytics products or services. Contact{" "}
              <a href="mailto:editor@azbytegems.com">editor@azbytegems.com</a>{" "}
              for rates and options.
            </p>
            <h2 style={{ fontWeight: "bold", margin: "20px 0 10px" }}>
              Subscription
            </h2>
            <p>
              AzByteGems has reached over 1,000 unique monthly visitors in
              September 2024, and currently has over 360 subscribers via email,
              Twitter, LinkedIn and Facebook. Get your free AzByteGems email
              subscription here. AzByteGems News is a summary of interesting
              stories on AzByteGems, and is emailed 3-4 times a month, usually
              on Wednesday. You can also follow{" "}
              <a
                href="https://twitter.com/azbytegems"
                target="_blank"
                rel="noopener noreferrer"
              >
                @AzByteGems on Twitter
              </a>
              , like the{" "}
              <a
                href="https://facebook.com/azbytegems"
                target="_blank"
                rel="noopener noreferrer"
              >
                AzByteGems Facebook page
              </a>
              , or join the{" "}
              <a
                href="https://linkedin.com/company/azbytegems"
                target="_blank"
                rel="noopener noreferrer"
              >
                AzByteGems LinkedIn Group
              </a>
              .
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
          <div className={styles.advertImgContainer}>
            <Image
              src={currentAdvert.gif2}
              alt="advert"
              width={100}
              height={100}
              className={styles.advertImg}
            />
            <Link href={currentAdvert.link}>{currentAdvert.name}</Link>
          </div>
          <div>
            <h3>Latest Articles</h3>
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
              src={currentAdvert.gif3}
              alt="advert"
              width={100}
              height={100}
              className={styles.advertImg}
            />
            <Link href="/">{currentAdvert.name}</Link>
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
