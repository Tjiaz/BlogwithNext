"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "./authLinks.module.css";
import { signOut, useSession } from "next-auth/react";
import { IoMdArrowDropdown } from "react-icons/io";
import { MdSearch } from "react-icons/md";

const AuthLinks = () => {
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const { status } = useSession();

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

  return (
    <>
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
        {showSearch && (
          <input
            type="text"
            className={`${styles.searchInput} ${styles.showSearch}`}
            placeholder="Search AzByteGems..."
          />
        )}
      </div>
      {open && (
        <div className={styles.responsiveMenu}>
          {/* Blog Dropdown */}
          <div className={styles.menuLink} onClick={() => toggleMenu("blog")}>
            Blog
            <span className={styles.arrow}>
              <IoMdArrowDropdown />
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
              <IoMdArrowDropdown />
            </span>
          </div>
          {activeMenu === "topics" && (
            <div className={styles.dropdownMenu}>
              {[
                { name: "AI", path: "/articles/Artificial_intelligence" },
                { name: "Career Advice", path: "/articles/career_advice" },
                { name: "Computer Vision", path: "/articles/computer_vision" },
                { name: "Data Engineering", path: "/articles/data_engineer" },
                { name: "Data Science", path: "/articles/data_science" },
                { name: "Language Models", path: "/articles/language_models" },
                {
                  name: "Machine Learning",
                  path: "/articles/machine_learning",
                },
                { name: "MLOps", path: "/articles/machine_learning_ops" },
                { name: "NLP", path: "/articles/NLP" },
                { name: "Programming", path: "/articles/programming" },
                { name: "Python", path: "/articles/py" },
                { name: "SQL", path: "/articles/SQL" },
              ].map((topic) => (
                <Link
                  key={topic.name}
                  href={topic.path}
                  className={styles.dropdownItem}
                  onClick={handleLinkClick}
                >
                  {topic.name}
                </Link>
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
              <IoMdArrowDropdown />
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

          {/* Authentication Links
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
          )} */}
        </div>
      )}
    </>
  );
};

export default AuthLinks;
