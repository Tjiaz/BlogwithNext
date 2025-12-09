"use client";
import React, { useState } from "react";
import styles from "./navbar.module.css";
import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "../themetoggle/ThemeToggle";
import AuthLinks from "../authLinks/AuthLinks";
import { BsTwitterX, BsLinkedin, BsFacebook, BsRss } from "react-icons/bs";
import SubscribeModal from "../subscribeModal/SubscribeModal";
import { RiArrowDropDownLine } from "react-icons/ri";
import { useRouter } from "next/navigation";

// import { TOPIC_RSS_FEEDS } from "@/config/rssFeeds";

const Navbar = () => {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showBlogMenu, setShowBlogMenu] = useState(false);
  const [showResMenu, setShowResMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Example RSS feed URLs for each topic
  const topicFeeds = {
    AI: "https://example.com/rss/ai",
    "Career Advice": "https://example.com/rss/career-advice",
    "Computer Vision": "https://learnopencv.com/feed/",
    "Data Engineering": "https://www.kdnuggets.com/feed",
    "Data Science": "https://towardsdatascience.com/feed/",
    "Language Models": "https://example.com/rss/language-models",
    "Machine Learning": "https://clear.ml/feed",
    MLOps: "https://www.akira.ai/blog/rss.xml",
    NLP: "https://www.analyticsvidhya.com/blog/category/nlp/feed/",
    Programming: "https://stackoverflow.blog/feed/",
    Python: "https://www.blog.pythonlibrary.org/feed/",
    SQL: "https://www.sqlservercentral.com/blogs/feed",
  };

  const handleRssClick = async (topic) => {
    try {
      const response = await fetch(`/api/rssfeed/${encodeURIComponent(topic)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch RSS feed");
      }
      const data = await response.json();
      console.log("RSS Feed Data:", data);

      // Ensure the topic is a string
      if (typeof topic !== "string") {
        throw new Error("Topic must be a string");
      }

      sessionStorage.setItem("rssData", JSON.stringify(data));

      // Navigate to the new page with only the topic in the URL
      router.push(`/rssfeed/${topic}`);
    } catch (error) {
      console.error("Error fetching RSS feed:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.navbarContent}>
        <div className={styles.social}>
          <Link
            href="https://facebook.com/azbytegems"
            className={styles.social_icons}
          >
            <BsFacebook />
          </Link>
          <Link
            href="https://linkedin.com/azbytegems"
            className={styles.social_icons}
          >
            <BsLinkedin />
          </Link>
          <Link href="https://x.com/azbytegems" className={styles.social_icons}>
            <BsTwitterX />
          </Link>
          <button
            className={styles.join_newsletter_button}
            onClick={() => setShowModal(true)}
          >
            join newsletter
          </button>
          {showModal && (
            <SubscribeModal
              onClose={() => setShowModal(false)}
              show={showModal}
            />
          )}
        </div>
        <Link className={styles.logo} href="/">
          <Image src="/AZBYTEGEMS.png" alt="logo" width={174} height={52} />
        </Link>
        <div className={styles.links}>
          <div className={styles.themeToggleContainer}>
            <ThemeToggle />
          </div>
          <div
            className={styles.dropdown}
            onMouseEnter={() => setShowBlogMenu(true)}
            onMouseLeave={() => setShowBlogMenu(false)}
          >
            <Link href="/" className={styles.link}>
              Blog
              <span className={styles.arrow}>
                <RiArrowDropDownLine />
              </span>
            </Link>
            {showBlogMenu && (
              <div className={styles.dropdownMenu}>
                <div className={styles.dropdownColumn}>
                  <Link href="/blog" className={styles.dropdownItem}>
                    Top Posts
                  </Link>
                  <Link href="/blog/about" className={styles.dropdownItem}>
                    About
                  </Link>
                </div>
              </div>
            )}
          </div>
          <div
            className={styles.dropdown}
            onMouseEnter={() => setShowMenu(true)}
            onMouseLeave={() => setShowMenu(false)}
          >
            <Link href="/" className={styles.link}>
              Topics
              <span className={styles.arrow}>
                <RiArrowDropDownLine />
              </span>
            </Link>
            {showMenu && (
              <div className={styles.dropdownMenu}>
                <div className={styles.dropdownColumn}>
                  {Object.entries(topicFeeds).map(([topic, feedUrl]) => (
                    <div key={topic} className={styles.dropdownItem}>
                      <Link
                        href={`/articles/${topic
                          .toLowerCase()
                          .replace(/ /g, "_")}`}
                      >
                        {topic}
                      </Link>
                      <button
                        onClick={() => handleRssClick(topic)}
                        className={styles.rssLink}
                      >
                        <BsRss />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Link href="/datasets" className={styles.link}>
            Datasets
          </Link>
          <div
            className={styles.dropdown}
            onMouseEnter={() => setShowResMenu(true)}
            onMouseLeave={() => setShowResMenu(false)}
          >
            <Link href="/" className={styles.link}>
              Resources
              <span className={styles.arrow}>
                <RiArrowDropDownLine />
              </span>
            </Link>
            {showResMenu && (
              <div className={styles.dropdownMenu}>
                <div className={styles.dropdownColumn}>
                  <Link
                    href="/resources/cheatsheets"
                    className={styles.dropdownItem}
                  >
                    Cheat Sheets
                  </Link>
                  <Link
                    href="/resources/recommendations"
                    className={styles.dropdownItem}
                  >
                    Recommendations
                  </Link>
                  <Link
                    href="/resources/techbriefs"
                    className={styles.dropdownItem}
                  >
                    Tech Briefs
                  </Link>
                </div>
              </div>
            )}
          </div>
          <AuthLinks />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
