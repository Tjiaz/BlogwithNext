"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./authLinks.module.css";
import { signOut, useSession } from "next-auth/react";
import { IoMdArrowDropdown } from "react-icons/io";
const AuthLinks = () => {
  const [open, setOpen] = useState(false);
  const [showResMenu, setShowResMenu] = useState(false);
  const[showMenu,setShowMenu]=useState(false)
  const[showBlogMenu,setShowBlogMenu]=useState(false)
  const { status } = useSession();
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
          <span className={styles.link} onClick={signOut}>
            Logout
          </span>
        </>
      )}

      <div className={styles.burger} onClick={() => setOpen(!open)}>
        <div className={styles.line}></div>
        <div className={styles.line}></div>
        <div className={styles.line}></div>
      </div>
      {open && (
        <div className={styles.responsiveMenu}>
        <Link href="/" className={styles.menuLink}>Blog</Link>
        <div 
        className={styles.menuLink} 
        onClick={() => setShowMenu(!showMenu)}
      >
        Topics<span className={styles.arrow}><IoMdArrowDropdown/></span>
      </div>
      {showMenu && (
        <div className={styles.dropdownMenu}>
          <div className={styles.dropdownMenu}>
            <Link href="/" className={styles.dropdownItem}>AI</Link>
            <Link href="/" className={styles.dropdownItem}>Career Advice</Link>
            <Link href="/" className={styles.dropdownItem}>Computer Vision</Link>
            <Link href="/" className={styles.dropdownItem}>Data Engineering</Link>
            <Link href="/" className={styles.dropdownItem}>Data Science</Link>
            <Link href="/" className={styles.dropdownItem}>Language Models</Link>
          </div>
          <div className={styles.dropdownMenu}>
            <Link href="/" className={styles.dropdownItem}>Machine Learning</Link>
            <Link href="/" className={styles.dropdownItem}>MLOps</Link>
            <Link href="/" className={styles.dropdownItem}>NLP</Link>
            <Link href="/" className={styles.dropdownItem}>Programming</Link>
            <Link href="/" className={styles.dropdownItem}>Python</Link>
            <Link href="/" className={styles.dropdownItem}>SQL</Link>
          </div>
        </div>
      )}
         
          <Link href="/" className={styles.menuLink}>Datasets</Link>
          <div 
            className={styles.menuLink} 
            onClick={() => setShowResMenu(!showResMenu)}
          >
            Resources<span className={styles.arrow}><IoMdArrowDropdown/></span>
          </div>
          {showResMenu && (
            <div className={styles.dropdownMenu}>
              <Link href="/" className={styles.dropdownItem}>Cheat Sheets</Link>
              <Link href="/" className={styles.dropdownItem}>Recommendations</Link>
              <Link href="/" className={styles.dropdownItem}>Tech Briefs</Link>
            </div>
          )}
          
          {status === "notautheticated" ? (
            <Link href="/login">Login</Link>
          ) : (
            <>
              <Link href="/write">Write</Link>
              <span className={styles.link}>Logout</span>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AuthLinks;
