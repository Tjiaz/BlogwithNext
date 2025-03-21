"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "./authLinks.module.css";
import { signOut, useSession } from "next-auth/react";

import { MdSearch } from "react-icons/md";
import { RiArrowDropDownLine } from "react-icons/ri";
import { BsRss } from "react-icons/bs";
import { useRouter } from "next/navigation";
import { topicFeeds } from "@/config/topicFeeds";
import { isAdminEmail } from "@/config/admin";

const AuthLinks = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const { data: session, status } = useSession();

  // Check if user's email is in the admin list

  // Add this console.log to debug
  console.log("Session status:", status);
  console.log("Session data:", session);

  // Use the hardcoded array for testing
  const isAdmin = session?.user?.email && isAdminEmail(session.user.email);

  // Close menus and reset state
  const closeAllMenus = () => {
    setOpen(false);
    setActiveMenu(null);
    setShowSearch(false);
  };

  // Handle menu toggle
  const toggleMenu = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  // Close the menu when the screen width is larger than 640px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 640) {
        closeAllMenus();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Close menu when a link is clicked
  const handleLinkClick = () => {
    closeAllMenus();
  };

  const handleRssClick = async (topic, feedUrl) => {
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
      router.push(`/rssfeed/${encodeURIComponent(topic)}`);
      // Close the mobile menu after navigation
      closeAllMenus();
    } catch (error) {
      console.error("Error fetching RSS feed:", error);
    }
  };

  return (
    <>
      {status === "unauthenticated" ? (
        <Link href="/login" className={styles.link}>
          Login
        </Link>
      ) : (
        <>
          <Link href="/write" className={styles.link}>
            Write
          </Link>
          {isAdmin && (
            <button
              className={`${styles.link} ${styles.adminLink}`}
              onClick={(e) => {
                e.preventDefault();

                router.push("/admin/newsletter");
              }}
            >
              Newsletter
            </button>
          )}
          <span className={styles.link} onClick={signOut}>
            Logout
          </span>
        </>
      )}
      <div className={styles.topContainer}>
        <MdSearch
          className={styles.searchIcon}
          onClick={() => setShowSearch(!showSearch)}
        />
        <div className={styles.burger} onClick={() => setOpen(!open)}>
          <div className={styles.line}></div>
          <div className={styles.line}></div>
          <div className={styles.line}></div>
        </div>
      </div>
      {showSearch && (
        <div className={styles.searchContainer}>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              className={`${styles.searchInput2} ${styles.showSearch}`}
              placeholder="Search AzByteGems..."
            />
            <MdSearch className={styles.searchIconInsideInput} />
          </div>
        </div>
      )}
      {open && (
        <div
          className={`${styles.responsiveMenu} ${!open ? styles.hidden : ""}`}
        >
          {/* Blog Dropdown */}
          <div className={styles.menuLink} onClick={() => toggleMenu("blog")}>
            Blog
            <span className={styles.arrow}>
              <RiArrowDropDownLine />
            </span>
          </div>
          {activeMenu === "blog" && (
            <div className={styles.dropdownMenu}>
              <Link
                href="/blog"
                className={styles.dropdownItem}
                onClick={handleLinkClick}
              >
                Top post
              </Link>
              <Link
                href="/blog/about"
                className={styles.dropdownItem}
                onClick={handleLinkClick}
              >
                About
              </Link>
            </div>
          )}
          {/* Topics Dropdown */}
          <div className={styles.menuLink} onClick={() => toggleMenu("topics")}>
            Topics
            <span className={styles.arrow}>
              <RiArrowDropDownLine />
            </span>
          </div>
          {activeMenu === "topics" && (
            <div className={styles.dropdownMenu}>
              {[
                { name: "AI", path: "/articles/ai" },
                { name: "Career Advice", path: "/articles/career_advice" },
                { name: "Computer Vision", path: "/articles/computer_vision" },
                {
                  name: "Data Engineering",
                  path: "/articles/data_engineering",
                },
                { name: "Data Science", path: "/articles/data_science" },
                { name: "Language Models", path: "/articles/language_models" },
                {
                  name: "Machine Learning",
                  path: "/articles/machine_learning",
                },
                { name: "MLOps", path: "/articles/mlops" },
                { name: "NLP", path: "/articles/nlp" },
                { name: "Programming", path: "/articles/programming" },
                { name: "Python", path: "/articles/python" },
                { name: "SQL", path: "/articles/sql" },
              ].map((topic) => (
                <div key={topic.name} className={styles.mobileTopicItem}>
                  <Link
                    href={topic.path}
                    className={styles.dropdownItem}
                    onClick={handleLinkClick}
                  >
                    {topic.name}
                  </Link>
                  <button
                    onClick={() => handleRssClick(topic.name)}
                    className={styles.mobileRssButton}
                    aria-label={`RSS feed for ${topic.name}`}
                  >
                    <BsRss />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Datasets Link */}
          <Link
            href="/datasets"
            className={styles.menuLink}
            onClick={handleLinkClick}
          >
            Datasets
          </Link>
          {/* Resources Dropdown */}
          <div
            className={styles.menuLink}
            onClick={() => toggleMenu("resources")}
          >
            Resources
            <span className={styles.arrow}>
              <RiArrowDropDownLine />
            </span>
          </div>
          {activeMenu === "resources" && (
            <div className={styles.dropdownMenu}>
              <Link
                href="/resources/cheatsheets"
                className={styles.dropdownItem}
                onClick={handleLinkClick}
              >
                Cheat Sheets
              </Link>
              <Link
                href="/resources/recommendations"
                className={styles.dropdownItem}
                onClick={handleLinkClick}
              >
                Recommendations
              </Link>
              <Link
                href="/resources/techbriefs"
                className={styles.dropdownItem}
                onClick={handleLinkClick}
              >
                Tech Briefs
              </Link>
            </div>
          )}

          {status === "unauthenticated" ? (
            <Link
              href="/login"
              className={styles.menuLink}
              onClick={handleLinkClick}
            >
              Login
            </Link>
          ) : (
            <>
              <Link
                href="/write"
                className={styles.menuLink}
                onClick={handleLinkClick}
              >
                Write
              </Link>
              {isAdmin && (
                <Link href="/admin/newsletter" className={styles.menuLink}>
                  Newsletter
                </Link>
              )}
              <span
                className={styles.menuLink}
                onClick={() => {
                  signOut();
                  handleLinkClick();
                }}
              >
                Logout
              </span>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AuthLinks;
