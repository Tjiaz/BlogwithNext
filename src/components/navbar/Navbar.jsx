"use client";
import React, { useState } from "react";
import styles from "./navbar.module.css";
import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "../themetoggle/ThemeToggle";
import AuthLinks from "../authLinks/AuthLinks";
import { IoMdArrowDropdown } from "react-icons/io";
import { BsTwitterX } from "react-icons/bs";
import { BsLinkedin } from "react-icons/bs";
import { BsFacebook } from "react-icons/bs";
import SubscribeModal from "../subscribeModal/SubscribeModal";

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showBlogMenu, setShowBlogMenu] = useState(false);
  const [showResMenu, setShowResMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  return (
    <div className={styles.container}>
      <div className={styles.social}>
        <Link href="/" className={styles.social_icons}>
          <BsFacebook />
        </Link>

        <Link href="/" className={styles.social_icons}>
          <BsLinkedin />
        </Link>
        <Link href="/" className={styles.social_icons}>
          <BsTwitterX />
        </Link>
        <button
          href="/"
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
        <Image src="/AZBYTEGEMS.png" alt="logo" width={108} height={48} />
      </Link>
      <div className={styles.links}>
        <ThemeToggle />
        <div
          className={styles.dropdown}
          onMouseEnter={() => setShowBlogMenu(true)}
          onMouseLeave={() => setShowBlogMenu(false)}
        >
          <Link href="/" className={styles.link}>
            Blog
            <span className={styles.arrow}>
              <IoMdArrowDropdown />
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
              <IoMdArrowDropdown />
            </span>
          </Link>
          {showMenu && (
            <div className={styles.dropdownMenu}>
              <div className={styles.dropdownColumn}>
                <Link
                  href="/articles/Artificial_intelligence"
                  className={styles.dropdownItem}
                >
                  AI
                </Link>
                <Link
                  href="/articles/career_advice"
                  className={styles.dropdownItem}
                >
                  Career Advice
                </Link>
                <Link
                  href="/articles/computer_vision"
                  className={styles.dropdownItem}
                >
                  Computer Vision
                </Link>
                <Link
                  href="/articles/data_engineer"
                  className={styles.dropdownItem}
                >
                  Data Engineering
                </Link>
                <Link
                  href="/articles/data_science"
                  className={styles.dropdownItem}
                >
                  Data Science
                </Link>
                <Link
                  href="/articles/language_models"
                  className={styles.dropdownItem}
                >
                  Language Models
                </Link>
              </div>
              <div className={styles.dropdownColumn}>
                <Link
                  href="/articles/machine_learning"
                  className={styles.dropdownItem}
                >
                  Machine Learning
                </Link>
                <Link
                  href="/articles/machine_learning_ops"
                  className={styles.dropdownItem}
                >
                  MLOps
                </Link>
                <Link href="/articles/NLP" className={styles.dropdownItem}>
                  NLP
                </Link>
                <Link
                  href="/articles/programming"
                  className={styles.dropdownItem}
                >
                  Programming
                </Link>
                <Link href="/articles/py" className={styles.dropdownItem}>
                  Python
                </Link>
                <Link href="/articles/SQL" className={styles.dropdownItem}>
                  SQL
                </Link>
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
              <IoMdArrowDropdown />
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
  );
};

export default Navbar;
