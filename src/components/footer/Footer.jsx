import React from "react";
import styles from "./footer.module.css";
import Image from "next/image";
import Link from "next/link";
import { BsFacebook, BsLinkedin, BsTwitterX } from "react-icons/bs";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.container}>
      <div className={styles.content}>
        <div className={styles.info}>
          <div className={styles.logo}>
            <Link href="/">
              <Image
                src="/AZBYTEGEMS.png"
                alt="AzByteGems Logo"
                width={140}
                height={42}
                className={styles.logoImage}
              />
            </Link>
          </div>
          <p className={styles.description}>
            Your source for cutting-edge tech insights and articles
          </p>
          <div className={styles.social}>
            <Link
              href="https://facebook.com/azbytegems"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialIcon}
              aria-label="Facebook"
            >
              <BsFacebook />
            </Link>
            <Link
              href="https://linkedin.com/azbytegems"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialIcon}
              aria-label="LinkedIn"
            >
              <BsLinkedin />
            </Link>
            <Link
              href="https://x.com/azbytegems"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialIcon}
              aria-label="X (Twitter)"
            >
              <BsTwitterX />
            </Link>
          </div>
        </div>
        <div className={styles.links}>
          <div className={styles.list}>
            <span className={styles.listTitle}>Quick Links</span>
            <Link href="/blog/about" className={styles.link}>
              About
            </Link>
            <Link href="/contact" className={styles.link}>
              Contact
            </Link>
            <Link href="/blog" className={styles.link}>
              Blog
            </Link>
          </div>
          <div className={styles.list}>
            <span className={styles.listTitle}>Legal</span>
            <Link href="/privacy" className={styles.link}>
              Privacy Policy
            </Link>
            <Link href="/terms" className={styles.link}>
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
      <div className={styles.copyright}>
        <p>
          &copy; <span className={styles.currentYear}>{currentYear}</span>{" "}
          AzByteGems. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
