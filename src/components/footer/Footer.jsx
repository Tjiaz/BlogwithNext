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
          <Image src="/AZbytegems2.png" alt="azbytegems" width={108} height={48} />
          
        </div>
        <p className={styles.date}>
        <p>&copy; <span className={styles.currentYear}>{currentYear}</span>  All rights reserved.</p>
        </p>
        <div className={styles.social}>
        <Link href="/" className={styles.social_icons}><BsFacebook/></Link>
        <Link href="/" className={styles.social_icons}><BsLinkedin/></Link>
        <Link href="/" className={styles.social_icons}><BsTwitterX /></Link>
        </div>
      </div>
      <div className={styles.links}>
        <div className={styles.list}>
          <span className={styles.listTitle}>Links</span>
          
          
          <Link href="/">About</Link>
         
          <Link href="/">Contact</Link>
         
        </div>
        <div className={styles.list}>
          <span className={styles.listTitle}>Tags</span>
          <Link href="/">Privacy</Link>
          <Link href="/">Terms of Service</Link>
          <Link href="/">Advertise</Link>
          
        </div>
       
      </div>
    </div>
  );
};

export default Footer;
