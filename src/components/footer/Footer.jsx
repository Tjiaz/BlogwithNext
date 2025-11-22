import React from "react";
import styles from "./footer.module.css";
import Image from "next/image";
import Link from "next/link";
import { BsFacebook, BsLinkedin, BsTwitterX } from "react-icons/bs";
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <div className={styles.logo}>
          <Image
            src="/AZbytegems2.png"
            alt="azbytegems"
            width={174}
            height={52}
          />
        </div>
        <p className={styles.date}>
          <p>
            &copy; <span className={styles.currentYear}>{currentYear}</span> All
            rights reserved.
          </p>
        </p>
      </div>
      <div className={styles.links}>
        <div className={styles.list}>
          <span className={styles.listTitle}>Links</span>

          <Link href="/blog/about">About</Link>

          <Link href="/contact">Contact</Link>
        </div>
        <div className={styles.list}>
          <span className={styles.listTitle}>Tags</span>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
};

export default Footer;
